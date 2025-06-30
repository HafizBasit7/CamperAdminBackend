const { Schema, model } = require("mongoose");

const LikeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    camper: {
      type: Schema.Types.ObjectId,

      required: true,
    },
    // Optional: specify what type of content is being liked
    contentType: {
      type: String,
      enum: ["post", "comment", "story", "camper"],
      default: "camper",
    },
  },
  {
    timestamps: true,
    // Ensure one like per user per camper
    indexes: [
      { user: 1, camper: 1 },
      { camper: 1, createdAt: -1 },
    ],
  }
);

// Compound unique index to prevent duplicate likes
LikeSchema.index({ user: 1, camper: 1 }, { unique: true });

module.exports = model("Like", LikeSchema);
