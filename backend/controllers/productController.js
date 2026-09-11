const Product = require("../models/Product");

// Convertit une valeur "true"/"false" en booléen
const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return value === "true";
};

// Convertit "S, M, L" en tableau
const parseArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

// Prépare les données reçues depuis JSON ou FormData
const buildProductData = (req) => {
  const body = req.body || {};

  const productData = {
    name: body.name,
    slug: body.slug,
    description: body.description,
    price: Number(body.price),
    oldPrice:
      body.oldPrice !== undefined &&
      body.oldPrice !== null &&
      body.oldPrice !== ""
        ? Number(body.oldPrice)
        : null,
    stock: Number(body.stock),
    category: body.category,
    brand: body.brand || "",
    sizes: parseArray(body.sizes),
    colors: parseArray(body.colors),
    shoeSizes: parseArray(body.shoeSizes),
    weight: body.weight || "",
    isFeatured: parseBoolean(body.isFeatured),
    isPromotion: parseBoolean(body.isPromotion),
    isNewProduct: parseBoolean(body.isNewProduct, true),
    isBestSeller: parseBoolean(body.isBestSeller),
  };

  return productData;
};

// GET - Tous les produits
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };

    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    } else if (sort === "name") {
      sortOption = { name: 1 };
    } else if (sort === "popular") {
      sortOption = { isBestSeller: -1, createdAt: -1 };
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber),

      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      products,
    });
  } catch (error) {
    console.error("Erreur récupération produits :", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des produits",
    });
  }
};

// GET - Un produit
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produit introuvable",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Erreur récupération produit :", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

// POST - Créer un produit
const createProduct = async (req, res) => {
  try {
    const productData = buildProductData(req);

    // Images envoyées par Multer
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(
        (file) => `/uploads/products/${file.filename}`
      );
    } else {
      productData.images = [];
    }

    const product = await Product.create(productData);

    const populatedProduct = await product.populate(
      "category",
      "name slug"
    );

    res.status(201).json({
      success: true,
      message: "Produit créé avec succès",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Erreur création produit :", error);

    res.status(400).json({
      success: false,
      message: error.message || "Erreur lors de la création du produit",
    });
  }
};

// PUT - Modifier un produit
const updateProduct = async (req, res) => {
  try {
    const productData = buildProductData(req);

    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Produit introuvable",
      });
    }

    // Si de nouvelles images sont envoyées, on les remplace
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(
        (file) => `/uploads/products/${file.filename}`
      );
    } else {
      // Sinon, on conserve les images existantes
      productData.images = existingProduct.images || [];
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("category", "name slug");

    res.status(200).json({
      success: true,
      message: "Produit modifié avec succès",
      product,
    });
  } catch (error) {
    console.error("Erreur modification produit :", error);

    res.status(400).json({
      success: false,
      message: error.message || "Erreur lors de la modification",
    });
  }
};

// DELETE - Supprimer un produit
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produit introuvable",
      });
    }

    res.status(200).json({
      success: true,
      message: "Produit supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur suppression produit :", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};