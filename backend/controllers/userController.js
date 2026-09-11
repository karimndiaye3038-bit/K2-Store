const User = require("../models/User");

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Erreur récupération utilisateurs :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de récupérer les utilisateurs.",
    });
  }
};

// PUT /api/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["client", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Rôle invalide.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    // Empêcher un administrateur de retirer son propre rôle
    if (
      user._id.toString() === req.user._id.toString() &&
      role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas retirer votre propre rôle administrateur.",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Rôle utilisateur mis à jour.",
      user: user.toObject(),
    });
  } catch (error) {
    console.error("Erreur modification rôle :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de modifier le rôle.",
    });
  }
};

// PUT /api/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Le statut est invalide.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    // Empêcher un administrateur de désactiver son propre compte
    if (
      user._id.toString() === req.user._id.toString() &&
      !isActive
    ) {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas désactiver votre propre compte.",
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: isActive
        ? "Utilisateur activé."
        : "Utilisateur désactivé.",
      user: user.toObject(),
    });
  } catch (error) {
    console.error("Erreur modification statut :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de modifier le statut.",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
};