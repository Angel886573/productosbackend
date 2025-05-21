import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../middlewares/validaToken.middleware.js';
import {
  getProducts,
  getAllProducts,
  createProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  updateProductWithImage
} from '../controllers/products.controller.js';
import { validateSchema } from '../middlewares/validator.middleware.js';
import { productSchema } from '../schemas/product.schemas.js';

const router = Router();

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB corregido
  }
});

// Rutas protegidas por auth
router.get('/products', authRequired, getProducts);
router.post('/products', authRequired, upload.single('image'), validateSchema(productSchema), createProduct);
router.get('/products/:id', authRequired, getProduct);
router.delete('/products/:id', authRequired, deleteProduct);
router.put('/products/:id', authRequired, updateProduct);
router.put('/products/:id/image', authRequired, upload.single('image'), validateSchema(productSchema), updateProductWithImage);

// Rutas públicas o generales
router.get('/products/public', getAllProducts); 

export default router;
