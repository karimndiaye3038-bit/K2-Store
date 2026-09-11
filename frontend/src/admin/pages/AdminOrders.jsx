import { useEffect, useMemo, useState } from "react";
import {
  FiEye,
  FiSearch,
  FiRefreshCw,
  FiX,
  FiPackage,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import api from "../../services/api";

const statusOptions = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "processing", label: "En traitement" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

const getStatusLabel = (status) => {
  return (
    statusOptions.find((item) => item.value === status)?.label || status
  );
};

const getStatusClass = (status) => {
  const classes = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return classes[status] || "bg-gray-100 text-gray-700";
};

const formatPrice = (price) => {
  return `${Number(price || 0).toLocaleString("fr-FR")} FCFA`;
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/admin/all");

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Erreur récupération commandes :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer les commandes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customerName = `${order.user?.firstName || ""} ${
        order.user?.lastName || ""
      }`.toLowerCase();

      const customerEmail = (order.user?.email || "").toLowerCase();

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        order._id.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      const response = await api.put(`/orders/admin/${orderId}/status`, {
        orderStatus: newStatus,
      });

      const updatedOrder = response.data.order;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? { ...order, ...updatedOrder } : order
        )
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder((current) => ({
          ...current,
          ...updatedOrder,
        }));
      }
    } catch (err) {
      console.error("Erreur modification statut :", err);

      alert(
        err.response?.data?.message ||
          "Impossible de modifier le statut."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* En-tête */}
      <div className="mb-6">
        <p className="mb-1 text-sm font-medium uppercase tracking-wide text-blue-600">
          Administration
        </p>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Commandes
            </h1>

            <p className="mt-1 text-gray-500">
              Gérez les commandes de vos clients.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              className={loading ? "animate-spin" : ""}
            />

            Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une commande ou un client..."
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">Tous les statuts</option>

            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-medium">{error}</p>

          <button
            onClick={fetchOrders}
            className="mt-2 text-sm font-semibold underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Chargement */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <FiRefreshCw className="mx-auto mb-4 animate-spin text-3xl text-blue-600" />

          <p className="text-gray-500">
            Chargement des commandes...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Aucune commande */
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <FiPackage className="mx-auto mb-4 text-5xl text-gray-300" />

          <h2 className="text-xl font-semibold text-gray-900">
            Aucune commande
          </h2>

          <p className="mt-2 text-gray-500">
            {search || statusFilter !== "all"
              ? "Aucune commande ne correspond à vos filtres."
              : "Les commandes de vos clients apparaîtront ici."}
          </p>
        </div>
      ) : (
        <>
          {/* Version desktop */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Commande
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Client
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Total
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Statut
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {order.items?.length || 0} article(s)
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {order.user?.firstName}{" "}
                          {order.user?.lastName}
                        </p>

                        <p className="text-sm text-gray-500">
                          {order.user?.email || "-"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={order.orderStatus}
                          disabled={updatingId === order._id}
                          onChange={(e) =>
                            updateStatus(
                              order._id,
                              e.target.value
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${getStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {statusOptions.map((status) => (
                            <option
                              key={status.value}
                              value={status.value}
                            >
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                          <FiEye />
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Version mobile/tablette */}
          <div className="grid gap-4 lg:hidden">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {getStatusLabel(order.orderStatus)}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Client
                    </span>

                    <span className="text-right font-medium text-gray-900">
                      {order.user?.firstName}{" "}
                      {order.user?.lastName}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Articles
                    </span>

                    <span className="font-medium text-gray-900">
                      {order.items?.length || 0}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Total
                    </span>

                    <span className="font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <select
                    value={order.orderStatus}
                    disabled={updatingId === order._id}
                    onChange={(e) =>
                      updateStatus(
                        order._id,
                        e.target.value
                      )
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status.value}
                        value={status.value}
                      >
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    <FiEye />
                    Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal détail */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                  Détail de la commande
                </p>

                <h2 className="text-xl font-bold text-gray-900">
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-6 p-5">
              {/* Client */}
              <section>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Informations client
                </h3>

                <div className="grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
                  <div className="flex gap-3">
                    <FiUser className="mt-0.5 text-gray-400" />

                    <div>
                      <p className="text-xs text-gray-500">
                        Client
                      </p>

                      <p className="font-medium">
                        {selectedOrder.user?.firstName}{" "}
                        {selectedOrder.user?.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <FiPhone className="mt-0.5 text-gray-400" />

                    <div>
                      <p className="text-xs text-gray-500">
                        Téléphone
                      </p>

                      <p className="font-medium">
                        {selectedOrder.user?.phone || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Livraison */}
              <section>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Livraison
                </h3>

                <div className="flex gap-3 rounded-xl bg-gray-50 p-4">
                  <FiMapPin className="mt-0.5 shrink-0 text-gray-400" />

                  <div>
                    <p className="font-medium">
                      {selectedOrder.shippingAddress?.firstName}{" "}
                      {selectedOrder.shippingAddress?.lastName}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {selectedOrder.shippingAddress?.address}
                    </p>

                    <p className="text-sm text-gray-600">
                      {selectedOrder.shippingAddress?.city}
                      {selectedOrder.shippingAddress?.region
                        ? `, ${selectedOrder.shippingAddress.region}`
                        : ""}
                    </p>

                    <p className="text-sm text-gray-600">
                      {selectedOrder.shippingAddress?.phone}
                    </p>
                  </div>
                </div>
              </section>

              {/* Articles */}
              <section>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Articles commandés
                </h3>

                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={`${item.product?._id || item.product}-${index}`}
                      className="flex items-center justify-between gap-4 p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Quantité : {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 font-semibold">
                        {formatPrice(
                          item.price * item.quantity
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Résumé */}
              <section className="rounded-xl bg-gray-900 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">
                    Total commande
                  </span>

                  <span className="text-xl font-bold">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                  <span className="text-gray-400">
                    Paiement
                  </span>

                  <span className="font-medium">
                    {selectedOrder.paymentMethod === "cod"
                      ? "Paiement à la livraison"
                      : selectedOrder.paymentMethod}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-400">
                    <FiCalendar />
                    Date
                  </span>

                  <span>
                    {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>
              </section>

              {/* Statut */}
              <section>
                <label className="mb-2 block font-semibold text-gray-900">
                  Statut de la commande
                </label>

                <select
                  value={selectedOrder.orderStatus}
                  disabled={updatingId === selectedOrder._id}
                  onChange={(e) =>
                    updateStatus(
                      selectedOrder._id,
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {statusOptions.map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                    >
                      {status.label}
                    </option>
                  ))}
                </select>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminOrders;
