const mongoose = require("mongoose");

const idxSchema = new mongoose.Schema({
  idx: { type: String, required: true },
});

const Idx = mongoose.model("Idx", idxSchema);

module.exports = Idx;
