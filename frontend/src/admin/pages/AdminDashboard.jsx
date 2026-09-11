import { useEffect, useMemo, useState } from "react";
import {
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";
import api from "../../services/api";

const statusLabels = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const formatFCFA = (amount = 0) =>
  new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";

const formatDate = (date) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

const getStatusIcon = (status) => {
  const icons = {
    pending: FiClock,
    confirmed: FiCheckCircle,
    processing: FiLoader,
    shipped: FiTruck,
    delivered: FiCheckCircle,
    cancelled: FiXCircle,
  };

  return icons[status] || FiClock;
};

const getStatusClass = (status) => {
  const classes = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-blue-50 text-blue-700",
    processing: "bg-purple-50 text-purple-700",
    shipped: "bg-indigo-50 text-indigo-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return classes[status] || "bg-gray-100 text-gray-700";
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/dashboard/stats");

      if (response.data.success) {
        setData(response.data);
      } else {
        setError("Impossible de récupérer les statistiques.");
      }
    } catch (err) {
      console.error("Erreur dashboard :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les statistiques."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    const dashboardStats = data?.stats || {};

    return [
      {
        title: "Chiffre d'affaires",
        value: formatFCFA(dashboardStats.revenue),
        icon: FiDollarSign,
        description: "Hors commandes annulées",
        iconClass: "bg-emerald-50 text-emerald-600",
      },
      {
        title: "Commandes",
        value: dashboardStats.totalOrders ?? 0,
        icon: FiShoppingBag,
        description: "Toutes les commandes",
        iconClass: "bg-blue-50 text-blue-600",
      },
      {
        title: "Clients",
        value: dashboardStats.totalClients ?? 0,
        icon: FiUsers,
        description: "Comptes clients actifs",
        iconClass: "bg-purple-50 text-purple-600",
      },
      {
        title: "Produits",
        value: dashboardStats.totalProducts ?? 0,
        icon: FiBox,
        description: "Produits enregistrés",
        iconClass: "bg-orange-50 text-orange-600",
      },
    ];
  }, [data]);

  const ordersByStatus = data?.stats?.ordersByStatus || {};

  const statusList = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FiLoader className="mx-auto animate-spin text-blue-600" size={36} />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            Tableau de bord
          </h1>

          <p className="mt-2 text-gray-500">
            Vue d'ensemble de votre boutique.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          Actualiser
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 break-words text-2xl font-extrabold text-gray-900">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {stat.description}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders status */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            État des commandes
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Répartition actuelle des commandes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statusList.map((status) => {
            const Icon = getStatusIcon(status);
            const count = ordersByStatus[status] || 0;

            return (
              <div
                key={status}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${getStatusClass(
                      status
                    )}`}
                  >
                    <Icon size={19} />
                  </div>

                  <span className="text-sm font-semibold text-gray-700">
                    {statusLabels[status]}
                  </span>
                </div>

                <span className="text-xl font-extrabold text-gray-900">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Commandes récentes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Les 5 dernières commandes reçues.
            </p>
          </div>
        </div>

        {!data?.recentOrders?.length ? (
          <div className="p-10 text-center">
            <FiShoppingBag
              className="mx-auto text-gray-300"
              size={40}
            />

            <p className="mt-3 font-semibold text-gray-600">
              Aucune commande pour le moment
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Les nouvelles commandes apparaîtront ici.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="divide-y divide-gray-100 md:hidden">
              {data.recentOrders.map((order) => (
                <div key={order._id} className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-gray-900">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {statusLabels[order.orderStatus] ||
                        order.orderStatus}
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      {order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : "Client inconnu"}
                    </p>

                    <p className="text-sm text-gray-400">
                      {order.user?.email || ""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {formatDate(order.createdAt)}
                    </span>

                    <span className="font-bold text-gray-900">
                      {formatFCFA(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                      Commande
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                      Client
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                      Statut
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {data.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : "Client inconnu"}
                        </p>

                        <p className="text-xs text-gray-400">
                          {order.user?.email || ""}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatFCFA(order.totalAmount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {statusLabels[order.orderStatus] ||
                            order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
