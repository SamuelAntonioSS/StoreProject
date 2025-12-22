// src/models/cashMovement.model.js
import mongoose from "mongoose";

const cashMovementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model("CashMovement", cashMovementSchema);
