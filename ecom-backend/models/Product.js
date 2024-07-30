const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  size: [String],
  color: [String],
  image: { type: String, required: true },
  stock: { type: Number, required: true },
  lowStockThreshold: { type: Number, default: 5 },
});

module.exports = mongoose.model("Product", ProductSchema);
