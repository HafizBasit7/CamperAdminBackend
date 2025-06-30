const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const CommentsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
      minlength: 1,
      trim: true,
    },
    camper: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentsSchema);
