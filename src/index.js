import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';

import { connectDB } from './db.js';

import { v2 as cloudinary } from 'cloudinary';
import { initializeSetup } from './libs/initialSetup.js';


// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función principal de inicio
const startServer = async () => {
    try {
        await connectDB();         // Conectar a MongoDB
        await initializeSetup();   // Inicializar roles y admin si es necesario
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
        
    } catch (error) {
        console.error('Error iniciando el servidor:', error);
        process.exit(1); // Termina la app si falla la inicialización
    }
};
startServer();
