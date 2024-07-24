const Cart = require("../models/Cart");

exports.addItemToCart = async (req, res) => {
  try {
    const { productID, price, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productID
    );
    if (existingItem) {
      existingItem.quantity = +existingItem.quantity + +quantity;
    } else {
      cart.items.push({ product: productID, quantity, price });
    }
    cart.total = cart.items.reduce(
      (total, item) => (total + item.price) * item.quantity,
      0
    );

    await cart.save();
    res.json(cart);
    console.log((existingItem.quantity += quantity));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
