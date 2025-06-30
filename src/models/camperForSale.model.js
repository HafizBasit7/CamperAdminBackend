
const { Schema, model } = require('mongoose');
const locationSchema = require('../common/location.model');

const camperForSaleSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  camperType: { type: Schema.Types.ObjectId, ref: 'category', required: true },
  sellerType: { type: String, enum: ['private','dealer'], required: true },
  brand: String, model: String,
}, { timestamps: true });

module.exports = model('camperForSale', camperForSaleSchema);
