const { Schema, model } = require("mongoose");

const priceBreakdownSchema = new Schema(
  {
    dailyRates: {
      breakdown: [
        {
          date: { type: Date, required: true },
          price: { type: Number, required: true },
          isSpecialRate: { type: Boolean, required: true },
        },
      ],
      subtotal: { type: Number, required: true },
    },
    extras: {
      breakdown: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          priceType: {
            type: String,
            enum: ["perday", "perpackage"],
            required: true,
          },
          quantity: { type: Number, required: true },
          total: { type: Number, required: true },
        },
      ],
      total: { type: Number, required: true },
    },
    fees: {
      cleaningFee: { type: Number, required: true },
      deposit: { type: Number, required: true },
    },
    summary: {
      rentalSubtotal: { type: Number, required: true },
      extrasTotal: { type: Number, required: true },
      cleaningFee: { type: Number, required: true },
      total: { type: Number, required: true },
      deposit: { type: Number, required: true },
      grandTotal: { type: Number, required: true },
    },
  },
  { _id: false }
);
const invoiceSchema = new Schema(
  {
    camper: { type: Schema.Types.ObjectId, ref: "camper", required: true },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    priceBreakdown: {
      type: priceBreakdownSchema,
      required: true,
    },
    totalDays: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "cancelled", "pending"], //Pending in case of regular booking
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "manual", "other"],
      default: "other",
    },
    paymentId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = model("invoice", invoiceSchema);
