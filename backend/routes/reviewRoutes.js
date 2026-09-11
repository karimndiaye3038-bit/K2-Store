const express = require("express");

const {
  getProductReviews,
  createReview,
  getAllReviews,
  updateReviewApproval,
  deleteReview,
} = require("../controllers/reviewController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// CLIENT
// ==========================================

// Avis d'un produit
router.get("/product/:productId", getProductReviews);

// Ajouter un avis
router.post("/", protect, createReview);

// ==========================================
// ADMIN
// ==========================================

// Tous les avis
router.get("/admin/all", protect, adminOnly, getAllReviews);

// Approuver / masquer
router.put(
  "/admin/:id/approval",
  protect,
  adminOnly,
  updateReviewApproval
);

// Supprimer
router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteReview
);

module.exports = router;