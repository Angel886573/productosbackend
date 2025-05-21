import Product from '../models/products.models.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs-extra';

// Obtener productos (para usuarios autenticados)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: ['Error al obtener los productos'] });
  }
};

// Obtener todos los productos (para clientes sin filtros)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: ['Error al obtener todos los productos'] });
  }
};

// Obtener producto por ID
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: ['Producto no encontrado'] });
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: ['Error al obtener el producto'] });
  }
};

// Crear producto
export const createProduct = async (req, res) => {
  try {
    console.log('REQ.USER:', req.user); // útil para depuración

    const { name, description = '', price, quantity } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      user: req.user.id 
    });

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      newProduct.image = {
        url: result.secure_url,
        public_id: result.public_id
      };
    }

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: ['Error al crear el producto'] });
  }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: ['Producto no encontrado'] });

    const { name, description, price, quantity } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: ['Error al actualizar el producto'] });
  }
};

// Actualizar producto con imagen
export const updateProductWithImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: ['Producto no encontrado'] });

    const { name, description, price, quantity } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;

    if (product.image?.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      product.image = {
        url: result.secure_url,
        public_id: result.public_id
      };
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto con imagen:', error);
    res.status(500).json({ message: ['Error al actualizar producto con imagen'] });
  }
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: ['Producto no encontrado'] });

    if (product.image?.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: ['Error al eliminar el producto'] });
  }
};
