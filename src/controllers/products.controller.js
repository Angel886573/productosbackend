import Products from '../models/products.models.js';
import cloudinary from 'cloudinary';



// Obtener todos los productos
export const getProducts = async (req, res) => {
    try {
        const products = await Products.find({ user: req.user.id }).populate('user');
        res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al obtener los productos'] });
    }
};

// Crear un producto
export const createProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(500).json({ message: ['Error al crear un producto, no se encontró la imagen'] });
        }

        const image = req.file;
        const base64Image = Buffer.from(image.buffer).toString("base64");
        const dataUri = `data:${image.mimetype};base64,${base64Image}`;

        const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);

        const { name, price, quantity } = req.body;
        const newProduct = new Products({
            name,
            price,
            quantity,
            image: uploadResponse.url,
            user: req.user.id
        });

        const savedProduct = await newProduct.save();
        res.json(savedProduct);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al crear un producto'] });
    }
};

// Obtener un producto por ID
export const getProduct = async (req, res) => {
    try {
        const product = await Products.findById(req.params.id).populate('user');
        if (!product) {
            return res.status(404).json({ message: ['Producto no encontrado'] });
        }
        res.json(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al obtener un producto'] });
    }
};

// Eliminar un producto
export const deleteProduct = async (req, res) => {
    try {
        const product = await Products.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: ['Producto no encontrado'] });
        }

        // Eliminar imagen de Cloudinary
        const imageUrl = product.image;
        const urlArray = imageUrl.split('/');
        const image = urlArray[urlArray.length - 1];
        const imageName = image.split('.')[0];

        const result = await cloudinary.v2.uploader.destroy(imageName);

        if (result.result === 'ok' || result.result === 'not found') {
            return res.json(product);
        } else {
            return res.status(500).json({ message: ['Error al eliminar la imagen de un producto'] });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al eliminar un producto'] });
    }
};

// Actualizar un producto SIN cambiar la imagen
export const updateProduct = async (req, res) => {
    try {
        const product = await Products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: ['Producto no encontrado'] });
        }

        const dataProduct = {
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            image: req.body.image,
            user: req.user.id
        };

        const updatedProduct = await Products.findByIdAndUpdate(req.params.id, dataProduct, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al actualizar un producto'] });
    }
};

// Actualizar un producto Y actualizar la imagen en Cloudinary
export const updateProductWithImage = async (req, res) => {
    try {
        // Verificar si el producto existe
        const product = await Products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: ['Producto no encontrado'] });
        }

        // Verificar que venga una nueva imagen
        if (!req.file) {
            return res.status(400).json({ message: ['No se encontró una nueva imagen'] });
        }

        // Eliminar imagen anterior de Cloudinary
        const imageUrl = product.image;
        const urlArray = imageUrl.split('/');
        const image = urlArray[urlArray.length - 1];
        const imageName = image.split('.')[0]; // separar por punto para quitar extensión

        await cloudinary.v2.uploader.destroy(imageName);

        // Subir la nueva imagen
        const imageFile = req.file;
        const base64Image = Buffer.from(imageFile.buffer).toString("base64");
        const dataUri = `data:${imageFile.mimetype};base64,${base64Image}`;

        const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);

        // Actualizar el producto con la nueva URL de imagen
        const dataProduct = {
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            image: uploadResponse.url,
            user: req.user.id
        };

        const updatedProduct = await Products.findByIdAndUpdate(req.params.id, dataProduct, { new: true });
        res.json({ message: 'Producto actualizado con nueva imagen', updatedProduct });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: ['Error al actualizar un producto'] });
    }

} //Fin de updateProduct

//Funcion para obtener todos los productos para la compra de productos
export const getAllProducts = async (req, res) => {
  try {
    const products = await Products.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: ['Error al obtener productos'] });
  }
}//Fin del getAllProducts
