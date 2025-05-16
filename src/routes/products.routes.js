import { Router } from  'express';
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

//importamos el validatorSchema
import { validateSchema  } from '../middlewares/validator.middleware.js';

//importamos el esquema de validacion
import { productSchema } from '../schemas/product.schemas.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits:{
        fileSize: 5 * 1025 * 1024, //5mb
    }
})

const router = Router();

//Obtener todos los productos
router.get('/products', authRequired, getProducts);

//Crear un producto
router.post('/products', authRequired,upload.single('image'), validateSchema(productSchema), createProduct);

//Obtener un producto por id
router.get('/products/:id', authRequired, getProduct);

//Eliminar un producto
router.delete('/products/:id', authRequired, deleteProduct);

//Actualizar un producto
router.put('/products/:id', authRequired, updateProduct);

//Ruta para actualizar un producto y CAMBIAR LA IMAGEN
router.put('/productupdatewithimage/:id', authRequired, upload.single('image'), validateSchema(productSchema), updateProductWithImage);

//Ruta para obtener todos los productos de la compra 
router.get('/getAllProducts', authRequired, getAllProducts);

export default router;
