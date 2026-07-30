const mongoose = require('mongoose');
const env = require('../config/env');

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
