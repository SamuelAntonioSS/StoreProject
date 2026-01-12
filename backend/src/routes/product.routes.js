import { Router } from 'express';
import { upload } from '../../cloudinary.config.js';
import * as productController from '../controller/productController.js';

const router = Router();

router.post('/', upload.single('image'), productController.createProduct);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.patch('/:id/add-stock', productController.addStock); // 👈 NUEVA RUTA
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.delete('/:id', productController.deleteProduct);

export default router;