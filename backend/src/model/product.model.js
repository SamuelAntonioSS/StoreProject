// src/models/product.model.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre del producto es obligatorio"],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, "El precio es obligatorio"],
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: null
  },
  imagePublicId: {  // 👈 AGREGAR ESTE CAMPO
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model("Product", productSchema);