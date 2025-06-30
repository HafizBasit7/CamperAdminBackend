
const { Schema } = require('mongoose');
const locationSchema = new Schema({
  name: { type: String, required: true },
  coordinates: { type: [Number], required: true, default: [50, 50], index: '2dsphere' },
}, { _id: false });
module.exports = locationSchema;
