const { Schema } = require("mongoose");

const attachmentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

module.exports = attachmentSchema;
