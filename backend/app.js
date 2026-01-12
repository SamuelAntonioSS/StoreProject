import express from "express";
import cors from "cors";

// Importar rutas
import productRoutes from "./src/routes/product.routes.js";
import saleRoutes from "./src/routes/resumen.routes.js";
import configRoutes from "./src/routes/config.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❌ YA NO NECESITAS estas líneas porque las imágenes están en Cloudinary
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API de Logística Tienda",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      sales: "/api/sales",
      config: "/api/config"
    }
  });
});

// Rutas de la API
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/config", configRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

export default app;