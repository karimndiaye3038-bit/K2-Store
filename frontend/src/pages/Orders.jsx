import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiChevronRight,
} from "react-icons/fi";
import api from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/orders/my-orders");

        setOrders(response.data.orders || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Impossible de récupérer vos commandes."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

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

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 rounded bg-gray-200" />
            <div className="h-32 rounded-2xl bg-gray-200" />
            <div className="h-32 rounded-2xl bg-gray-200" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        <Link
          to="/account"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-blue-600"
        >
          <FiArrowLeft />
          Retour à mon compte
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Mes commandes
          </h1>

          <p className="mt-2 text-gray-500">
            Retrouvez ici l'historique de vos commandes.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiPackage size={36} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Aucune commande
            </h2>

            <p className="mt-2 text-gray-500">
              Vous n'avez pas encore passé de commande.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Découvrir nos produits
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/account/orders/${order._id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
  {order.items?.[0]?.image ? (
    <img
      src={getImageUrl(order.items[0].image)}
      alt={order.items[0].name || "Produit"}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-blue-600">
      <FiPackage size={22} />
    </div>
  )}
</div>

                    <div>
                      <h2 className="font-bold text-gray-900">
                        Commande #{order._id.slice(-8).toUpperCase()}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {order.items?.length || 0} article(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-extrabold text-blue-600">
                        {formatPrice(order.totalAmount)} FCFA
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          order.orderStatus
                        )}`}
                      >
                        {getStatusLabel(order.orderStatus)}
                      </span>
                    </div>

                    <FiChevronRight
                      className="text-gray-400"
                      size={20}
                    />
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Orders;