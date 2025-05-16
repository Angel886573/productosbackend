import { Router } from 'express';
// Cambié "validateToken" por "validaToken" en la ruta
import { authRequired } from '../middlewares/validaToken.middleware.js';

import {
    createOrder,
    updateOrderStatus,
    getAllOrders,
    getUserOrders,
} from '../controllers/order.controller.js';

// Importamos el validatorSchema
import { validateSchema } from '../middlewares/validator.middleware.js';

// Importamos el esquema de validación para crear una orden
import { orderSchema } from '../models/order.models.js';

const router = Router();

// Crear una orden
router.post('/order', authRequired, validateSchema(orderSchema), createOrder);

// Actualizar una orden
router.put('/order/:id', authRequired, updateOrderStatus);

// Obtener todas las órdenes (administrador)
router.get('/order/', authRequired, getAllOrders);

// Obtener todas las órdenes (usuario)
router.get('/getuserorders', authRequired, getUserOrders);

export default router;
