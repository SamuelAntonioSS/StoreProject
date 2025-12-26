import { Router } from "express";
import productController from "../controller/productController.js";
import upload from "../middlewares/upload.js";

const router = Router();

// GET productos
router.get("/", productController.getProducts);

// GET por id
router.get("/:id", productController.getProductById);

// POST crear producto (con imagen)
router.post("/", upload.single("image"), productController.createProduct);

// PUT actualizar producto (con imagen)
router.put("/:id", upload.single("image"), productController.updateProduct);

// PATCH agregar stock - ⚠️ CORREGIDO
router.patch("/:id/add-stock", productController.addStock);

// DELETE
router.delete("/:id", productController.deleteProduct);

export default router;