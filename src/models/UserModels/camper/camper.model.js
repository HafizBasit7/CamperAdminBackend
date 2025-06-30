const { Schema, model } = require("mongoose");
const attachmentSchema = require("../common/attachment.model");
const locationSchema = require("../common/location.model");
const Booking = require("../booking&invoice/bookings.model");
const e = require("express");

// Special pricing schema for date ranges with different rates
const specialPriceSchema = new Schema(
  {
    from: {
      type: Date,
      required: true,
    },
    to: {
      type: Date,
      required: true,
    },
    standardPrice: {
      type: Number,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

// Extra features/add-ons schema
const extraSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceType: {
      type: String,
      enum: ["perday", "perpackage"],
      required: true,
    },
  },
  { _id: true }
);

const camperSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    status: {
      type: String,
      enum: ["pending", "active", "sold"],
      default: "active",
    },
    bookingType: {
      type: [String],
      enum: ["direct", "regular"],
      required: true,
    },
    camperType: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "category",
    },
    thumbnailImage: {
      type: String,
      required: true,
    },
    images: {
      type: [attachmentSchema],
      required: true,
    },
    approvalDate: {
      type: Date,
    },
    // Owner provided information
    licensePlate: {
      type: String,
      required: true,
    },
    allowedCountry: {
      type: String,
      required: true,
    },
    licenseType: {
      type: String,

      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pickupLocation: {
      type: locationSchema,
      required: true,
    },
    maintenanceDays: {
      type: Number,
      required: true,
    },
    // Pricing information
    standardPrice: {
      type: Number,
      required: true,
    },
    minimumRentalDays: {
      type: Number,
      required: true,
    },
    specialPrices: {
      type: [specialPriceSchema],
      default: [],
    },
    cleaningFee: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    cancellationPolicy: {
      type: String,
      enum: ["mild", "moderate", "strict"],
      required: true,
    },
    // Insurance and tenant requirements

    insuranceDetails: {
      insuraceId: {
        type: String,
        default: null,
      },
      insuranceCover: {
        type: String,
        enum: ["yes", "no"],
        default: "no",
      },
      volkswagenExcess: {
        type: String,
        default: "0",
      },
      partialExcess: {
        type: String,
        default: "0",
      },
      punctureHotline: {
        type: String,
        default: 0,
      },
      claimsHotline: {
        type: String,
        default: 0,
      },
      documents: {
        vehicleLicense: {
          type: String,
          default: null,
        },
        privacyPolicy: {
          type: String,
          default: null,
        },
        protectionLetter: {
          type: String,
          default: null,
        },
      },
    },
    roofTent: {
      type: Boolean,
      default: false,
    },

    minAgeOfTenant: {
      type: Number,
      required: true,
    },
    petsAllowed: {
      type: Boolean,
      required: true,
    },
    specialDrivingLicense: {
      type: Boolean,
      required: true,
    },
    rentalConditions: {
      type: String,
      default: null,
    },
    // Equipment and features
    equipment: {
      type: [String],
      default: [],
    },

    amenities: {
      type: [String],
      default: [],
    },
    safetyBelts: {
      type: Number,
      required: true,
    },
    threePointSeatBelts: {
      type: Number,
      required: true,
    },
    additionalSafetyInfo: {
      type: String,
      default: null,
    },
    extras: {
      type: [extraSchema],
      default: [],
    },
    available: {
      type: Boolean,
      default: true,
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    sleepingPlaces: { type: Number, default: 0 },
    firstRegistrationDate: { type: Date, required: true }, // combine dateDay/month/year
    totalWeight: { type: String, required: true },
    length: { type: String, required: true },
    drivingLicense: { type: String, required: true },
    height: { type: String, required: true },
    width: { type: String, required: true }, // instead of wideRange
    powerKW: { type: String, default: "" },
    emptyWeight: { type: String, default: "" },
    gearbox: {
      type: String,
      enum: ["automatic", "manual", "semi-automatic"],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["gasoline", "diesel", "electric", "hybrid"],
      required: true,
    },
    dailyTravelKM: {
      type: Number,
      required: true,
    },
    verificationDocuments: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

// Add validation for special pricing date ranges
camperSchema.path("specialPrices").validate(function (specialPrices) {
  if (!specialPrices || specialPrices.length === 0) return true;

  // Check for date overlaps in special pricing periods
  for (let i = 0; i < specialPrices.length; i++) {
    const current = specialPrices[i];

    // Ensure end date is after start date
    if (current.to <= current.from) {
      return false;
    }

    // Check for overlaps with other date ranges
    for (let j = i + 1; j < specialPrices.length; j++) {
      const other = specialPrices[j];

      // Check if date ranges overlap
      if (
        (current.from <= other.to && current.to >= other.from) ||
        (other.from <= current.to && other.to >= current.from)
      ) {
        return false;
      }
    }
  }

  return true;
}, "Special pricing periods cannot overlap and end dates must be after start dates");

camperSchema.methods.getPriceForDates = async function (
  startDate,
  endDate,
  extras = {}
) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate total rental days
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  // Validate minimum rental period
  if (totalDays < this.minimumRentalDays) {
    throw new Error(`Minimum rental period is ${this.minimumRentalDays} days`);
  }

  // Check for existing bookings (availability check)
  const existingBookings = await Booking.find({
    camper: this._id,
    status: "confirmed",
    dateFrom: { $lte: end },
    dateTo: { $gte: start },
  });

  if (existingBookings.length > 0) {
    throw new Error(
      "Camper already has a booking for some or all of these dates."
    );
  }

  // Find special period that covers the entire booking
  const fullPeriodSpecial = this.specialPrices.find(
    (period) => start >= period.from && end <= period.to && period.available
  );

  // Get base fees (prioritize special period if entire booking falls within one)
  const deposit = fullPeriodSpecial?.deposit || this.deposit;
  const cleaningFee = fullPeriodSpecial?.cleaningFee || this.cleaningFee;

  // Calculate daily pricing breakdown
  const { dailyBreakdown, subtotal } = this._calculateDailyPricing(start, end);

  // Calculate extras pricing
  const extrasBreakdown = this._calculateExtras(extras, totalDays);

  // Calculate totals
  const rentalSubtotal = subtotal;
  const extrasTotal = extrasBreakdown.total;
  const total = rentalSubtotal + cleaningFee + extrasTotal;
  const grandTotal = total + deposit;

  return {
    booking: {
      totalDays,
      startDate: start,
      endDate: end,
    },
    pricing: {
      dailyRates: {
        breakdown: dailyBreakdown,
        subtotal: rentalSubtotal,
      },
      extras: extrasBreakdown,
      fees: {
        cleaningFee,
        deposit,
      },
      summary: {
        rentalSubtotal,
        extrasTotal,
        cleaningFee,
        total,
        deposit,
        grandTotal,
      },
    },
  };
};

// Helper method for daily pricing calculation
camperSchema.methods._calculateDailyPricing = function (start, end) {
  const dailyBreakdown = [];
  let subtotal = 0;
  let currentDate = new Date(start);

  while (currentDate < end) {
    // Find applicable special price for current date
    const specialPrice = this.specialPrices.find(
      (period) =>
        currentDate >= period.from &&
        currentDate <= period.to &&
        period.available
    );

    const dailyPrice = specialPrice?.standardPrice || this.standardPrice;
    subtotal += dailyPrice;

    dailyBreakdown.push({
      date: new Date(currentDate),
      price: dailyPrice,
      isSpecialRate: !!specialPrice,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { dailyBreakdown, subtotal };
};

// Helper method for extras calculation
camperSchema.methods._calculateExtras = function (extras, totalDays) {
  const breakdown = [];
  let total = 0;

  // Handle case when extras is empty or not provided
  if (!extras || Object.keys(extras).length === 0) {
    return {
      breakdown: [],
      total: 0,
    };
  }

  // Convert single extra to array format for consistent processing
  const extrasArray = Array.isArray(extras) ? extras : [extras];

  extrasArray.forEach((extra) => {
    if (!extra.name || typeof extra.price !== "number") {
      return; // Skip invalid extras
    }

    let extraTotal = 0;
    let quantity = 1;
    const priceType = extra.priceType || "perpackage";

    switch (priceType.toLowerCase()) {
      case "perday":
        extraTotal = extra.price * totalDays;
        quantity = totalDays;
        break;
      case "perpackage":
      default:
        extraTotal = extra.price; // Price as-is, no multiplication
        quantity = 1;
        break;
    }

    breakdown.push({
      name: extra.name,
      price: extra.price,
      priceType,
      quantity,
      total: extraTotal,
    });

    total += extraTotal;
  });

  return { breakdown, total };
};

// Static method to find available campers for a date range
camperSchema.statics.findAvailableForDates = function (
  startDate,
  endDate,
  filters = {}
) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Base query for available campers
  const query = {
    available: true,
    status: "active",
    ...filters,
  };

  // Exclude campers with overlapping maintenance days or special unavailable periods
  return this.find(query).then((campers) => {
    return campers.filter((camper) => {
      // Check if any special price period makes this unavailable
      const hasUnavailablePeriod = camper.specialPrices.some(
        (period) =>
          !period.available &&
          ((start >= period.from && start <= period.to) ||
            (end >= period.from && end <= period.to) ||
            (start <= period.from && end >= period.to))
      );

      return !hasUnavailablePeriod;
    });
  });
};

module.exports = model("camper", camperSchema);
