// src/controllers/product.controller.js
import Product from '../model/product.model.js';
import cloudinary from '../../cloudinary.config.js';

// Crear producto
export const createProduct = async (req, res) => {
  console.log('=================================');
  console.log('📥 Nueva petición de crear producto');
  console.log('📝 req.body:', req.body);
  console.log('📸 req.file:', req.file);
  console.log('📋 Headers:', req.headers);
  console.log('=================================');
  
  try {
    const { name, price, stock } = req.body;

    // Validaciones
    if (!name || !price || stock === undefined) {
      console.log('❌ Faltan campos requeridos');
      console.log('   name:', name);
      console.log('   price:', price);
      console.log('   stock:', stock);
      return res.status(400).json({ 
        message: 'Faltan campos requeridos (name, price, stock)' 
      });
    }

    console.log('✅ Validación pasada');

    // Verificar si ya existe un producto con ese nombre
    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
      console.log('❌ Producto ya existe:', name);
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({ 
        message: 'Ya existe un producto con ese nombre' 
      });
    }

    console.log('✅ Producto no existe, procediendo a crear...');

    // Preparar datos del producto
    const productData = {
      name: name.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
    };

    // Si hay imagen, guardar la URL de Cloudinary
    if (req.file) {
      console.log('📸 Imagen procesada por Cloudinary:');
      console.log('   URL:', req.file.path);
      console.log('   Public ID:', req.file.filename);
      productData.image = req.file.path;
      productData.imagePublicId = req.file.filename;
    } else {
      console.log('⚠️ No se recibió imagen');
    }

    console.log('💾 Datos finales a guardar:', productData);

    const product = new Product(productData);
    await product.save();

    console.log('✅ Producto guardado exitosamente con ID:', product._id);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product
    });

  } catch (error) {
    console.error('❌❌❌ ERROR COMPLETO ❌❌❌');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('================================');
    
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error al eliminar imagen después de fallo:', deleteError);
      }
    }
    
    res.status(500).json({ 
      message: 'Error al crear el producto',
      error: error.message 
    });
  }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
  console.log('=================================');
  console.log('✏️ Petición de actualizar producto');
  console.log('📝 ID:', req.params.id);
  console.log('📝 req.body:', req.body);
  console.log('📸 req.file:', req.file);
  console.log('=================================');
  
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      console.log('❌ Producto no encontrado con ID:', id);
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    console.log('✅ Producto encontrado:', product.name);

    // Si se está actualizando el nombre, verificar que no exista otro producto con ese nombre
    if (name && name.trim() !== product.name) {
      const existingProduct = await Product.findOne({ 
        name: name.trim(),
        _id: { $ne: id }
      });
      
      if (existingProduct) {
        console.log('❌ Ya existe otro producto con ese nombre:', name);
        if (req.file) {
          await cloudinary.uploader.destroy(req.file.filename);
        }
        return res.status(400).json({ 
          message: 'Ya existe otro producto con ese nombre' 
        });
      }
    }

    // Actualizar campos básicos
    if (name) {
      console.log('📝 Actualizando nombre:', name);
      product.name = name.trim();
    }
    if (price !== undefined) {
      console.log('💰 Actualizando precio:', price);
      product.price = parseFloat(price);
    }
    if (stock !== undefined) {
      console.log('📊 Actualizando stock:', stock);
      product.stock = parseInt(stock);
    }

    // Si hay nueva imagen, eliminar la anterior de Cloudinary
    if (req.file) {
      console.log('📸 Nueva imagen recibida');
      
      // Eliminar imagen anterior si existe
      if (product.imagePublicId) {
        try {
          console.log('🗑️ Eliminando imagen anterior:', product.imagePublicId);
          await cloudinary.uploader.destroy(product.imagePublicId);
          console.log('✅ Imagen anterior eliminada');
        } catch (error) {
          console.error('⚠️ Error al eliminar imagen anterior:', error);
        }
      }

      // Guardar nueva imagen
      console.log('💾 Guardando nueva imagen:', req.file.path);
      product.image = req.file.path;
      product.imagePublicId = req.file.filename;
    }

    await product.save();

    console.log('✅ Producto actualizado exitosamente');

    res.json({
      message: 'Producto actualizado exitosamente',
      product
    });

  } catch (error) {
    console.error('❌❌❌ ERROR AL ACTUALIZAR ❌❌❌');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('================================');
    
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error al eliminar imagen después de fallo:', deleteError);
      }
    }
    
    res.status(500).json({ 
      message: 'Error al actualizar el producto',
      error: error.message 
    });
  }
};

// 👇 NUEVA FUNCIÓN: Agregar stock
export const addStock = async (req, res) => {
  console.log('=================================');
  console.log('📦 Petición de agregar stock');
  console.log('📝 ID:', req.params.id);
  console.log('📝 Cantidad:', req.body.cantidad);
  console.log('=================================');
  
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    // Validaciones
    if (!cantidad || cantidad <= 0) {
      console.log('❌ Cantidad inválida:', cantidad);
      return res.status(400).json({ 
        message: 'La cantidad debe ser mayor a 0' 
      });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      console.log('❌ Producto no encontrado con ID:', id);
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    console.log('✅ Producto encontrado:', product.name);
    console.log('📊 Stock actual:', product.stock);

    // Agregar stock
    const cantidadNumerica = parseInt(cantidad);
    product.stock += cantidadNumerica;
    
    console.log('📊 Nuevo stock:', product.stock);
    
    await product.save();

    console.log('✅ Stock actualizado exitosamente');

    res.json({
      message: `Se agregaron ${cantidadNumerica} unidades exitosamente`,
      product
    });

  } catch (error) {
    console.error('❌❌❌ ERROR AL AGREGAR STOCK ❌❌❌');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('================================');
    
    res.status(500).json({ 
      message: 'Error al agregar stock',
      error: error.message 
    });
  }
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
  console.log('=================================');
  console.log('🗑️ Petición de eliminar producto');
  console.log('📝 ID:', req.params.id);
  console.log('=================================');
  
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      console.log('❌ Producto no encontrado con ID:', id);
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    console.log('✅ Producto encontrado:', product.name);

    // Eliminar imagen de Cloudinary si existe
    if (product.imagePublicId) {
      try {
        console.log('🗑️ Eliminando imagen de Cloudinary:', product.imagePublicId);
        await cloudinary.uploader.destroy(product.imagePublicId);
        console.log('✅ Imagen eliminada de Cloudinary');
      } catch (error) {
        console.error('⚠️ Error al eliminar imagen de Cloudinary:', error);
        // Continuar con la eliminación del producto aunque falle la eliminación de la imagen
      }
    }

    await Product.findByIdAndDelete(id);

    console.log('✅ Producto eliminado exitosamente');

    res.json({ 
      message: 'Producto eliminado exitosamente',
      deletedProduct: {
        id: product._id,
        name: product.name
      }
    });

  } catch (error) {
    console.error('❌❌❌ ERROR AL ELIMINAR ❌❌❌');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('================================');
    
    res.status(500).json({ 
      message: 'Error al eliminar el producto',
      error: error.message 
    });
  }
};

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    console.log('📋 Obteniendo todos los productos');
    const products = await Product.find().sort({ createdAt: -1 });
    console.log(`✅ ${products.length} productos encontrados`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ 
      message: 'Error al obtener productos',
      error: error.message 
    });
  }
};

// Obtener producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Buscando producto con ID:', id);
    
    const product = await Product.findById(id);

    if (!product) {
      console.log('❌ Producto no encontrado');
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    console.log('✅ Producto encontrado:', product.name);
    res.json(product);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({ 
      message: 'Error al obtener el producto',
      error: error.message 
    });
  }
};

// Búsqueda de productos (opcional)
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        message: 'Se requiere un término de búsqueda' 
      });
    }

    console.log('🔍 Buscando productos con término:', query);

    const products = await Product.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ createdAt: -1 });

    console.log(`✅ ${products.length} productos encontrados`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error al buscar productos:', error);
    res.status(500).json({ 
      message: 'Error al buscar productos',
      error: error.message 
    });
  }
};