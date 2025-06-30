const mongoose = require("mongoose");
const { Schema } = mongoose;

const complaintSchema = new Schema(
  {
    initiator: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "booking",
      default: null,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "camper",
      default: null,
    },
    complaintDetails: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "rejected"],
      default: "open",
    },
    category: {
      type: String,
      enum: ["handoverProtocol", "billing", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    attachments: [{ type: String }],
    responses: [
      {
        responder: { type: Schema.Types.ObjectId, ref: "user" },
        message: { type: String },
        respondedAt: { type: Date, default: Date.now },
      },
    ],

    resolutionNotes: { type: String },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;
