import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiSend,
  FiUser,
} from "react-icons/fi";
import api from "../services/api";
import { useCart } from "../context/CartContext";

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
  if (!date) return "";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // ==========================================
  // PRODUIT
  // ==========================================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        console.error(err);
        setError("Produit introuvable.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ==========================================
  // AVIS
  // ==========================================
  const fetchReviews = async () => {
    if (!id) return;

    try {
      setReviewsLoading(true);
      setReviewError("");

      const response = await api.get(`/reviews/product/${id}`);

      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error("Erreur avis :", err);

      setReviewError(
        err.response?.data?.message ||
          "Impossible de récupérer les avis."
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // ==========================================
  // FAVORIS
  // ==========================================
  useEffect(() => {
    const checkFavorite = async () => {
      const currentToken = localStorage.getItem("token");

      if (!currentToken || !id) {
        setIsFavorite(false);
        return;
      }

      try {
        const response = await api.get(`/favorites/check/${id}`);

        setIsFavorite(response.data.isFavorite);
      } catch {
        setIsFavorite(false);
      }
    };

    checkFavorite();
  }, [id]);

  // ==========================================
  // MOYENNE DES AVIS
  // ==========================================
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return total / reviews.length;
  }, [reviews]);

  // ==========================================
  // PANIER
  // ==========================================
  const handleAddToCart = () => {
    if (!product || product.stock <= 0) {
      return;
    }

    addToCart(product, 1);
  };

  // ==========================================
  // FAVORIS
  // ==========================================
  const handleFavorite = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      window.location.href = "/login";
      return;
    }

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post("/favorites", {
          productId: id,
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de modifier vos favoris."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ==========================================
  // ENVOYER UN AVIS
  // ==========================================
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    setReviewError("");
    setReviewSuccess("");

    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }

    if (rating < 1 || rating > 5) {
      setReviewError("Veuillez sélectionner une note entre 1 et 5.");
      return;
    }

    if (comment.trim().length < 3) {
      setReviewError(
        "Votre commentaire doit contenir au moins 3 caractères."
      );
      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await api.post("/reviews", {
        product: id,
        rating,
        comment: comment.trim(),
      });

      const newReview = response.data.review;

      setReviews((currentReviews) => [
        newReview,
        ...currentReviews,
      ]);

      setRating(0);
      setHoverRating(0);
      setComment("");

      setReviewSuccess("Merci ! Votre avis a été ajouté avec succès.");
    } catch (err) {
      console.error("Erreur ajout avis :", err);

      setReviewError(
        err.response?.data?.message ||
          "Impossible d'ajouter votre avis."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ==========================================
  // CHARGEMENT PRODUIT
  // ==========================================
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid animate-pulse gap-10 lg:grid-cols-2">
          <div className="h-[500px] rounded-3xl bg-gray-200" />

          <div className="space-y-5">
            <div className="h-6 w-32 rounded bg-gray-200" />
            <div className="h-12 w-3/4 rounded bg-gray-200" />
            <div className="h-8 w-40 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Produit introuvable
        </h1>

        <p className="mt-3 text-gray-500">
          Ce produit n'existe pas ou n'est plus disponible.
        </p>

        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <FiArrowLeft />
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* ========================================
          INFORMATIONS PRODUIT
      ======================================== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-blue-600"
        >
          <FiArrowLeft />
          Retour au catalogue
        </Link>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-3xl bg-gray-100">
            {product.images?.[0] ? (
              <img
                src={getImageUrl(product.images[0])}
                alt={product.name}
                className="h-full min-h-[400px] w-full object-cover lg:min-h-[520px]"
              />
            ) : (
              <div className="flex min-h-[400px] items-center justify-center text-gray-400 lg:min-h-[520px]">
                Aucune image disponible
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="flex flex-col justify-center">
            <p className="font-semibold text-blue-600">
              {product.category?.name || "Produit"}
            </p>

            <div className="mt-3 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                {product.name}
              </h1>

              <button
                type="button"
                onClick={handleFavorite}
                disabled={favoriteLoading}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition ${
                  isFavorite
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:text-red-500"
                } disabled:cursor-not-allowed disabled:opacity-60`}
                aria-label={
                  isFavorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"
                }
              >
                <FiHeart
                  size={23}
                  className={isFavorite ? "fill-current" : ""}
                />
              </button>
            </div>

            {/* Note rapide */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <FiStar
                    key={index}
                    size={17}
                    className={
                      index < Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              <span className="text-sm text-gray-500">
                {reviews.length > 0
                  ? `${averageRating.toFixed(1)}/5 (${reviews.length} avis)`
                  : "Aucun avis"}
              </span>
            </div>

            <div className="mt-5">
              <span className="text-3xl font-extrabold text-blue-600">
                {Number(product.price).toLocaleString("fr-FR")} FCFA
              </span>

              {product.oldPrice &&
                product.oldPrice > product.price && (
                  <span className="ml-3 text-lg text-gray-400 line-through">
                    {Number(product.oldPrice).toLocaleString("fr-FR")} FCFA
                  </span>
                )}
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="font-bold text-gray-900">
                Description
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                {product.description}
              </p>
            </div>

            {/* Disponibilité */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700">
                Disponibilité
              </p>

              <p
                className={
                  product.stock > 0
                    ? "mt-1 text-sm font-medium text-green-600"
                    : "mt-1 text-sm font-medium text-red-600"
                }
              >
                {product.stock > 0
                  ? `${product.stock} produit(s) disponible(s)`
                  : "Rupture de stock"}
              </p>
            </div>

            {/* Favoris */}
            <button
              type="button"
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className={`mt-6 flex w-full items-center justify-center gap-3 rounded-xl border px-6 py-4 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isFavorite
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:text-red-600"
              }`}
            >
              <FiHeart
                size={20}
                className={isFavorite ? "fill-current" : ""}
              />

              {favoriteLoading
                ? "Modification..."
                : isFavorite
                  ? "Retirer des favoris"
                  : "Ajouter aux favoris"}
            </button>

            {/* Ajouter au panier */}
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
              className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <FiShoppingCart size={20} />

              {product.stock > 0
                ? "Ajouter au panier"
                : "Rupture de stock"}
            </button>

            {/* Voir le panier */}
            <Link
              to="/cart"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-300 px-6 py-4 font-semibold text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
            >
              Voir mon panier
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
          AVIS CLIENTS
      ======================================== */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Résumé + formulaire */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  Avis clients
                </h2>

                <div className="mt-5 flex items-center gap-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>

                  <div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <FiStar
                          key={index}
                          size={18}
                          className={
                            index < Math.round(averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {reviews.length} avis
                    </p>
                  </div>
                </div>

                <div className="my-6 h-px bg-gray-100" />

                <h3 className="font-bold text-gray-900">
                  Donner votre avis
                </h3>

                {!token ? (
                  <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                    <p>
                      Connectez-vous pour laisser un avis sur ce
                      produit.
                    </p>

                    <Link
                      to="/login"
                      className="mt-3 inline-flex font-semibold underline"
                    >
                      Se connecter
                    </Link>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmitReview}
                    className="mt-4"
                  >
                    <p className="text-sm font-medium text-gray-700">
                      Votre note
                    </p>

                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: 5 }, (_, index) => {
                        const starNumber = index + 1;
                        const active =
                          starNumber <=
                          (hoverRating || rating);

                        return (
                          <button
                            key={starNumber}
                            type="button"
                            onMouseEnter={() =>
                              setHoverRating(starNumber)
                            }
                            onMouseLeave={() =>
                              setHoverRating(0)
                            }
                            onClick={() =>
                              setRating(starNumber)
                            }
                            className="rounded p-1 transition hover:scale-110"
                            aria-label={`${starNumber} étoile${
                              starNumber > 1 ? "s" : ""
                            }`}
                          >
                            <FiStar
                              size={25}
                              className={
                                active
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          </button>
                        );
                      })}
                    </div>

                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Partagez votre expérience avec ce produit..."
                      rows={5}
                      maxLength={1000}
                      className="mt-4 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-1 text-right text-xs text-gray-400">
                      {comment.length}/1000
                    </p>

                    {reviewError && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {reviewError}
                      </div>
                    )}

                    {reviewSuccess && (
                      <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {reviewSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiSend />

                      {reviewSubmitting
                        ? "Envoi..."
                        : "Publier mon avis"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Liste des avis */}
            <div className="lg:col-span-2">
              {reviewsLoading ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <p className="text-sm text-gray-500">
                    Chargement des avis...
                  </p>
                </div>
              ) : reviewError && reviews.length === 0 ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {reviewError}
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
                  <FiStar
                    className="mx-auto text-gray-300"
                    size={42}
                  />

                  <h3 className="mt-4 font-bold text-gray-900">
                    Aucun avis pour le moment
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Soyez le premier à donner votre avis sur ce
                    produit.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <article
                      key={review._id}
                      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <FiUser size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.user?.firstName || "Client"}{" "}
                              {review.user?.lastName || ""}
                            </p>

                            <p className="text-xs text-gray-400">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          {Array.from(
                            { length: 5 },
                            (_, index) => (
                              <FiStar
                                key={index}
                                size={16}
                                className={
                                  index < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                            )
                          )}
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
                        {review.comment}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;