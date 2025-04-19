const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driver_Schema = new mongoose.Schema({
  profile: {
    type: String,
    default: "default profile.png"
  },
  drivername: {
    type: String,
    required: true,
  },
  driveremail: {
    type: String,
    required: true,
    unique: true,
  },
  countrycode: {
    type: String,
    required: true,
  },
  driverphone: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: Boolean,
    default: false
  },
  servicetype: {
    type: Schema.Types.ObjectId,
    default: null
  },
  assign: {
    type: String,
    default: "0"
  },
  // ✅ New field added below
  drivinglicense: {
    type: String,
    required: true, // set to false if optional
    unique: true     // optional: remove if duplicate license is allowed
  },
  aadharcard: {
    type: String,
    required: true,
    unique: true,
  },
  
});

const driverModel = mongoose.model("driverModel", driver_Schema);
module.exports = driverModel;
