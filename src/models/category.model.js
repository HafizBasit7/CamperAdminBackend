
const { Schema, model } = require('mongoose');
const categorySchema = new Schema({ name: String }, { timestamps: true });
module.exports = model('category', categorySchema);
