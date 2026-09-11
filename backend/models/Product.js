const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom du produit est obligatoire"],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: [true, "Le slug est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "La description est obligatoire"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Le prix est obligatoire"],
      min: 0,
    },

    oldPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    stock: {
      type: Number,
      required: [true, "Le stock est obligatoire"],
      min: 0,
      default: 0,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "La catégorie est obligatoire"],
    },

    images: [
      {
        type: String,
      },
    ],

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    // Pour vêtements
    sizes: [
      {
        type: String,
        trim: true,
      },
    ],

    // Pour vêtements, chaussures et accessoires
    colors: [
      {
        type: String,
        trim: true,
      },
    ],

    // Pour chaussures
    shoeSizes: [
      {
        type: String,
        trim: true,
      },
    ],

    // Pour protéines et produits similaires
    weight: {
      type: String,
      trim: true,
      default: "",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isPromotion: {
      type: Boolean,
      default: false,
    },

   isNewProduct: {
  type: Boolean,
  default: true,
},
    isBestSeller: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);