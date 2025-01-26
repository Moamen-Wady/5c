const mongoose = require("mongoose");

const idxothersSchema = new mongoose.Schema({
  idxothers: { type: String, required: true },
  year: { type: String, required: true },
});

const idxothers = mongoose.model("idxothers", idxothersSchema);

module.exports = idxothers;
