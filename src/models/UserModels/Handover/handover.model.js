const mongoose = require("mongoose");
const { Schema } = mongoose;

const handoverProtocolSchema = new Schema(
  {
    // Booking Information
    bookingNo: { 
      type: Schema.Types.ObjectId, 
      ref: "booking",
      required: true 
    },

    // User Information
    customerId: { 
      type: Schema.Types.ObjectId, 
      ref: "user",
      required: true 
    },
    ownerId: { 
      type: Schema.Types.ObjectId, 
      ref: "user",
      required: true 
    },

    // Personal Documentation
    identityCardNumber: { 
      type: String,
      required: true,
      trim: true 
    },
    drivingLicenseNumber: { 
      type: String,
      required: true,
      trim: true 
    },
    dateOfIssue: { 
      type: String,
      required: true 
    },

    // Vehicle Information
    vehicleId: { 
      type: Schema.Types.ObjectId, 
      ref: "camper",
      required: true 
    },

    // Schedule Information
    vehiclePickupDate: { 
      type: Date,
      required: true 
    },
    vehicleReturnDate: { 
      type: Date,
      required: true,
      validate: {
        validator: function(v) {
          return v > this.vehiclePickupDate;
        },
        message: 'Return date must be after pickup date'
      }
    },
    vehicleReturnTime: { 
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Time must be in HH:MM format'
      }
    },

    // Vehicle Condition
    mileage: { 
      type: Number,
      required: true,
      min: 0 
    },
    fuelTank: { 
      type: String,
      required: true,
      enum: ['Empty', '1/4', '1/2', '3/4', 'Full']
    },
    engineOilLevel: { 
      type: String,
      required: true,
      enum: ['Low', 'Normal', 'High']
    },
    usefulGas: { 
      type: String,
      required: true,
      enum: ['Empty', '1/4', '1/2', '3/4', 'Full']
    },
    freshWaterTank: { 
      type: String,
      required: true,
      enum: ['Empty', '1/4', '1/2', '3/4', 'Full']
    },
    wasteWaterTank: { 
      type: String,
      required: true,
      enum: ['Empty', '1/4', '1/2', '3/4', 'Full']
    },
    tireTread: { 
      type: String,
      required: true,
      enum: ['Poor', 'Fair', 'Good', 'Excellent', 'Average', 'Critical']
    },

    // Documents Checklist
    documentsChecklist: {
      vehicleRegistrationDocument: { type: Boolean, default: false },
      internationalInsuranceCard: { type: Boolean, default: false },
      operatingInstructions: { type: Boolean, default: false },
      vehicleKey: { type: Boolean, default: false },
      onboardToolsWarningTriangle: { type: Boolean, default: false },
      firstAidKitSafetyVests: { type: Boolean, default: false },
      spareWheelAndJack: { type: Boolean, default: false }
    },

    // Vehicle Options
    vehicleOptions: {
      swivelSeats: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      hingedWindow: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      navigationSystem: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      shorePowerConnection: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      blackoutBlinds1: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      blackoutBlinds2: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      popUpRoof: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      sink: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      shower: { type: String, enum: ['Working', 'Not Working', 'Not Available'] }
    },

    // Amenities
    amenities: {
      store: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      refrigeratorWithFreezerCompartment: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      waterConnection: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      hotWater: { type: String, enum: ['Working', 'Not Working', 'Not Available'] },
      bikeRack4Way: { type: String, enum: ['Working', 'Not Working', 'Not Available'] }
    },

    notSuitableForWinter: {
      type: String,
      enum: ["yes", "no"],
      required: true
    },

    // Financial Information
    financialInfo: {
      amountReceived: { 
        type: Number,
        required: true,
        min: 0 
      },
      rePaid: { 
        type: Number,
        required: true,
        min: 0 
      }
    },

    // Additional Information
    imagesUrls: [{ 
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Invalid URL format'
      }
    }],
    notes: { 
      type: String,
      trim: true,
      maxlength: 1000 
    },

    // Handover Status
    dateTimeOfHandover: {
      type: Date,
      default: Date.now
    },
    signOwner: { 
      type: Boolean,
      default: true
    },
    signCustomer: { 
      type: Boolean,
      default: false 
    },
    status: {
      type: String,
      enum: [
      
        'PENDING_SIGNATURES',
        'SIGNED',
        
       
      ],
      default: 'PENDING_SIGNATURES'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
handoverProtocolSchema.index({ bookingNo: 1 });
handoverProtocolSchema.index({ customerId: 1 });
handoverProtocolSchema.index({ ownerId: 1 });
handoverProtocolSchema.index({ vehicleId: 1 });
handoverProtocolSchema.index({ status: 1 });
handoverProtocolSchema.index({ createdAt: -1 });

// Virtual for handover duration in days
handoverProtocolSchema.virtual('handoverDurationDays').get(function() {
  return Math.ceil(
    (this.vehicleReturnDate - this.vehiclePickupDate) / (1000 * 60 * 60 * 24)
  );
});

// Method to check if handover is complete
handoverProtocolSchema.methods.isHandoverComplete = function() {
  return this.signOwner && this.signCustomer;
};

// Method to validate document checklist
handoverProtocolSchema.methods.isDocumentChecklistComplete = function() {
  return Object.values(this.documentsChecklist).every(item => item === true);
};

const HandoverProtocol = mongoose.model("handoverProtocol", handoverProtocolSchema);
module.exports = HandoverProtocol;
