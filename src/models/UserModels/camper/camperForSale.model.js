const { Schema, model } = require("mongoose");
const attachmentSchema = require("../common/attachment.model");
const locationSchema = require("../common/location.model");

const camperForSaleSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    camperType: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    sellerType: {
      type: String,
      enum: ["private", "dealer"],
      required: true,
    },
    soldTo: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    dateOfRegistration: { type: Date, required: true },
    noOfSeats: { type: Number, required: true },
    noOfBeds: { type: Number, required: true },
    length: { type: String, required: true }, // meters
    width: { type: String, required: true }, // meters
    height: { type: String, required: true }, // meters
    weight: { type: String, required: true }, // kg
    axles: { type: String, required: true },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid"],
      required: true,
    },
    motorPower: { type: String, required: true },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      required: true,
    },
    emissionClass: { type: String, required: true },
    emissionSticker: { type: String },
    mileage: { type: Number, required: true },
    isUsed: { type: Boolean, default: true },
    noOfOwners: { type: Number },
    isDamaged: { type: Boolean, default: false },
    inspectionValidTill: { type: Date },
    fullServiceHistory: { type: Boolean, default: false },
    warranty: { type: Boolean, default: false },
    exteriorColor: { type: String, required: true },

    // Features
    features: {
    airConditioning: { type: Boolean, default: false },
    awning: { type: Boolean, default: false },
    bikeRack: { type: Boolean, default: false },
    bluetooth: { type: Boolean, default: false },
    heater: { type: Boolean, default: false },
    inverter: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    microwave: { type: Boolean, default: false },
    outdoorShower: { type: Boolean, default: false },
    radio: { type: Boolean, default: false },
    refrigerator: { type: Boolean, default: false },
    shower: { type: Boolean, default: false },
    solarPanel: { type: Boolean, default: false },
    toilet: { type: Boolean, default: false },
    tv: { type: Boolean, default: false },
    usbPorts: { type: Boolean, default: false },
  },

    // Sale Info
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    isNegotiable: { type: Boolean, default: false },
    images: { type: [String], required: true },

    // Status & Meta
    status: {
      type: String,
      enum: ["pending", "active", "sold"],
      default: "active",
    },
    approvalDate: { type: Date },

    // Location & License
    licensePlate: { type: String, required: true },

    allowedCountry: { type: String, required: true },
    location: { type: locationSchema, required: true },

    // Other
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔍 Text index
camperForSaleSchema.index({
  title: "text",
  description: "text",
  "location.name": "text",
});

// 📍 Geo index
camperForSaleSchema.index({ "location.coordinates": "2dsphere" });

module.exports = model("camperForSale", camperForSaleSchema);
