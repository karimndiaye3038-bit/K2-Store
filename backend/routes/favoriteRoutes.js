const express = require("express");

const {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require("../controllers/favoriteController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyFavorites);

router.post("/", protect, addFavorite);

router.get("/check/:productId", protect, checkFavorite);

router.delete("/:productId", protect, removeFavorite);

module.exports = router;