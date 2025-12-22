import { Router } from "express";
import productController from "../controller/productController.js";
import upload from "../middlewares/upload.js";

const   router = Router();

// GET productos
router.get("/", productController.getProducts);

// GET por id
router.get("/:id", productController.getProductById);

// POST crear producto (con imagen)
router.post("/", upload.single("image"), productController.createProduct);

// PUT actualizar producto (con imagen)
router.put("/:id", upload.single("image"), productController.updateProduct);

// DELETE
router.delete("/:id", productController.deleteProduct);

// En tu archivo de rutas de productos
router.patch('/products/:id/add-stock', productController.addStock);

export default router;
