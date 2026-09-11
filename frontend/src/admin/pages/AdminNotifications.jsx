import { useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../services/api";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications");

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Erreur récupération notifications :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer les notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      setActionLoading(`read-${id}`);

      await api.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur marquage notification :", err);
      setError(
        err.response?.data?.message ||
          "Impossible de marquer la notification comme lue."
      );
    } finally {
      setActionLoading("");
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      setActionLoading("all");

      await api.put("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur marquage global :", err);
      setError(
        err.response?.data?.message ||
          "Impossible de marquer toutes les notifications."
      );
    } finally {
      setActionLoading("");
    }
  };

  const deleteNotification = async (id) => {
    try {
      setActionLoading(`delete-${id}`);

      const notification = notifications.find(
        (item) => item._id === id
      );

      await api.delete(`/notifications/${id}`);

      setNotifications((prev) =>
        prev.filter((item) => item._id !== id)
      );

      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Erreur suppression notification :", err);
      setError(
        err.response?.data?.message ||
          "Impossible de supprimer la notification."
      );
    } finally {
      setActionLoading("");
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      order: "Commande",
      promotion: "Promotion",
      system: "Système",
      review: "Avis",
      general: "Général",
    };

    return types[type] || "Notification";
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FiBell size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>

              <p className="text-sm text-gray-500">
                Gérez les notifications de votre compte administrateur.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              className={loading ? "animate-spin" : ""}
            />
            Actualiser
          </button>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || actionLoading === "all"}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheckCircle />
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total des notifications
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Notifications non lues
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {unreadCount}
          </p>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <FiAlertCircle className="shrink-0" />

          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Contenu */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <FiRefreshCw
              size={30}
              className="animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm text-gray-500">
              Chargement des notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FiBell size={30} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Aucune notification
            </h2>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              Vous n'avez actuellement aucune notification.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-5 transition ${
                  notification.isRead
                    ? "bg-white"
                    : "bg-blue-50/40"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      notification.isRead
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <FiBell />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-semibold ${
                              notification.isRead
                                ? "text-gray-800"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h3>

                          {!notification.isRead && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Non lue
                            </span>
                          )}
                        </div>

                        <span className="mt-1 inline-block text-xs text-gray-500">
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>

                      <span className="text-xs text-gray-400">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {notification.message}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() =>
                            markAsRead(notification._id)
                          }
                          disabled={
                            actionLoading ===
                            `read-${notification._id}`
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                          <FiCheck />
                          Marquer comme lue
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteNotification(notification._id)
                        }
                        disabled={
                          actionLoading ===
                          `delete-${notification._id}`
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <FiTrash2 />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;