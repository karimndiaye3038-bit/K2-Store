import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiExternalLink,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../services/api";
import BackButton from "../components/BackButton";


const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de charger les notifications."
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
      await api.put(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (err) {
      console.error(
        "Erreur lecture notification :",
        err.response?.data?.message || err.message
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        "Erreur lecture notifications :",
        err.response?.data?.message || err.message
      );
    }
  };

  const deleteNotification = async (id) => {
    try {
      const notification = notifications.find(
        (item) => item._id === id
      );

      await api.delete(`/notifications/${id}`);

      setNotifications((current) =>
        current.filter((item) => item._id !== id)
      );

      if (notification && !notification.isRead) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch (err) {
      console.error(
        "Erreur suppression notification :",
        err.response?.data?.message || err.message
      );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      order: "Commande",
      promotion: "Promotion",
      system: "Système",
      review: "Avis",
      general: "Information",
    };

    return labels[type] || "Information";
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <BackButton />
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <FiBell size={24} />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Notifications
              </h1>
            </div>

            <p className="text-sm text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} notification${
                    unreadCount > 1 ? "s" : ""
                  } non lue${unreadCount > 1 ? "s" : ""}`
                : "Toutes vos notifications sont lues"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FiCheck />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <FiRefreshCw
              className="mx-auto mb-3 animate-spin text-blue-600"
              size={28}
            />
            <p className="text-gray-500">
              Chargement des notifications...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="mb-4 text-red-600">{error}</p>

            <button
              type="button"
              onClick={fetchNotifications}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <FiRefreshCw />
              Réessayer
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FiBell size={28} />
            </div>

            <h2 className="mb-2 text-lg font-bold text-gray-900">
              Aucune notification
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Vous n'avez aucune notification pour le moment.
            </p>

            <Link
              to="/products"
              className="inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                  notification.isRead
                    ? "border-gray-200"
                    : "border-blue-200 bg-blue-50/40"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      notification.isRead
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <FiBell size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-gray-900">
                        {notification.title}
                      </h2>

                      {!notification.isRead && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                          Nouveau
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-medium text-blue-600">
                      {getTypeLabel(notification.type)}
                    </span>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      {formatDate(notification.createdAt)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification._id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                        >
                          <FiCheck />
                          Marquer comme lu
                        </button>
                      )}

                      {notification.link && (
                        <Link
                          to={notification.link}
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsRead(notification._id);
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                        >
                          Voir
                          <FiExternalLink />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          deleteNotification(notification._id)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
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
    </main>
  );
};

export default Notifications;