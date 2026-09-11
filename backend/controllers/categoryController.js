const Category = require("../models/Category");

// GET - Toutes les catégories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Erreur récupération catégories :", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des catégories",
    });
  }
};

// GET - Une catégorie
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Catégorie introuvable",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Erreur récupération catégorie :", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

// POST - Créer une catégorie
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Le nom et le slug sont obligatoires",
      });
    }

    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Cette catégorie existe déjà",
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Catégorie créée avec succès",
      category,
    });
  } catch (error) {
    console.error("Erreur création catégorie :", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création",
    });
  }
};

// PUT - Modifier une catégorie
const updateCategory = async (req, res) => {
  try {
    const { name, slug, description, image, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug,
        description,
        image,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Catégorie introuvable",
      });
    }

    res.status(200).json({
      success: true,
      message: "Catégorie modifiée avec succès",
      category,
    });
  } catch (error) {
    console.error("Erreur modification catégorie :", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la modification",
    });
  }
};

// DELETE - Supprimer une catégorie
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Catégorie introuvable",
      });
    }

    res.status(200).json({
      success: true,
      message: "Catégorie supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur suppression catégorie :", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression",
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};