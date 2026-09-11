const mongoose = require("mongoose");
require("dns");

const dns = require("dns");

dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);
const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB connecté : ${connection.connection.host}`);
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB :", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;