const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");
const { restrictToAdmin } = require("../middleware/isAdmin");
const { restrictTo } = require("../middleware/verifyRoles");

router.post("/", auth, orderController.createOrder);
router.get("/", auth, orderController.getUserOrders);
router.get("/search", auth, orderController.searchOrder);
router.get(
  "/searchAllOrders",
  auth,
  restrictToAdmin,
  orderController.searchAllOrders
);

router.get(
  "/admin/allOrders",
  auth,
  restrictToAdmin,
  orderController.adminAllOrders
);
router.get("/:id", auth, orderController.getOrderById);
router.put(
  "/:id/status",
  auth,
  restrictToAdmin,
  orderController.updateOrderStatus
);

module.exports = router;
