const Address = require("../models/Address");

const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Erreur récupération adresses :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de récupérer vos adresses.",
    });
  }
};

const createAddress = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      region,
      isDefault,
    } = req.body;

    if (!firstName || !lastName || !phone || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "Veuillez remplir tous les champs obligatoires.",
      });
    }

    const shouldBeDefault = Boolean(isDefault);

    if (shouldBeDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    const addressData = await Address.create({
      user: req.user._id,
      firstName,
      lastName,
      phone,
      address,
      city,
      region: region || "",
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      success: true,
      message: "Adresse ajoutée avec succès.",
      address: addressData,
    });
  } catch (error) {
    console.error("Erreur création adresse :", error);

    res.status(500).json({
      success: false,
      message: "Impossible d'ajouter cette adresse.",
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const existingAddress = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Adresse introuvable.",
      });
    }

    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      region,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    existingAddress.firstName = firstName;
    existingAddress.lastName = lastName;
    existingAddress.phone = phone;
    existingAddress.address = address;
    existingAddress.city = city;
    existingAddress.region = region || "";
    existingAddress.isDefault = Boolean(isDefault);

    await existingAddress.save();

    res.status(200).json({
      success: true,
      message: "Adresse mise à jour avec succès.",
      address: existingAddress,
    });
  } catch (error) {
    console.error("Erreur modification adresse :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de modifier cette adresse.",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Adresse introuvable.",
      });
    }

    const wasDefault = address.isDefault;

    await Address.deleteOne({
      _id: address._id,
      user: req.user._id,
    });

    // Si l'adresse supprimée était par défaut,
    // on définit automatiquement la plus récente comme nouvelle adresse par défaut.
    if (wasDefault) {
      const nextAddress = await Address.findOne({
        user: req.user._id,
      }).sort({ createdAt: -1 });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Adresse supprimée avec succès.",
    });
  } catch (error) {
    console.error("Erreur suppression adresse :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de supprimer cette adresse.",
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Adresse introuvable.",
      });
    }

    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      message: "Adresse par défaut mise à jour.",
      address,
    });
  } catch (error) {
    console.error("Erreur adresse par défaut :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de définir cette adresse par défaut.",
    });
  }
};

module.exports = {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};