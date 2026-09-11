const mongoose = require("mongoose");
const Review = require("../models/Review");

// ==========================================
// CLIENT : récupérer les avis d'un produit
// ==========================================
const getProductReviews = async (req, res) => {
  try {
     if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: "ID produit invalide.",
      });
    }

    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Erreur récupération avis :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de récupérer les avis.",
    });
  }
};

// ==========================================
// CLIENT : ajouter un avis
// ==========================================
const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    if (!product || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Le produit, la note et le commentaire sont obligatoires.",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      product,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Vous avez déjà laissé un avis sur ce produit.",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product,
      rating: Number(rating),
      comment,
    });

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "firstName lastName"
    );

    res.status(201).json({
      success: true,
      message: "Votre avis a été ajouté avec succès.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Erreur création avis :", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Vous avez déjà laissé un avis sur ce produit.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Impossible d'ajouter l'avis.",
    });
  }
};

// ==========================================
// ADMIN : récupérer tous les avis
// ==========================================
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "firstName lastName email phone")
      .populate("product", "name images price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Erreur récupération avis admin :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de récupérer les avis.",
    });
  }
};

// ==========================================
// ADMIN : approuver / masquer un avis
// ==========================================
const updateReviewApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;

    if (typeof isApproved !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "La valeur isApproved doit être true ou false.",
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    )
      .populate("user", "firstName lastName email phone")
      .populate("product", "name images price");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: isApproved
        ? "Avis approuvé avec succès."
        : "Avis masqué avec succès.",
      review,
    });
  } catch (error) {
    console.error("Erreur modification avis :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de modifier l'avis.",
    });
  }
};

// ==========================================
// ADMIN : supprimer un avis
// ==========================================
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Avis supprimé avec succès.",
    });
  } catch (error) {
    console.error("Erreur suppression avis :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de supprimer l'avis.",
    });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  getAllReviews,
  updateReviewApproval,
  deleteReview,
};