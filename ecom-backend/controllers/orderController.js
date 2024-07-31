const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);
const User = require("../models/User");
const axios = require("axios");

exports.payForOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });
    const products = cart.items;
    let user = await User.findById(req.user.id);
    //VERIFY STOCK AVAILABILITY
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

    //RANDOM UNIQUE TRANSACTION REFERENCE
    const txRef = "ORDER-" + Math.floor(Math.random() * 1000000000 + 1);

    //INITIATE PAYMENT
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: txRef,
        amount: cart.total,
        currency: "NGN",
        redirect_url: "http://localhost:3002/api/orders/verify",
        customer: {
          email: user.email,
          name: "osas",
          phonenumber: "0908",
        },
        customizations: {
          title: "Flutterwave Standard Payment",
        },
        meta: {
          products: JSON.stringify(products),
          shippingAddress,
          userId: req.user.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);

    if (response.data.status === "success") {
      res.json({
        paymentUrl: response.data.data.link,
        txRef: txRef,
      });
    } else {
      res.status(400).json({ message: "Failed to initiate payment" });
      console.log(payload.error);
    }
  } catch (err) {
    res.status(500).json({ message: "Error initiating payment" });
    console.error(err.code);
    console.error(err.response.data);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { transaction_id, tx_ref } = req.query;

    // Verify the transaction
    const response = await flw.Transaction.verify({ id: transaction_id });

    if (
      response.data.status === "successful" &&
      response.data.tx_ref === tx_ref
    ) {
      const { products, shippingAddress, userId } = response.data.meta;

      // Create the order
      const newOrder = new Order({
        user: userId,
        products: JSON.parse(products),
        totalAmount: response.data.amount,
        shippingAddress,
        paymentReference: tx_ref,
      });

      const savedOrder = await newOrder.save();

      // Update product stock
      for (let item of JSON.parse(products)) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      res.json({
        message: "Payment successful and order created",
        order: savedOrder,
      });
    } else {
      console.log(response);
      res.status(400).json({ message: "Payment failed or invalid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};

// exports.verificationFailed = async (req, res) => {
//   try {
//     const { status } = req.query;
//     if (status === "failed") {
//       console.log("Verification failed");
//       res.status(200).json({ message: "Payment verification failed" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error handling verification failure" });
//   }
// };
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
