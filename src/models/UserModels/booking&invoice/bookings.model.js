const { Schema, model } = require("mongoose");

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    camper: {
      type: Schema.Types.ObjectId,
      ref: "camper",
      required: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "invoice",
      required: true,
    },
    dateFrom: {
      type: Date,
      required: true,
    },
    dateTo: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    cancelReason: {
      type: String,

      default: "",
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    bookingType: {
      type: String,
      enum: ["direct", "regular"],
      default: "direct",
    },
    acceptStatusForRegularBooking: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    ownerRespondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Optional: prevent overlapping bookings (requires application-level logic)
// bookingSchema.index({ camper: 1, dateFrom: 1, dateTo: 1 });

module.exports = model("booking", bookingSchema);
