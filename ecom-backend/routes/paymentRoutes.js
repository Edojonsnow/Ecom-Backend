const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");

// router.get("/getCartItems", auth, paymentController.getCartItems);
router.post("/initiate/:orderId", auth, paymentController.initiatePayment);

module.exports = router;
