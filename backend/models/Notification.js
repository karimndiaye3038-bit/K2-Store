const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: [true, "Le message est obligatoire"],
      trim: true,
      maxlength: 500,
    },

    type: {
      type: String,
      enum: [
        "order",
        "promotion",
        "system",
        "review",
        "general",
      ],
      default: "general",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    link: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);