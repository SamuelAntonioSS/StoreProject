// src/controllers/resumen.controller.js
import ResumenDia from "../model/resumen.model.js";
import Product from "../model/product.model.js";

const resumenController = {

  // Obtener todos los resúmenes
  async getResumenes(req, res) {
    try {
      const resumenes = await ResumenDia.find()
        .populate('productos.productoId')
        .sort({ fecha: -1 });
      res.json(resumenes);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener resumenes", error });
    }
  },

  // Obtener resumen por ID
  async getResumenById(req, res) {
    try {
      const resumen = await ResumenDia.findById(req.params.id)
        .populate('productos.productoId');
      if (!resumen) return res.status(404).json({ message: "Resumen no encontrado" });
      res.json(resumen);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener resumen", error });
    }
  },

  // Crear resumen del día
  async createResumen(req, res) {
    try {
      const {
        fecha,
        productos = [],           // [{ productoId, cantidad }]
        cantidadSubsidios = 0,
        valorSubsidio = 0,
        efectivoEntregado = 0,
        usuario
      } = req.body;

      // Validar que haya productos o subsidios
      if (productos.length === 0 && cantidadSubsidios === 0) {
        return res.status(400).json({ 
          message: "Debe agregar al menos un producto o subsidio" 
        });
      }

      // 📦 Procesar productos vendidos
      const productosVendidos = [];
      let totalProductos = 0;

      for (const item of productos) {
        // Obtener producto
        const producto = await Product.findById(item.productoId);
        if (!producto) {
          return res.status(404).json({ 
            message: `Producto ${item.productoId} no encontrado` 
          });
        }

        // Verificar stock
        if (producto.stock < item.cantidad) {
          return res.status(400).json({ 
            message: `Stock insuficiente para ${producto.name}. Disponible: ${producto.stock}` 
          });
        }

        // Calcular subtotal
        const subtotal = item.cantidad * producto.price;
        totalProductos += subtotal;

        // Agregar a la lista
        productosVendidos.push({
          productoId: producto._id,
          nombre: producto.name,
          cantidad: item.cantidad,
          precioUnitario: producto.price,
          subtotal
        });

        // 🔻 Descontar del stock
        producto.stock -= item.cantidad;
        await producto.save();
      }

      // 💵 Calcular subsidios
      const totalSubsidios = cantidadSubsidios * valorSubsidio;

      // 💰 Calcular totales
      const totalDelDia = totalProductos + totalSubsidios;
      const diferencia = totalDelDia - efectivoEntregado;

      // Crear resumen
      const nuevoResumen = new ResumenDia({
        fecha,
        productos: productosVendidos,
        cantidadSubsidios,
        valorSubsidio,
        totalSubsidios,
        totalProductos,
        totalDelDia,
        efectivoEntregado,
        diferencia,
        usuario
      });

      await nuevoResumen.save();
      
      // Poblar los productos antes de devolver
      await nuevoResumen.populate('productos.productoId');
      
      res.json(nuevoResumen);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear resumen", error: error.message });
    }
  },

  // Actualizar resumen
  async updateResumen(req, res) {
    try {
      const {
        productos,
        cantidadSubsidios,
        valorSubsidio,
        efectivoEntregado
      } = req.body;

      const resumenActual = await ResumenDia.findById(req.params.id);
      if (!resumenActual) {
        return res.status(404).json({ message: "Resumen no encontrado" });
      }

      // 🔄 Devolver stock de productos anteriores
      for (const item of resumenActual.productos) {
        const producto = await Product.findById(item.productoId);
        if (producto) {
          producto.stock += item.cantidad;
          await producto.save();
        }
      }

      // 📦 Procesar nuevos productos
      const productosVendidos = [];
      let totalProductos = 0;

      if (productos && productos.length > 0) {
        for (const item of productos) {
          const producto = await Product.findById(item.productoId);
          if (!producto) {
            return res.status(404).json({ 
              message: `Producto ${item.productoId} no encontrado` 
            });
          }

          if (producto.stock < item.cantidad) {
            return res.status(400).json({ 
              message: `Stock insuficiente para ${producto.name}` 
            });
          }

          const subtotal = item.cantidad * producto.price;
          totalProductos += subtotal;

          productosVendidos.push({
            productoId: producto._id,
            nombre: producto.name,
            cantidad: item.cantidad,
            precioUnitario: producto.price,
            subtotal
          });

          producto.stock -= item.cantidad;
          await producto.save();
        }
      }

      // 💵 Recalcular subsidios
      const totalSubsidios = (cantidadSubsidios || 0) * (valorSubsidio || 0);
      const totalDelDia = totalProductos + totalSubsidios;
      const diferencia = totalDelDia - (efectivoEntregado || 0);

      // Actualizar resumen
      resumenActual.productos = productosVendidos;
      resumenActual.cantidadSubsidios = cantidadSubsidios || 0;
      resumenActual.valorSubsidio = valorSubsidio || 0;
      resumenActual.totalSubsidios = totalSubsidios;
      resumenActual.totalProductos = totalProductos;
      resumenActual.totalDelDia = totalDelDia;
      resumenActual.efectivoEntregado = efectivoEntregado || 0;
      resumenActual.diferencia = diferencia;

      await resumenActual.save();
      await resumenActual.populate('productos.productoId');

      res.json(resumenActual);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar resumen", error: error.message });
    }
  },

  // Eliminar resumen
  async deleteResumen(req, res) {
    try {
      const resumen = await ResumenDia.findById(req.params.id);
      if (!resumen) {
        return res.status(404).json({ message: "Resumen no encontrado" });
      }

      // 🔄 Devolver stock de productos
      for (const item of resumen.productos) {
        const producto = await Product.findById(item.productoId);
        if (producto) {
          producto.stock += item.cantidad;
          await producto.save();
        }
      }

      await ResumenDia.findByIdAndDelete(req.params.id);
      res.json({ message: "Resumen eliminado y stock restaurado" });

    } catch (error) {
      res.status(500).json({ message: "Error al eliminar resumen", error });
    }
  }

};

export default resumenController;