import ResumenDia from "../model/resumen.model.js";
import Product from "../model/product.model.js";
import Config from "../model/config.model.js";

const resumenController = {

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

  async createResumen(req, res) {
    try {
      const {
        fecha,
        productos = [],
        cantidadSubsidios = 0,
        valorSubsidio = 0,
        efectivoEntregado = 0,
        usuario
      } = req.body;

      if (productos.length === 0 && cantidadSubsidios === 0) {
        return res.status(400).json({ 
          message: "Debe agregar al menos un producto o subsidio" 
        });
      }

      // Obtener IDs de productos gas
      const gasNormalId = await Config.findOne({ clave: 'productoGasNormalId' });
      const gasSubsidioId = await Config.findOne({ clave: 'productoGasSubsidioId' });
      const idsGas = [gasNormalId?.valor, gasSubsidioId?.valor].filter(Boolean);

      const productosVendidos = [];
      let totalProductos = 0;
      let totalTambosVendidos = 0;

      for (const item of productos) {
        const producto = await Product.findById(item.productoId);
        if (!producto) {
          return res.status(404).json({ 
            message: `Producto ${item.productoId} no encontrado` 
          });
        }

        // Si es producto gas, NO verificar stock del producto
        const esGas = idsGas.includes(producto._id.toString());

        if (!esGas) {
          // Productos normales: verificar stock individual
          if (producto.stock < item.cantidad) {
            return res.status(400).json({ 
              message: `Stock insuficiente para ${producto.name}. Disponible: ${producto.stock}` 
            });
          }
          // Descontar del producto
          producto.stock -= item.cantidad;
          await producto.save();
        } else {
          // Es gas: contar tambos a descontar
          totalTambosVendidos += item.cantidad;
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
      }

      // 🛢️ DESCONTAR TAMBOS DEL STOCK GLOBAL
      if (totalTambosVendidos > 0) {
        const stockConfig = await Config.findOne({ clave: 'stockTambos' });
        const stockActual = stockConfig ? stockConfig.valor : 0;

        if (totalTambosVendidos > stockActual) {
          return res.status(400).json({ 
            message: `Stock insuficiente de tambos. Disponibles: ${stockActual}, necesitas: ${totalTambosVendidos}` 
          });
        }

        const nuevoStock = stockActual - totalTambosVendidos;
        await Config.findOneAndUpdate(
          { clave: 'stockTambos' },
          { valor: nuevoStock },
          { upsert: true }
        );
      }

      const totalSubsidios = cantidadSubsidios * valorSubsidio;
      const totalDelDia = totalProductos + totalSubsidios;
      const diferencia = totalDelDia - efectivoEntregado;

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
      await nuevoResumen.populate('productos.productoId');
      
      res.json(nuevoResumen);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear resumen", error: error.message });
    }
  },

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

      // Obtener IDs de productos gas
      const gasNormalId = await Config.findOne({ clave: 'productoGasNormalId' });
      const gasSubsidioId = await Config.findOne({ clave: 'productoGasSubsidioId' });
      const idsGas = [gasNormalId?.valor, gasSubsidioId?.valor].filter(Boolean);

      // 🔄 DEVOLVER STOCK (productos normales Y tambos)
      let tambosADevolver = 0;
      for (const item of resumenActual.productos) {
        const esGas = idsGas.includes(item.productoId.toString());
        
        if (!esGas) {
          const producto = await Product.findById(item.productoId);
          if (producto) {
            producto.stock += item.cantidad;
            await producto.save();
          }
        } else {
          tambosADevolver += item.cantidad;
        }
      }

      // Devolver tambos al stock global
      if (tambosADevolver > 0) {
        const stockConfig = await Config.findOne({ clave: 'stockTambos' });
        const stockActual = stockConfig ? stockConfig.valor : 0;
        await Config.findOneAndUpdate(
          { clave: 'stockTambos' },
          { valor: stockActual + tambosADevolver },
          { upsert: true }
        );
      }

      // 📦 PROCESAR NUEVOS PRODUCTOS
      const productosVendidos = [];
      let totalProductos = 0;
      let totalTambosVendidos = 0;

      if (productos && productos.length > 0) {
        for (const item of productos) {
          const producto = await Product.findById(item.productoId);
          if (!producto) {
            return res.status(404).json({ 
              message: `Producto ${item.productoId} no encontrado` 
            });
          }

          const esGas = idsGas.includes(producto._id.toString());

          if (!esGas) {
            if (producto.stock < item.cantidad) {
              return res.status(400).json({ 
                message: `Stock insuficiente para ${producto.name}` 
              });
            }
            producto.stock -= item.cantidad;
            await producto.save();
          } else {
            totalTambosVendidos += item.cantidad;
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
        }
      }

      // Descontar nuevos tambos
      if (totalTambosVendidos > 0) {
        const stockConfig = await Config.findOne({ clave: 'stockTambos' });
        const stockActual = stockConfig ? stockConfig.valor : 0;

        if (totalTambosVendidos > stockActual) {
          return res.status(400).json({ 
            message: `Stock insuficiente de tambos. Disponibles: ${stockActual}` 
          });
        }

        await Config.findOneAndUpdate(
          { clave: 'stockTambos' },
          { valor: stockActual - totalTambosVendidos },
          { upsert: true }
        );
      }

      const totalSubsidios = (cantidadSubsidios || 0) * (valorSubsidio || 0);
      const totalDelDia = totalProductos + totalSubsidios;
      const diferencia = totalDelDia - (efectivoEntregado || 0);

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

  async deleteResumen(req, res) {
    try {
      const resumen = await ResumenDia.findById(req.params.id);
      if (!resumen) {
        return res.status(404).json({ message: "Resumen no encontrado" });
      }

      const gasNormalId = await Config.findOne({ clave: 'productoGasNormalId' });
      const gasSubsidioId = await Config.findOne({ clave: 'productoGasSubsidioId' });
      const idsGas = [gasNormalId?.valor, gasSubsidioId?.valor].filter(Boolean);

      let tambosADevolver = 0;

      for (const item of resumen.productos) {
        const esGas = idsGas.includes(item.productoId.toString());
        
        if (!esGas) {
          const producto = await Product.findById(item.productoId);
          if (producto) {
            producto.stock += item.cantidad;
            await producto.save();
          }
        } else {
          tambosADevolver += item.cantidad;
        }
      }

      if (tambosADevolver > 0) {
        const stockConfig = await Config.findOne({ clave: 'stockTambos' });
        const stockActual = stockConfig ? stockConfig.valor : 0;
        await Config.findOneAndUpdate(
          { clave: 'stockTambos' },
          { valor: stockActual + tambosADevolver },
          { upsert: true }
        );
      }

      await ResumenDia.findByIdAndDelete(req.params.id);
      res.json({ message: "Resumen eliminado y stock restaurado" });

    } catch (error) {
      res.status(500).json({ message: "Error al eliminar resumen", error });
    }
  }

};

export default resumenController;