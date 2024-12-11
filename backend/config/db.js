const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MONGODB IS CONNECTED: ${connect.connection.host}`);
  } catch (err) {
    console.log("from mongodb connect",err.message);
  }
};

module.exports = connectDB;
