
const { Schema, model } = require('mongoose');

const bookingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  camper: { type: Schema.Types.ObjectId, ref: 'camper', required: true },
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  status: { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' }
}, { timestamps: true });

module.exports = model('booking', bookingSchema);
