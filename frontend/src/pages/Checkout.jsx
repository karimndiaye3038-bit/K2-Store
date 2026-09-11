import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiMapPin, FiShoppingBag } from "react-icons/fi";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const formatPrice = (price) =>
    new Intl.NumberFormat("fr-FR").format(price) + " FCFA";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);

        const response = await api.get("/addresses");

        const userAddresses = response.data.addresses || [];

        setAddresses(userAddresses);

        const defaultAddress = userAddresses.find(
          (address) => address.isDefault
        );

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (userAddresses.length > 0) {
          setSelectedAddressId(userAddresses[0]._id);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Impossible de récupérer vos adresses."
        );
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [navigate]);

  const selectedAddress = addresses.find(
    (address) => address._id === selectedAddressId
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (cartItems.length === 0) {
      setError("Votre panier est vide.");
      return;
    }

    if (!selectedAddress) {
      setError("Veuillez sélectionner une adresse de livraison.");
      return;
    }

    try {
      setSubmitting(true);

      const orderItems = cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.images?.[0] || "",
      }));

      const response = await api.post("/orders", {
        items: orderItems,
        shippingAddress: {
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          region: selectedAddress.region || "",
        },
        deliveryMethod,
        paymentMethod,
      });

      const createdOrder = response.data.order;

      clearCart();

      navigate(`/account/orders/${createdOrder._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de la création de votre commande."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <FiShoppingBag size={38} />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            Votre panier est vide
          </h1>

          <p className="mt-3 text-gray-500">
            Ajoutez des produits à votre panier avant de passer commande.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Voir les produits
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Commande
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Finaliser ma commande
          </h1>

          <p className="mt-2 text-gray-500">
            Vérifiez votre adresse et choisissez votre mode de paiement.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-6">
            {/* Adresse */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiMapPin size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Adresse de livraison
                  </h2>

                  <p className="text-sm text-gray-500">
                    Où souhaitez-vous recevoir votre commande ?
                  </p>
                </div>
              </div>

              {loadingAddresses ? (
                <div className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
                  Chargement de vos adresses...
                </div>
              ) : addresses.length === 0 ? (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-semibold text-amber-800">
                    Aucune adresse enregistrée.
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    Ajoutez une adresse avant de passer votre commande.
                  </p>

                  <Link
                    to="/account/addresses"
                    className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Ajouter une adresse
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address._id}
                      className={`block cursor-pointer rounded-xl border p-4 transition ${
                        selectedAddressId === address._id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          value={address._id}
                          checked={selectedAddressId === address._id}
                          onChange={(event) =>
                            setSelectedAddressId(event.target.value)
                          }
                          className="mt-1 h-4 w-4 accent-blue-600"
                        />

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {address.firstName} {address.lastName}
                            </p>

                            {address.isDefault && (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                Par défaut
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-gray-600">
                            {address.address}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {address.city}
                            {address.region && `, ${address.region}`}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {address.phone}
                          </p>
                        </div>

                        {selectedAddressId === address._id && (
                          <FiCheckCircle
                            className="shrink-0 text-blue-600"
                            size={22}
                          />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Livraison */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Mode de livraison
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-xl border p-4 ${
                    deliveryMethod === "standard"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="standard"
                    checked={deliveryMethod === "standard"}
                    onChange={(event) =>
                      setDeliveryMethod(event.target.value)
                    }
                    className="mr-3 accent-blue-600"
                  />

                  <span className="font-semibold text-gray-900">
                    Livraison standard
                  </span>

                  <p className="mt-1 text-sm text-gray-500">
                    Livraison locale
                  </p>
                </label>

                <label
                  className={`cursor-pointer rounded-xl border p-4 ${
                    deliveryMethod === "express"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="express"
                    checked={deliveryMethod === "express"}
                    onChange={(event) =>
                      setDeliveryMethod(event.target.value)
                    }
                    className="mr-3 accent-blue-600"
                  />

                  <span className="font-semibold text-gray-900">
                    Livraison express
                  </span>

                  <p className="mt-1 text-sm text-gray-500">
                    Traitement prioritaire
                  </p>
                </label>
              </div>
            </div>

            {/* Paiement */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Mode de paiement
              </h2>

              <div className="mt-5 space-y-3">
                <label
                  className={`block cursor-pointer rounded-xl border p-4 ${
                    paymentMethod === "cod"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                    className="mr-3 accent-blue-600"
                  />

                  <span className="font-semibold text-gray-900">
                    Paiement à la livraison
                  </span>

                  <p className="mt-1 ml-6 text-sm text-gray-500">
                    Payez à la réception de votre commande.
                  </p>
                </label>

                <label
                  className={`block cursor-pointer rounded-xl border p-4 ${
                    paymentMethod === "wave"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="wave"
                    checked={paymentMethod === "wave"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                    className="mr-3 accent-blue-600"
                  />

                  <span className="font-semibold text-gray-900">
                    Wave
                  </span>

                  <p className="mt-1 ml-6 text-sm text-gray-500">
                    Intégration du paiement à configurer.
                  </p>
                </label>

                <label
                  className={`block cursor-pointer rounded-xl border p-4 ${
                    paymentMethod === "orange_money"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="orange_money"
                    checked={paymentMethod === "orange_money"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                    className="mr-3 accent-blue-600"
                  />

                  <span className="font-semibold text-gray-900">
                    Orange Money
                  </span>

                  <p className="mt-1 ml-6 text-sm text-gray-500">
                    Intégration du paiement à configurer.
                  </p>
                </label>

                <label
                  className={`block cursor-pointer rounded-xl border p-4 ${
                    paymentMethod === "card"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                    className="mr-3 accent-blue-600"
                  />

                  <span className="font-semibold text-gray-900">
                    Carte bancaire
                  </span>

                  <p className="mt-1 ml-6 text-sm text-gray-500">
                    Paiement sécurisé à configurer.
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-gray-900">
              Résumé de la commande
            </h2>

            <div className="mt-5 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 border-b border-gray-100 pb-4"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiShoppingBag className="text-gray-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Quantité : {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-b border-gray-200 pb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Livraison</span>
                <span>À confirmer</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">
                Total
              </span>

              <span className="text-2xl font-extrabold text-blue-600">
                {formatPrice(cartTotal)}
              </span>
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingAddresses ||
                addresses.length === 0
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting ? (
                "Création de la commande..."
              ) : (
                <>
                  <FiCheckCircle size={20} />
                  Confirmer la commande
                </>
              )}
            </button>

            <Link
              to="/cart"
              className="mt-3 flex w-full justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Retour au panier
            </Link>
          </aside>
        </form>
      </div>
    </section>
  );
};

export default Checkout;