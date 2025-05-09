import {z} from 'zod';

export const productSchema = z.object({
    name: z.string({
        required_error: 'Nombre del producto requerido'
    }),
    price: z.string({
        required_error: 'Precio del producto requerido'
    }),
    quantity: z.string({
        required_error: 'Cantidad del producto requerida'
    })
})//fin de productSchema