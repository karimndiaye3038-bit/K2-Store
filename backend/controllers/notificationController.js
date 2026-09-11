const Notification = require("../models/Notification");
// Créer une notification pour tous les administrateurs
// Créer une notification pour tous les administrateurs
const notifyAdmins = async ({
  title,
  message,
  type = "general",
  link = "",
}) => {
  try {
    const User = require("../models/User");

    const admins = await User.find({
      role: "admin",
      isActive: true,
    }).select("_id");

    if (!admins.length) {
      console.log("Aucun administrateur actif à notifier.");
      return;
    }

    const notifications = admins.map((admin) => ({
      user: admin._id,
      title,
      message,
      type,
      link,
      isRead: false,
    }));

    await Notification.insertMany(notifications);

    console.log(
      `${notifications.length} notification(s) admin créée(s).`
    );
  } catch (error) {
    console.error("Erreur création notification admin :", error);
  }
};
// Récupérer les notifications du client connecté
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Erreur récupération notifications :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de récupérer les notifications.",
    });
  }
};

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marquée comme lue.",
      notification,
    });
  } catch (error) {
    console.error("Erreur notification :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de modifier la notification.",
    });
  }
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Toutes les notifications sont maintenant lues.",
    });
  } catch (error) {
    console.error("Erreur notifications :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de modifier les notifications.",
    });
  }
};

// Supprimer une notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification supprimée.",
    });
  } catch (error) {
    console.error("Erreur suppression notification :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de supprimer la notification.",
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyAdmins,
};