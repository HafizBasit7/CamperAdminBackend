const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'booking',
    unique: true,
    trim: true
  },
  
  camperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'camper',
    required: true
  },

  
  renterDetails: {
    name: {
      firstName: {
        type: String,
        required: true,
        trim: true
      },
      lastName: {
        type: String,
        required: true,
        trim: true
      }
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      postalCode: {
        type: String,
        required: true,
        trim: true
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: 'Germany'
      }
    },
    telNo: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    dob: {
      type: Date,
      required: true,
      validate: {
        validator: function(v) {
          const age = (new Date() - v) / (365.25 * 24 * 60 * 60 * 1000);
          return age >= 16;
        },
        message: 'Renter must be at least 16 years old'
      }
    },
    personnelLawNo: {
      type: String,
      required: true,
      trim: true,
     
    },
    drivingLicenseNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    }
  },
  
  pricing: {
    baseCost: {
      type: Number,
      required: true,
      min: 0
    },
    extraRentPerKM: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    totalAmountTakenByCamperOwner: {
      type: Number,
      required: true,
      min: 0
    },
    vat: {
      amount: {
        type: Number,
        required: true,
        min: 0
      }
    },
    gross: {
      type: Number,
      required: true,
      min: 0
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0
    },
    depositAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  
  schedule: {
    vehiclePickupLocation: {
      address: {
        type: String,
        required: true,
        trim: true
      }
     
    },
    pickupDate: {
      type: Date,
      required: true
    },
    
    vehicleReturnDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(v) {
          return v > this.schedule.pickupDate;
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
        message: 'Please enter time in HH:MM format'
      }
    }
  },
  
  signatures: {
    signedByOwner: {
      type: Boolean,
      required: true,
      default: false
    },
    ownerSignatureDate: {
      type: Date
    },
    signedByUser: {
      type: Boolean,
      required: true,
      default: false
    },
    userSignatureDate: {
      type: Date
    }
  },
  
  contractDetails: {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    termsAndConditions: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
      default: `1. The renter must be at least 16 years old and possess a valid driving license.
2. The vehicle must be returned in the same condition as received.
3. Any damages to the vehicle will be deducted from the deposit.
4. Late return fees may apply as per company policy.
5. The renter is responsible for all traffic violations during the rental period.
6. Smoking and pets are not allowed in the vehicle.
7. The vehicle should not be used for commercial purposes without prior consent.
8. In case of breakdown, contact the rental company immediately.
9. The security deposit will be refunded within 7-10 business days after inspection.
10. All disputes will be subject to local jurisdiction.`
    }
  },
  
  status: {
    type: String,
    required: true,
    enum: [
      
      'PENDING_SIGNATURES',
      'SIGNED',
    ],
    default: 'PENDING_SIGNATURES'
  },
  bankAccountDetails: {
    IBAN: {
      type: String,
      required: false,
      trim: true,
      default: 'NA'
    },
    BIC: {
      type: String,
      required: false,
      trim: true,
      default: 'NA'
    },
    accountHolderName: {  
      type: String,
      required: false,
      trim: true,
      default: 'NA'
    }
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
}, {
  timestamps: true,

});

// Indexes for better query performance
contractSchema.index({ bookingId: 1 });
contractSchema.index({ camperId: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ 'renterDetails.personnelLawNo': 1 });
contractSchema.index({ 'schedule.pickupDate': 1 });
contractSchema.index({ createdAt: -1 });

// Virtual for full name
contractSchema.virtual('renterDetails.fullName').get(function() {
  return `${this.renterDetails.name.firstName} ${this.renterDetails.name.lastName}`;
});

// Virtual for contract duration in days
contractSchema.virtual('contractDurationDays').get(function() {
  const diffTime = Math.abs(this.schedule.vehicleReturnDate - this.schedule.pickupDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate VAT and totals
contractSchema.pre('save', function(next) {
  if (this.pricing.baseCost && this.pricing.vat.percentage) {
    this.pricing.vat.amount = (this.pricing.baseCost * this.pricing.vat.percentage) / 100;
    this.pricing.gross = this.pricing.baseCost + this.pricing.vat.amount;
  }
  
  // Update signature dates when signed
  if (this.signatures.signedByOwner && !this.signatures.ownerSignatureDate) {
    this.signatures.ownerSignatureDate = new Date();
  }
  
  if (this.signatures.signedByUser && !this.signatures.userSignatureDate) {
    this.signatures.userSignatureDate = new Date();
  }
  
  // Update status based on signatures
  if (this.signatures.signedByOwner && this.signatures.signedByUser && this.status === 'PENDING_SIGNATURES') {
    this.status = 'SIGNED';
  }
  
  next();
});

// Method to check if contract is fully signed
contractSchema.methods.isFullySigned = function() {
  return this.signatures.signedByOwner && this.signatures.signedByUser;
};

// Method to calculate total rental cost including extra KM charges
contractSchema.methods.calculateTotalCost = function(actualKM = 0) {
  const extraKMCost = actualKM * this.pricing.extraRentPerKM;
  return this.pricing.gross + extraKMCost;
};

// Static method to find active contracts
contractSchema.statics.findActiveContracts = function() {
  return this.find({ status: 'ACTIVE' });
};

module.exports = mongoose.models.Contract || mongoose.model('Contract', contractSchema);
