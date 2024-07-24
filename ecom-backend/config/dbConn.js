const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.DATABASE_URI;
  try {
    await mongoose.connect(uri, {});
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;
