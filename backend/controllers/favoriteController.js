const Favorite = require("../models/Favorite");

const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user._id,
    })
      .populate("product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    console.error("Erreur récupération favoris :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de récupérer vos favoris.",
    });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "L'identifiant du produit est obligatoire.",
      });
    }

    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingFavorite) {
      return res.status(409).json({
        success: false,
        message: "Ce produit est déjà dans vos favoris.",
        favorite: existingFavorite,
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      product: productId,
    });

    await favorite.populate("product");

    res.status(201).json({
      success: true,
      message: "Produit ajouté aux favoris.",
      favorite,
    });
  } catch (error) {
    console.error("Erreur ajout favori :", error);

    res.status(500).json({
      success: false,
      message: "Impossible d'ajouter ce produit aux favoris.",
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Ce produit n'est pas dans vos favoris.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Produit retiré des favoris.",
    });
  } catch (error) {
    console.error("Erreur suppression favori :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de retirer ce produit des favoris.",
    });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.user._id,
      product: productId,
    });

    res.status(200).json({
      success: true,
      isFavorite: Boolean(favorite),
    });
  } catch (error) {
    console.error("Erreur vérification favori :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de vérifier le favori.",
    });
  }
};

module.exports = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};