const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/auth");

router.get("/getProducts", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/createProduct", auth, productController.createProduct);
router.put("/:id", auth, productController.updateProduct);
router.delete("/:id", auth, productController.deleteProduct);
router.put("/:id/stock", auth, productController.updateStock);
router.get("/low-stock", auth, productController.getLowStockProducts);

module.exports = router;
