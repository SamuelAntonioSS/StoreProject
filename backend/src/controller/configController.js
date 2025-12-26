import Config from "../model/config.model.js";

const configController = {

  async getConfig(req, res) {
    try {
      const configs = await Config.find();
      const configObj = {};
      configs.forEach(c => {
        configObj[c.clave] = c.valor;
      });
      
      // Si no existe stockTambos, inicializarlo en 0
      if (!configObj.stockTambos) {
        configObj.stockTambos = 0;
      }
      
      res.json(configObj);
    } catch (error) {
      console.error("Error al obtener config:", error);
      res.status(500).json({ message: "Error al obtener configuración", error: error.message });
    }
  },

  async saveConfig(req, res) {
    try {
      const { capacidadTambos, productoGasNormalId, productoGasSubsidioId } = req.body;

      // Guardar capacidad
      if (capacidadTambos !== undefined) {
        await Config.findOneAndUpdate(
          { clave: 'capacidadTambos' },
          { valor: parseInt(capacidadTambos) },
          { upsert: true, new: true }
        );
      }

      // Guardar IDs de productos gas
      if (productoGasNormalId) {
        await Config.findOneAndUpdate(
          { clave: 'productoGasNormalId' },
          { valor: productoGasNormalId },
          { upsert: true, new: true }
        );
      }

      if (productoGasSubsidioId) {
        await Config.findOneAndUpdate(
          { clave: 'productoGasSubsidioId' },
          { valor: productoGasSubsidioId },
          { upsert: true, new: true }
        );
      }

      res.json({ message: "Configuración guardada correctamente" });
    } catch (error) {
      console.error("Error al guardar config:", error);
      res.status(500).json({ message: "Error al guardar configuración", error: error.message });
    }
  },

  // 🆕 AGREGAR TAMBOS AL STOCK GLOBAL
  async addTambos(req, res) {
    try {
      const { cantidad } = req.body;

      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
      }

      // Obtener configuración actual
      const capacidadConfig = await Config.findOne({ clave: 'capacidadTambos' });
      const stockConfig = await Config.findOne({ clave: 'stockTambos' });

      if (!capacidadConfig) {
        return res.status(400).json({ message: "Debes configurar la capacidad primero" });
      }

      const capacidadTotal = capacidadConfig.valor;
      const stockActual = stockConfig ? stockConfig.valor : 0;
      const tambosVacios = capacidadTotal - stockActual;

      // Validar que no exceda la capacidad
      if (cantidad > tambosVacios) {
        return res.status(400).json({ 
          message: `Solo tienes ${tambosVacios} tambos vacíos disponibles`,
          tambosVacios
        });
      }

      // Agregar al stock
      const nuevoStock = stockActual + cantidad;
      await Config.findOneAndUpdate(
        { clave: 'stockTambos' },
        { valor: nuevoStock },
        { upsert: true, new: true }
      );

      res.json({ 
        message: `Se agregaron ${cantidad} tambos`,
        stockTambos: nuevoStock,
        tambosVacios: capacidadTotal - nuevoStock
      });

    } catch (error) {
      console.error("Error al agregar tambos:", error);
      res.status(500).json({ message: "Error al agregar tambos", error: error.message });
    }
  }

};

export default configController;