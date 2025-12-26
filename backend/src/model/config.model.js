// src/model/config.model.js
import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
  clave: {
    type: String,
    required: true,
    unique: true,
  },
  valor: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  }
}, {
  timestamps: true
});

export default mongoose.model("Config", configSchema);