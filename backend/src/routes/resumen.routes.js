import { Router } from "express";
import resumenController from "../controller/resumenController.js";

const router = Router();

// GET /api/resumen - Obtener todos
router.get("/", resumenController.getResumenes);

// GET /api/resumen/:id - Obtener uno
router.get("/:id", resumenController.getResumenById);

// POST /api/resumen - Crear nuevo
router.post("/", resumenController.createResumen);

// PUT /api/resumen/:id - Actualizar
router.put("/:id", resumenController.updateResumen);

// DELETE /api/resumen/:id - Eliminar
router.delete("/:id", resumenController.deleteResumen);

export default router;
