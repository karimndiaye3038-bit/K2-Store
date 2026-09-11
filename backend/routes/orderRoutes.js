const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Création d'une commande client
router.post("/", protect, createOrder);

// Commandes administrateur
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.get("/admin/:id", protect, adminOnly, getAdminOrderById);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatus);

// Commandes du client connecté
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

module.exports = router;