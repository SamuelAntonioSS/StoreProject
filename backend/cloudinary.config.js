import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import config from './config.js';

// 👇 AGREGAR ESTOS LOGS TEMPORALES
console.log('🔑 Cloudinary Config:', {
  cloudName: config.cloudinary.cloudName,
  apiKey: config.cloudinary.apiKey ? '✅ Presente' : '❌ Falta',
  apiSecret: config.cloudinary.apiSecret ? '✅ Presente' : '❌ Falta'
});

// Configurar Cloudinary usando config centralizado
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// Configurar storage para multer con Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // Carpeta en Cloudinary donde se guardarán las imágenes
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // Optimizar tamaño
  }
});

// Crear multer instance
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

export default cloudinary;