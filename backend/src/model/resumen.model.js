// src/models/resumen.model.js
import mongoose from "mongoose";

const resumenDiaSchema = new mongoose.Schema({
  fecha: { 
    type: Date, 
    required: true 
  },
  
  // 📦 Productos vendidos (array)
  productos: [{
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    nombre: String,           // Guardamos el nombre para histórico
    cantidad: {
      type: Number,
      required: true,
      min: 0
    },
    precioUnitario: {        // Precio al momento de la venta
      type: Number,
      required: true
    },
    subtotal: Number         // cantidad × precioUnitario
  }],
  
  // 💵 Subsidios
  cantidadSubsidios: {
    type: Number,
    default: 0,
    min: 0
  },
  valorSubsidio: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSubsidios: {          // cantidadSubsidios × valorSubsidio
    type: Number,
    default: 0
  },
  
  // 💰 Totales
  totalProductos: {          // Suma de todos los subtotales
    type: Number,
    required: true
  },
  totalDelDia: {             // totalProductos + totalSubsidios
    type: Number,
    required: true
  },
  efectivoEntregado: { 
    type: Number, 
    default: 0 
  },
  diferencia: Number,        // totalDelDia - efectivoEntregado
  
  usuario: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true 
});

export default mongoose.model("ResumenDia", resumenDiaSchema);