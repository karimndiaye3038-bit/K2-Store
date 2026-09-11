const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDatabase = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const addressRoutes = require("./routes/addressRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
dotenv.config();

const app = express();

/* =========================================================
   CONNEXION MONGODB
========================================================= */

connectDatabase();

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://k2-store.vercel.app",
    ],
    credentials: true,
  })
);
/* =========================================================
   MIDDLEWARES
========================================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   IMAGES / UPLOADS
========================================================= */

// Permet d'accéder aux fichiers dans backend/uploads
// Exemple :
// http://localhost:5000/uploads/products/image.jpg

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =========================================================
   ROUTES API
========================================================= */

// Authentification
app.use("/api/auth", authRoutes);

// Catégories
app.use("/api/categories", categoryRoutes);

// Produits
app.use("/api/products", productRoutes);

// Commandes
app.use("/api/orders", orderRoutes);

// Favoris
app.use("/api/favorites", favoriteRoutes);

// Adresses
app.use("/api/addresses", addressRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
/* =========================================================
   ROUTE DE TEST
========================================================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API e-commerce opérationnelle",
  });
});

/* =========================================================
   GESTION DES ERREURS
========================================================= */

app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur :", err);

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `Erreur upload : ${err.message}`,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Erreur interne du serveur",
  });
});

/* =========================================================
   DÉMARRAGE DU SERVEUR
========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("");
  console.log("========================================");
  console.log("🚀 SERVEUR E-COMMERCE");
  console.log("========================================");
  console.log(`🌐 API : http://localhost:${PORT}`);
  console.log(`🖼️ Images : http://localhost:${PORT}/uploads`);
  console.log("========================================");
  console.log("");
});