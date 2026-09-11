const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const uploadProductImage = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  protect,
  adminOnly,
  uploadProductImage.array("images", 6),
  createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadProductImage.array("images", 6),
  updateProduct
);

router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;