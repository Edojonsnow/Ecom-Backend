const paystack = require("../config/paystack");
const Order = require("../models/Order");
const User = require("../models/User");

exports.initiatePayment = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    const user = await User.findById(req.user.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const paymentDetails = {
      amount: order.totalAmount * 100, // Paystack expects amount in kobo
      email: user.email,
      reference: `ORDER-${orderId}`,
      // Add other necessary details
    };
    console.log(user.email);
    const payment = await paystack.transaction.initialize(paymentDetails);

    res.json({ paymentUrl: payment.data.authorization_url });
  } catch (error) {
    res.status(500).json({ error: "Payment initialization failed" });
    console.log(error);
  }
};
