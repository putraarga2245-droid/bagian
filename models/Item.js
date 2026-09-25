const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Item || mongoose.model("Item", itemSchema);
