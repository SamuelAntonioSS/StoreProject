import mongoose from "mongoose";

const resumenDiaSchema = new mongoose.Schema({
  fecha: { 
    type: Date, 
    required: true 
  },
  
  productos: [{
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    nombre: String,
    cantidad: {
      type: Number,
      required: true,
      min: 0
    },
    precioUnitario: {
      type: Number,
      required: true
    },
    subtotal: Number,
    stockAlCierre: {         // ← NUEVO: stock que quedó después de esta venta
      type: Number,
      default: null
    }
  }],
  
  // Stock de tambos al cierre del día
  stockTambosAlCierre: {     // ← NUEVO
    type: Number,
    default: null
  },

  cantidadSubsidios: { type: Number, default: 0, min: 0 },
  valorSubsidio: { type: Number, default: 0, min: 0 },
  totalSubsidios: { type: Number, default: 0 },
  totalProductos: { type: Number, required: true },
  totalDelDia: { type: Number, required: true },
  efectivoEntregado: { type: Number, default: 0 },
  diferencia: Number,
  usuario: { type: String, required: true }
}, { 
  timestamps: true 
});

export default mongoose.model("ResumenDia", resumenDiaSchema);