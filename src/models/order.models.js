import mongoose from 'mongoose';
import { z } from 'zod';

// Esquema para los items del carrito
const cartItemSchema = z.object({
    productId: z.string().min(1, "El ID del producto es requerido"),
    quantity: z.number().int().positive("La cantidad debe ser un entero positivo"),
    price: z.number().positive("El precio debe ser un número positivo"),
});

// Esquema para la dirección de envío
const shippingAddressSchema = z.object({
    address: z.string().min(5, "La dirección debe tener al menos 5 caracteres").trim(),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").trim(),
    phone: z.string()
        .min(7, "El teléfono debe tener al menos 7 caracteres")
        .max(20, "El teléfono no puede exceder 20 caracteres")
        .regex(/^[\d\s\+\-\(\)]{7,20}$/, "Número de teléfono inválido")
        .trim(),
});

// Esquema para los detalles de la tarjeta
const cardDetailsSchema = z.object({
    cardName: z.string().min(1, "El nombre en la tarjeta es requerido").trim(),
    cardNumber: z.string()
        .min(12, "El número de tarjeta debe tener al menos 12 dígitos")
        .max(19, "El número de tarjeta no puede exceder 19 dígitos")
        .regex(/^\d{12,19}$/, "Número de tarjeta inválido")
        .trim(),
    ccv: z.string()
        .min(3, "El CVV debe tener al menos 3 dígitos")
        .max(4, "El CVV no puede exceder 4 dígitos")
        .regex(/^\d{3,4}$/, "El CVV solo debe contener dígitos"),
    expirationDate: z.string()
        .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Formato de fecha inválido (MM/YY)")
        .trim(),
});

// Esquema para la información de pago
const paymentInfoSchema = z.discriminatedUnion('method', [
    z.object({
        method: z.literal('card'),
        cardDetails: cardDetailsSchema,
    }),
    z.object({
        method: z.enum(['pickup', 'transfer', 'cash']),
    }),
]);

// Esquema principal para la orden
export const orderSchema = z.object({
    items: z.array(cartItemSchema).min(1, "La orden debe tener al menos un item"),
    subTotal: z.number().positive("El subtotal debe ser positivo"),
    iva: z.number().min(0, "El IVA no puede ser negativo"),
    total: z.number().positive("El total debe ser positivo"),
    totalProducts: z.number().int().positive("El total de productos debe ser un entero positivo"),
    shippingAddress: shippingAddressSchema,
    paymentMethod: paymentInfoSchema,
    status: z.enum(['received', 'confirmed', 'cancelled', 'delivered']).default('received'),
    createdAt: z.date().optional(),
})
.superRefine((data, ctx) => {
    const calculatedTotal = data.subTotal + data.iva;
    if (Math.abs(calculatedTotal - data.total) > 0.01) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El total calculado (${calculatedTotal}) no coincide con el total proporcionado (${data.total})`,
            path: ['total'],
        });
    }

    const calculatedProducts = data.items.reduce((sum, item) => sum + item.quantity, 0);
    if (calculatedProducts !== data.totalProducts) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El total de productos calculado (${calculatedProducts}) no coincide con el valor proporcionado (${data.totalProducts})`,
            path: ['totalProducts'],
        });
    }
});

// Esquema de Mongoose para la colección Orders
const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                quantity: Number,
                price: Number,
            },
        ],
        subTotal: { type: Number, required: true },
        iva: { type: Number, required: true },
        total: { type: Number, required: true },
        totalProducts: { type: Number, required: true },
        shippingAddress: {
            address: { type: String, required: true, trim: true },
            name: { type: String, required: true, trim: true },
            phone: {
                type: String,
                required: true,
                trim: true,
                validate: {
                    validator: function (v) {
                        return /^[\d\s\+\-\(\)]{7,20}$/.test(v);
                    },
                    message: props => `${props.value} no es un número de teléfono válido!`,
                },
            },
        },
        paymentMethod: {
            method: {
                type: String,
                required: true,
                enum: ['card', 'pickup', 'transfer', 'cash'],
                default: 'card',
            },
            cardDetails: {
                cardName: {
                    type: String,
                    trim: true,
                    required: function () {
                        return this.paymentMethod.method === 'card';
                    },
                },
                cardNumber: {
                    type: String,
                    trim: true,
                    required: function () {
                        return this.paymentMethod.method === 'card';
                    },
                    validate: {
                        validator: function (v) {
                            return /^\d{12,19}$/.test(v.replace(/\s+/g, ''));
                        },
                        message: props => `${props.value} no es un número de tarjeta válido!`,
                    },
                },
                expirationDate: {
                    type: String,
                    trim: true,
                    required: function () {
                        return this.paymentMethod.method === 'card';
                    },
                    validate: {
                        validator: function (v) {
                            return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(v);
                        },
                        message: props => `${props.value} no es una fecha válida (MM/YY)!`,
                    },
                },
                ccv: {
                    type: String,
                    trim: true,
                    required: function () {
                        return this.paymentMethod.method === 'card';
                    },
                    validate: {
                        validator: function (v) {
                            return /^\d{3,4}$/.test(v);
                        },
                        message: props => `${props.value} no es un CVV válido!`,
                    },
                },
            },
        },
        status: {
            type: String,
            enum: ['received', 'confirmed', 'cancelled', 'delivered'],
            default: 'received',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Orders', OrderSchema);
