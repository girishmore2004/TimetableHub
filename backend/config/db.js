const mongoose = require('mongoose');
require('dotenv').config(); // ✅ Loads .env file

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('❌ MONGO_URI not found in environment variables');
    }

    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

module.exports = { connect: connectDB };
