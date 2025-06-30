
const mongoose = require('mongoose');

module.exports = async function connectDB () {
  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error('MONGO_URL missing in env');
  await mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected');
};
