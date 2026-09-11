const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const connectWithRetry = async (attempts = 5) => {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      console.log(`🔄 Connexion MongoDB - tentative ${attempt}/${attempts}...`);

      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });

      console.log("✅ MongoDB connecté");
      return true;
    } catch (error) {
      console.log(`⚠️ Tentative ${attempt} échouée : ${error.message}`);

      if (attempt < attempts) {
        console.log("⏳ Nouvelle tentative dans 3 secondes...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  return false;
};

const createAdmin = async () => {
  try {
    const connected = await connectWithRetry();

    if (!connected) {
      console.error("❌ Impossible de se connecter à MongoDB.");
      process.exit(1);
    }

    const email = "test@example.com";

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Utilisateur introuvable :", email);
      await mongoose.disconnect();
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log("✅ Utilisateur promu administrateur :", user.email);
    console.log("👤 Rôle :", user.role);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur :", error.message);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    process.exit(1);
  }
};

createAdmin();