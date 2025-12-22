import express from "express";
import cors from "cors";
import path from "path";

// Importar rutas
import productRoutes from "./src/routes/product.routes.js";
import saleRoutes from "./src/routes/resumen.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hacer pública la carpeta de imágenes
app.use("/uploads", express.static("uploads"));

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API de Logística Tienda",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      sales: "/api/sales"
    }
  });
});

// Rutas
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);

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
