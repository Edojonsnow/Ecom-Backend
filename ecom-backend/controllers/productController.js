const Product = require("../models/Product");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Invalid product data" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: "Invalid product data" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock + quantity < 0) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    product.stock = +product.stock + +quantity;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    });
    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
