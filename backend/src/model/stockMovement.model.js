// src/models/stockMovement.model.js
import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  movementType: {
    type: String,
    enum: ["entrada"],
    default: "entrada"
  }
}, {
  timestamps: true
});

export default mongoose.model("StockMovement", stockMovementSchema);
