import Product from "../model/product.model.js";

const productController = {

  async getProducts(req, res) {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productos", error: error.message });
    }
  },

  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener producto", error: error.message });
    }
  },

  async createProduct(req, res) {
    try {
      const { name, price, stock } = req.body;

      let image = null;
      if (req.file) {
        image = `/uploads/${req.file.filename}`;
      }

      const newProduct = new Product({
        name,
        price,
        stock: stock || 0,
        image
      });

      await newProduct.save();
      res.json(newProduct);

    } catch (error) {
      res.status(500).json({ message: "Error al crear producto", error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const { name, price, stock } = req.body;
      let updateData = { name, price, stock };

      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updated) return res.status(404).json({ message: "Producto no encontrado" });
      res.json(updated);

    } catch (error) {
      res.status(500).json({ message: "Error al actualizar producto", error: error.message });
    }
  },

  // ⚠️ SOLO PARA PRODUCTOS NORMALES (NO GAS)
  async addStock(req, res) {
    try {
      const { cantidad } = req.body;
      
      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
      }

      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });

      product.stock += cantidad;
      await product.save();

      res.json(product);

    } catch (error) {
      res.status(500).json({ message: "Error al agregar stock", error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Producto no encontrado" });
      res.json({ message: "Producto eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar producto", error: error.message });
    }
  }

};

export default productController;