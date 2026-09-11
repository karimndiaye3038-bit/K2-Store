import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiMapPin,
  FiCreditCard,
} from "react-icons/fi";
import api from "../services/api";

const OrderDetail = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/orders/${id}`);

        setOrder(response.data.order);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Impossible de récupérer cette commande."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const formatPrice = (price) => {
    return Number(price).toLocaleString("fr-FR");
  };
const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const serverUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${serverUrl}${image.startsWith("/") ? image : `/${image}`}`;
};
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    const statuses = {
      pending: "En attente",
      confirmed: "Confirmée",
      processing: "En préparation",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
    };

    return statuses[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: "bg-yellow-50 text-yellow-700",
      confirmed: "bg-blue-50 text-blue-700",
      processing: "bg-purple-50 text-purple-700",
      shipped: "bg-indigo-50 text-indigo-700",
      delivered: "bg-green-50 text-green-700",
      cancelled: "bg-red-50 text-red-700",
    };

    return classes[status] || "bg-gray-50 text-gray-700";
  };

  const getPaymentLabel = (method) => {
    const methods = {
      cod: "Paiement à la livraison",
      wave: "Wave",
      orange_money: "Orange Money",
      card: "Carte bancaire",
      stripe: "Stripe",
    };

    return methods[method] || method;
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-5">
            <div className="h-6 w-40 rounded bg-gray-200" />
            <div className="h-40 rounded-2xl bg-gray-200" />
            <div className="h-64 rounded-2xl bg-gray-200" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <FiPackage
            className="mx-auto text-gray-300"
            size={60}
          />

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Commande introuvable
          </h1>

          <p className="mt-3 text-gray-500">
            {error || "Cette commande n'existe pas."}
          </p>

          <Link
            to="/account/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <FiArrowLeft />
            Retour aux commandes
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        <Link
          to="/account/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-blue-600"
        >
          <FiArrowLeft />
          Retour aux commandes
        </Link>

        {/* En-tête */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Commande passée le {formatDate(order.createdAt)}
              </p>

              <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Commande #{order._id.slice(-8).toUpperCase()}
              </h1>
            </div>

            <span
              className={`self-start rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                order.orderStatus
              )}`}
            >
              {getStatusLabel(order.orderStatus)}
            </span>
          </div>
        </div>

        {/* Produits */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <FiPackage className="text-blue-600" />
            Produits commandés
          </h2>

          <div className="mt-6 divide-y divide-gray-100">
            {order.items?.map((item, index) => (
              <div
                key={`${item.product}-${index}`}
                className="flex gap-4 py-5 first:pt-0 last:pb-0"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {item.image ? (
                   <img
  src={getImageUrl(item.image)}
  alt={item.name}
  className="h-full w-full object-cover"
/>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <FiPackage size={25} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Quantité : {item.quantity}
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {formatPrice(item.price)} FCFA / unité
                  </p>
                </div>

                <p className="font-bold text-gray-900">
                  {formatPrice(item.price * item.quantity)} FCFA
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                Total
              </span>

              <span className="text-2xl font-extrabold text-blue-600">
                {formatPrice(order.totalAmount)} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Livraison et paiement */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Adresse */}
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <FiMapPin className="text-blue-600" />
              Adresse de livraison
            </h2>

            <div className="mt-5 space-y-1 text-gray-600">
              <p className="font-semibold text-gray-900">
                {order.shippingAddress?.firstName}{" "}
                {order.shippingAddress?.lastName}
              </p>

              <p>{order.shippingAddress?.address}</p>

              <p>
                {order.shippingAddress?.city}
                {order.shippingAddress?.region
                  ? `, ${order.shippingAddress.region}`
                  : ""}
              </p>

              <p className="pt-2">
                {order.shippingAddress?.phone}
              </p>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                Mode de livraison
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {order.deliveryMethod === "express"
                  ? "Livraison express"
                  : "Livraison standard"}
              </p>
            </div>
          </div>

          {/* Paiement */}
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <FiCreditCard className="text-blue-600" />
              Paiement
            </h2>

            <div className="mt-5">
              <p className="text-sm text-gray-500">
                Mode de paiement
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {getPaymentLabel(order.paymentMethod)}
              </p>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                Statut du paiement
              </p>

              <span className="mt-2 inline-flex rounded-full bg-yellow-50 px-3 py-1 text-sm font-semibold capitalize text-yellow-700">
                {order.paymentStatus === "paid"
                  ? "Payé"
                  : order.paymentStatus === "failed"
                  ? "Échec"
                  : order.paymentStatus === "refunded"
                  ? "Remboursé"
                  : "En attente"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default OrderDetail;