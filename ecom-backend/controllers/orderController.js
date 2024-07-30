const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress } = req.body;

    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for product ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    const newOrder = new Order({
      user: req.user.id,
      products,
      totalAmount,
      shippingAddress,
      statusHistory: [{ status: "Pending", note: "Order placed" }],
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Invalid order data" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "products.product"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.adminAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
    console.log({ user: req.user.id });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "products.product"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = status;
    order.statusHistory.push({ status, note });
    if (status === "Shipped") {
      order.trackingNumber = req.body.trackingNumber;
    }
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
};

exports.searchAllOrders = async (req, res) => {
  try {
    const { status, _id, totalAmount } = req.query;

    let query = {};

    // let query = { user: req.user.id };
    if (status) query.status = status;
    if (_id) query._id = _id;
    if (totalAmount) query.totalAmount = totalAmount;
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error searching orders", error });
  }
};

exports.searchOrder = async (req, res) => {
  try {
    const { status, _id, totalAmount } = req.query;

    let query = { user: req.user.id };

    if (status) query.status = status;
    if (_id) query._id = _id;
    if (totalAmount) query.totalAmount = totalAmount;
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error searching orders", error });
  }
};
