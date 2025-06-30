const { Schema, model } = require("mongoose");

const friendSchema = new Schema(
  {
    participants: {
      type: [Schema.ObjectId],
      ref: "user",
      required: true,
    },
    from: {
      type: Schema.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    // Add a compound key for uniqueness
    participantKey: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Remove the problematic index
// friendSchema.index({participants: 1}, {unique: true}); // Remove this line
friendSchema.index({ participants: 1, from: 1 });
friendSchema.index({ participantKey: 1 }, { unique: true });

// Create a unique key from sorted participants
friendSchema.pre("save", function (next) {
  // Sort participants for consistency
  this.participants.sort();

  // Create a unique key from sorted participant IDs
  this.participantKey = this.participants
    .map((id) => id.toString())
    .sort()
    .join("-");

  next();
});

module.exports = model("friend", friendSchema);
