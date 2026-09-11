import { useEffect, useMemo, useState } from "react";
import {
  FiCheck,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import api from "../../services/api";

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
  if (!date) return "-";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getUserName = (user) => {
  if (!user) return "Utilisateur";

  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Utilisateur";
};

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, index) => (
    <FiStar
      key={index}
      className={
        index < rating
          ? "fill-yellow-400 text-yellow-400"
          : "text-gray-300"
      }
      size={16}
    />
  ));
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionLoading, setActionLoading] = useState("");

  const fetchReviews = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/reviews/admin/all");

      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error("Erreur récupération avis :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer les avis."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const userName = getUserName(review.user).toLowerCase();
      const userEmail = review.user?.email?.toLowerCase() || "";
      const productName = review.product?.name?.toLowerCase() || "";
      const comment = review.comment?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        userName.includes(searchValue) ||
        userEmail.includes(searchValue) ||
        productName.includes(searchValue) ||
        comment.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && review.isApproved) ||
        (statusFilter === "hidden" && !review.isApproved);

      return matchesSearch && matchesStatus;
    });
  }, [reviews, search, statusFilter]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter((review) => review.isApproved).length;
    const hidden = reviews.filter((review) => !review.isApproved).length;

    const average =
      total > 0
        ? reviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
          ) / total
        : 0;

    return {
      total,
      approved,
      hidden,
      average: average.toFixed(1),
    };
  }, [reviews]);

  const updateApproval = async (review, isApproved) => {
    try {
      setActionLoading(review._id);

      await api.put(`/reviews/admin/${review._id}/approval`, {
        isApproved,
      });

      setReviews((currentReviews) =>
        currentReviews.map((item) =>
          item._id === review._id
            ? { ...item, isApproved }
            : item
        )
      );

      if (selectedReview?._id === review._id) {
        setSelectedReview((current) => ({
          ...current,
          isApproved,
        }));
      }
    } catch (err) {
      console.error("Erreur modification avis :", err);

      alert(
        err.response?.data?.message ||
          "Impossible de modifier cet avis."
      );
    } finally {
      setActionLoading("");
    }
  };

  const deleteReview = async (review) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer définitivement cet avis ?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(review._id);

      await api.delete(`/reviews/admin/${review._id}`);

      setReviews((currentReviews) =>
        currentReviews.filter((item) => item._id !== review._id)
      );

      setSelectedReview(null);
    } catch (err) {
      console.error("Erreur suppression avis :", err);

      alert(
        err.response?.data?.message ||
          "Impossible de supprimer cet avis."
      );
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Avis clients
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Gérez les avis et évaluations de vos clients.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchReviews(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Actualiser
          </button>
        </div>

        {/* Statistiques */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-500">Total avis</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-500">Approuvés</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {stats.approved}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-500">Masqués</p>
            <p className="mt-2 text-2xl font-bold text-orange-500">
              {stats.hidden}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-500">Note moyenne</p>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {stats.average}
              </span>

              <FiStar className="fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un client, produit ou commentaire..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tous les avis</option>
              <option value="approved">Approuvés</option>
              <option value="hidden">Masqués</option>
            </select>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Chargement */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <FiRefreshCw className="animate-spin" />
              Chargement des avis...
            </div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-gray-100">
            <FiStar className="mx-auto mb-4 text-gray-300" size={42} />

            <h2 className="text-lg font-semibold text-gray-800">
              Aucun avis trouvé
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Aucun avis ne correspond aux critères sélectionnés.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-4 lg:hidden">
              {filteredReviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
                >
                  <div className="flex gap-3">
                    {review.product?.images?.[0] ? (
                      <img
                        src={getImageUrl(review.product.images[0])}
                        alt={review.product?.name || "Produit"}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                        <FiStar className="text-gray-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900">
                        {review.product?.name || "Produit supprimé"}
                      </h3>

                      <p className="truncate text-sm text-gray-500">
                        {getUserName(review.user)}
                      </p>

                      <div className="mt-1 flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                    {review.comment}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        review.isApproved
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {review.isApproved ? "Approuvé" : "Masqué"}
                    </span>

                    <span className="text-xs text-gray-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReview(review)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <FiEye />
                      Voir
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading === review._id}
                      onClick={() =>
                        updateApproval(review, !review.isApproved)
                      }
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {review.isApproved ? <FiX /> : <FiCheck />}
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading === review._id}
                      onClick={() => deleteReview(review)}
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Client
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Produit
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Note
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Commentaire
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Statut
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredReviews.map((review) => (
                      <tr
                        key={review._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {getUserName(review.user)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {review.user?.email || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {review.product?.images?.[0] ? (
                              <img
                                src={getImageUrl(
                                  review.product.images[0]
                                )}
                                alt={review.product?.name || "Produit"}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                <FiStar className="text-gray-400" />
                              </div>
                            )}

                            <div>
                              <p className="max-w-[180px] truncate font-medium text-gray-900">
                                {review.product?.name ||
                                  "Produit supprimé"}
                              </p>

                              <p className="text-xs text-gray-400">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>

                          <span className="mt-1 block text-xs text-gray-500">
                            {review.rating}/5
                          </span>
                        </td>

                        <td className="max-w-[280px] px-5 py-4">
                          <p className="line-clamp-2 text-sm text-gray-600">
                            {review.comment}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              review.isApproved
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {review.isApproved
                              ? "Approuvé"
                              : "Masqué"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedReview(review)}
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                              title="Voir"
                            >
                              <FiEye size={17} />
                            </button>

                            <button
                              type="button"
                              disabled={actionLoading === review._id}
                              onClick={() =>
                                updateApproval(
                                  review,
                                  !review.isApproved
                                )
                              }
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                              title={
                                review.isApproved
                                  ? "Masquer"
                                  : "Approuver"
                              }
                            >
                              {review.isApproved ? (
                                <FiX size={17} />
                              ) : (
                                <FiCheck size={17} />
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={actionLoading === review._id}
                              onClick={() => deleteReview(review)}
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                              title="Supprimer"
                            >
                              <FiTrash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal détail */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-900">
                Détail de l'avis
              </h2>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {selectedReview.product?.images?.[0] && (
                <img
                  src={getImageUrl(selectedReview.product.images[0])}
                  alt={selectedReview.product?.name || "Produit"}
                  className="h-48 w-full rounded-xl object-cover"
                />
              )}

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Produit
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {selectedReview.product?.name ||
                    "Produit supprimé"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Client
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {getUserName(selectedReview.user)}
                </p>

                {selectedReview.user?.email && (
                  <p className="text-sm text-gray-500">
                    {selectedReview.user.email}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Note
                </p>

                <div className="mt-2 flex items-center gap-1">
                  {renderStars(selectedReview.rating)}

                  <span className="ml-2 text-sm text-gray-500">
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Commentaire
                </p>

                <div className="mt-2 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {selectedReview.comment}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    selectedReview.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {selectedReview.isApproved
                    ? "Avis approuvé"
                    : "Avis masqué"}
                </span>

                <span className="text-xs text-gray-400">
                  {formatDate(selectedReview.createdAt)}
                </span>
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  disabled={actionLoading === selectedReview._id}
                  onClick={() =>
                    updateApproval(
                      selectedReview,
                      !selectedReview.isApproved
                    )
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {selectedReview.isApproved ? (
                    <>
                      <FiX />
                      Masquer
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Approuver
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={actionLoading === selectedReview._id}
                  onClick={() => deleteReview(selectedReview)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <FiTrash2 />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;