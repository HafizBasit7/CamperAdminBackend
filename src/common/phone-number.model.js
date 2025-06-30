
const { Schema } = require('mongoose');
const phoneNumberSchema = new Schema({
  countryCode: { type: Number, required: true },
  phoneNo: { type: Number, required: true },
}, { _id: false });
module.exports = phoneNumberSchema;
