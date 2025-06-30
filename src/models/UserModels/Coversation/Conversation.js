const { Schema, model } = require("mongoose");

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    conversationType: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    conversationName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    conversationImage: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    // Settings for the conversation
    settings: {
      muteNotifications: {
        type: Boolean,
        default: false,
      },
      allowMediaSharing: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });
conversationSchema.index({ isActive: 1, lastMessageTime: -1 });

// Ensure participants array has unique values and proper length
conversationSchema.pre("validate", function () {
  if (this.participants && Array.isArray(this.participants)) {
    // Filter out undefined/null values and remove duplicates
    this.participants = [
      ...new Set(
        this.participants
          .filter((p) => p != null) // Remove null/undefined
          .map((p) => (p.toString ? p.toString() : p)) // Handle ObjectId conversion safely
      ),
    ];

    // Validate participant count based on conversation type
    if (this.conversationType === "direct" && this.participants.length !== 2) {
      throw new Error("Direct conversations must have exactly 2 participants");
    }
    if (this.conversationType === "group" && this.participants.length < 2) {
      throw new Error("Group conversations must have at least 2 participants");
    }
  }
});

// Virtual to get other participant in direct conversations
conversationSchema.virtual("otherParticipant").get(function () {
  if (this.conversationType === "direct" && this.participants.length === 2) {
    // This would need the current user ID to determine the "other" participant
    // Will be handled in the application logic
    return null;
  }
  return null;
});

// Static method to find conversation between two users
conversationSchema.statics.findBetweenUsers = function (userId1, userId2) {
  return this.findOne({
    conversationType: "direct",
    participants: { $all: [userId1, userId2] },
  });
};

// Static method to find user's conversations
conversationSchema.statics.findUserConversations = function (
  userId,
  options = {}
) {
  const { page = 1, limit = 20, includeInactive = false } = options;
  const skip = (page - 1) * limit;

  const matchQuery = {
    participants: userId,
    ...(includeInactive ? {} : { isActive: true }),
  };

  return this.find(matchQuery)
    .sort({ lastMessageTime: -1 })
    .skip(skip)
    .limit(limit)
    .populate("participants", "firstName lastName email profile.profilePic");
};

module.exports = model("Conversation", conversationSchema);
