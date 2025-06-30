const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    receiver: {
      type: Schema.ObjectId,
      required: true,
      ref: "user",
    },
    sender: {
      type: Schema.ObjectId,
      required: true,
      ref: "user",
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    action: {
      type: String,

      default: "null",
    },
  },
  { timestamps: true }
);

module.exports = model("notification", notificationSchema);
