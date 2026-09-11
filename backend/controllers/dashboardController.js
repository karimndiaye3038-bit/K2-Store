const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      totalClients,
      totalProducts,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),

      User.countDocuments({
        role: "client",
      }),

      Product.countDocuments(),

      Order.countDocuments({
        orderStatus: "pending",
      }),

      Order.countDocuments({
        orderStatus: "confirmed",
      }),

      Order.countDocuments({
        orderStatus: "processing",
      }),

      Order.countDocuments({
        orderStatus: "shipped",
      }),

      Order.countDocuments({
        orderStatus: "delivered",
      }),

      Order.countDocuments({
        orderStatus: "cancelled",
      }),

      Order.aggregate([
        {
          $match: {
            orderStatus: {
              $ne: "cancelled",
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      Order.find()
        .populate(
          "user",
          "firstName lastName email phone"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5),
    ]);

    const revenue =
      revenueResult.length > 0
        ? revenueResult[0].total
        : 0;

    res.status(200).json({
      success: true,

      stats: {
        totalOrders,
        totalClients,
        totalProducts,
        revenue,

        ordersByStatus: {
          pending: pendingOrders,
          confirmed: confirmedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
      },

      recentOrders,
    });
  } catch (error) {
    console.error(
      "Erreur statistiques dashboard :",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Impossible de récupérer les statistiques du dashboard.",
    });
  }
};

module.exports = {
  getDashboardStats,
};