import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';


//Importamos las rutas para usuarios
import authRoutes from './routes/auth.routes.js';
//Importamos las rutas para productos
import productRoutes from './routes/products.routes.js';
//Importamos las rutas para las ordnes
import orderRoutes from './routes/order.routes.js';

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:4000',
        process.env.BASE_URL_BACKEND,
        process.env.BASE_URL_FRONTEND
    ] ,
    credentials:true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded( { extended: false }));

//Indicamos que el servidor utilice el objeto authRoutes
app.use('/api/', authRoutes);
app.use('/api/', productRoutes);
app.use('/api/', orderRoutes);

//ruta principal del api
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenido al API REST de productos",
        version: "1.0.0",
        rutasDisponibles: [
            { endpoint: "/api/register", method:"POST", description: "Crea un nuevo usuario"},
            { endpoint: "/api/login", method:"POST", description: "Iniciar sesion"}
        ]
    });
});

export default app;
