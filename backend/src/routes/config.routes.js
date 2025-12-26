import { Router } from "express";
import configController from "../controller/configController.js";

const router = Router();

router.get("/", configController.getConfig);
router.post("/", configController.saveConfig);
router.post("/add-tambos", configController.addTambos); // 🆕 NUEVA RUTA

export default router;