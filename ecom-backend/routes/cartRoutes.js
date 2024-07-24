const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const auth = require("../middleware/auth");

router.get("/getCartItems", auth, cartController.getCartItems);
router.post("/addToCart", auth, cartController.addItemToCart);
router.delete("/deleteItem/:productId", auth, cartController.deleteItem);

module.exports = router;
