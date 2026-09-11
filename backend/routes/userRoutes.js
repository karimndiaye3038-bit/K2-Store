const express = require("express");

const {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} = require("../controllers/userController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getAllUsers);

router.put("/:id/role", protect, adminOnly, updateUserRole);

router.put("/:id/status", protect, adminOnly, updateUserStatus);

module.exports = router;
