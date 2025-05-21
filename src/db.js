import mongoose from 'mongoose';
export const connectDB = async () => {
  try {
    const environment = process.env.ENVIRONMENT || 'local';
    console.log('🌎 ENVIRONMENT:', environment);
    console.log('🔗 MONGODB_URL_PROD:', process.env.MONGODB_URL_PROD);
    console.log('🔗 MONGODB_URL_LOCAL:', process.env.MONGODB_URL_LOCAL);

    const url =
      environment === 'production'
        ? process.env.MONGODB_URL_PROD
        : process.env.MONGODB_URL_LOCAL;

    if (!url) {
      throw new Error('No se encontró la URL de MongoDB para este entorno');
    }

    await mongoose.connect(url);
    console.log('✅ Base de datos conectada a:', url);
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
  }
};

