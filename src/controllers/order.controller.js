import Products from '../models/products.models.js';
import Orders from '../models/order.models.js';

// Función para crear una orden
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            subTotal,
            iva,
            total,
            totalProducts,
        } = req.body;

        // Validar stock en la base de datos
        for (const item of items) {
            const product = await Products.findById(item.productId);
            if (!product) {
                return res.status(400).json({
                    message: [`Producto con ID ${item.productId} no encontrado en la base de datos`],
                });
            } else if (product.quantity < item.quantity) {
                return res.status(400).json({
                    message: [`No hay suficiente stock en existencia para el producto ${product.name}`],
                });
            }
        }

        // Crear el pedido
        const order = await Orders.create({
            user: req.user.id,
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            })),
            subTotal,
            iva,
            total,
            totalProducts,
            shippingAddress,
            paymentMethod,
            status: 'received',
        });

        // Actualizar stock en la base de datos
        await Promise.all(items.map(async item => {
            await Products.findByIdAndUpdate(item.productId, {
                $inc: { quantity: -item.quantity },
            });
        }));

        res.json(order);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al crear la orden'] });
    }
}; // Fin de createOrder

// Función para actualizar el estado de una orden
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validar el estado
        if (!['received', 'confirmed', 'delivered'].includes(status)) {
            return res.status(400).json({
                message: ["Error al actualizar la orden, estado no válido"],
            });
        }

        // Buscar y actualizar la orden
        const order = await Orders.findByIdAndUpdate(id, { status }, { new: true });

        if (!order) {
            return res.status(400).json({
                message: ["Error al actualizar la orden, orden no encontrada"],
            });
        }

        res.json(order);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ["Error al actualizar la orden"] });
    }
}; // Fin de updateOrderStatus

// Función para listar todas las órdenes (administrador)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Orders.find()
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.productId',
                model: 'Products',
                select: 'name price image quantity',
            });

        if (!orders || orders.length === 0) {
            return res.json([]);
        }

        res.json(orders);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ["Error al obtener todas las órdenes"] });
    }
}; // Fin de getAllOrders

// Función para listar las órdenes del usuario autenticado
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Orders.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.productId',
                model: 'Products',
                select: 'name price image quantity',
            });

            
        res.json(orders);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ["Error al obtener las órdenes del usuario"] });
    }
  // Obtener todas las órdenes
  const orders = await Orders.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'items.productId',
      model: 'Products',
      select: 'name price image quantity'
    });

  if (!orders)
    return res.json({});

}; // Fin de getUserOrders
