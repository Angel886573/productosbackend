import mongoose from 'mongoose';

export const connectDB = async ()=>{
    const url = process.env.MONGODB_URL
    await mongoose.connect(url)
    .then( () => {
        console.log("Base de datos conectada" + url);
    })
    .catch ((error) => {
        console.log("Tienes algun error")
    })
}//Fin de connectDB
 