const mongoose = require("mongoose");

const resvSchema = new mongoose.Schema({
  userName: String,
  phoneNum1: String,
  year: String,
  sid: String,
  code: String,
});

const Resv = mongoose.model("Resv", resvSchema);

module.exports = Resv;
