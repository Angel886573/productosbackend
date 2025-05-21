import Products from '../models/products.models.js';
import Orders from '../models/order.models.js';

// Crear una orden
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

    // Verificar que shippingAddress contenga los campos necesarios
    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.address ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        message: ['Faltan datos del envío: nombre, dirección o teléfono.'],
      });
    }

    console.log("Dirección de envío:", shippingAddress);

    // Validar stock
    for (const item of items) {
      const product = await Products.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          message: [`Producto con ID ${item.productId} no encontrado.`],
        });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: [`No hay suficiente stock para el producto ${product.name}. Solo quedan ${product.quantity} piezas.`],
        });
      }
    }

    // Crear la orden
    const newOrder = new Orders({
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

    await newOrder.save();

    // Actualizar stock
    for (const item of items) {
      const product = await Products.findById(item.productId);
      if (product) {
        product.quantity -= item.quantity;
        await product.save();
      }
    }

    // Retornar la orden con productos poblados
    const populatedOrder = await Orders.findById(newOrder._id)
      .populate({
        path: 'items.productId',
        model: 'Products',
        select: 'name price image quantity',
      });

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error al crear la orden:', error);
    res.status(500).json({ message: ['Error al crear la orden'] });
  }
};


// Actualizar estado de orden
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['received', 'confirmed', 'delivered'].includes(status)) {
      return res.status(400).json({ message: ['Estado no válido'] });
    }

    const order = await Orders.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: ['Orden no encontrada'] });
    }

    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: ['Error al actualizar la orden'] });
  }
};

// Obtener todas las órdenes (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Orders.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.productId',
        model: 'Products',
        select: 'name price image quantity',
      });

    res.json(orders || []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: ['Error al obtener las órdenes'] });
  }
};

// Obtener órdenes del usuario autenticado
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Orders.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.productId',
        model: 'Products',
        select: 'name price image quantity'
      });

    res.json(orders || []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: ["Error al obtener las órdenes del usuario"] });
  }
};
