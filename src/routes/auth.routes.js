import { Router } from 'express';
import { login, logout, register, profile, verifyToken } from '../controllers/auth.controller.js';
import { authRequired } from '../middlewares/validaToken.middleware.js';

//Importamos el validatorSchema
import { validateSchema } from '../middlewares/validator.middleware.js';

//Importamos los esquemas de validacion
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js';

const router = Router();

router.get('/verify', verifyToken);
router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', logout)
router.get('/profile', authRequired, profile);

export default router;
