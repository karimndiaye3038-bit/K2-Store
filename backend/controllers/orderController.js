const Order = require("../models/Order");
const { notifyAdmins } = require("./notificationController");
/* =========================================================
   CLIENT
========================================================= */

// Créer une commande
// Créer une commande
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      deliveryMethod,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Le panier est vide.",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "L'adresse de livraison est obligatoire.",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Le mode de paiement est obligatoire.",
      });
    }

    // Vérifier les informations de livraison
    const requiredAddressFields = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "city",
    ];

    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({
          success: false,
          message: `Le champ ${field} est obligatoire.`,
        });
      }
    }

    // Charger les vrais produits depuis MongoDB
    const Product = require("../models/Product");

    const productIds = items.map((item) => item.product || item._id);

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    // Vérifier que tous les produits existent
    if (products.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: "Un ou plusieurs produits sont introuvables ou indisponibles.",
      });
    }

    const orderItems = [];

    for (const item of items) {
      const productId = item.product || item._id;

      const product = products.find(
        (p) => p._id.toString() === productId.toString()
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Un produit de votre panier est introuvable.",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Quantité invalide pour le produit "${product.name}".`,
        });
      }

      // Vérification du stock
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour "${product.name}". Stock disponible : ${product.stock}.`,
        });
      }

      // IMPORTANT :
      // Le prix vient de MongoDB, jamais du frontend.
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images?.[0] || "",
      });
    }

    // Calcul sécurisé du total côté serveur
    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Créer la commande
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        region: shippingAddress.region || "",
      },
      paymentMethod,
      deliveryMethod: deliveryMethod || "standard",
      totalAmount,
    });
await notifyAdmins({
  title: "Nouvelle commande",
  message: `Une nouvelle commande vient d'être créée pour un montant de ${totalAmount} FCFA.`,
  type: "order",
  link: `/admin/orders/${order._id}`,
});
    // Décrémenter le stock après création de la commande
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      message: "Commande créée avec succès.",
      order,
    });
  } catch (error) {
    console.error("Erreur création commande :", error);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la commande.",
    });
  }
};
// Mes commandes
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Erreur récupération commandes :",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer vos commandes.",
    });
  }
};

// Détail d'une commande pour le client
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Commande introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Erreur récupération commande :",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer la commande.",
    });
  }
};

/* =========================================================
   ADMIN
========================================================= */

// Toutes les commandes
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "firstName lastName email phone"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Erreur récupération commandes admin :",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les commandes.",
    });
  }
};

// Détail d'une commande pour l'admin
const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id
    )
      .populate(
        "user",
        "firstName lastName email phone"
      )
      .populate(
        "items.product",
        "name images price"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Commande introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Erreur détail commande admin :",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer la commande.",
    });
  }
};

// Modifier le statut d'une commande
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Le statut est obligatoire.",
      });
    }

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Statut de commande invalide.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate(
        "user",
        "firstName lastName email phone"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Commande introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Statut de commande mis à jour.",
      order,
    });
  } catch (error) {
    console.error(
      "Erreur modification statut :",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Impossible de modifier le statut.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
};