import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import BackButton from "../components/BackButton";

const Favorites = () => {
  const { addToCart } = useCart();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/favorites");

      setFavorites(response.data.favorites || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de récupérer vos favoris."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/favorites/${productId}`);

      setFavorites((currentFavorites) =>
        currentFavorites.filter(
          (favorite) => favorite.product?._id !== productId
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de retirer ce produit des favoris."
      );
    }
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
  const handleAddToCart = (product) => {
    if (!product || product.stock <= 0) {
      return;
    }

    addToCart(product);
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-2xl border border-gray-200">
                <div className="h-56 rounded-t-2xl bg-gray-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-5 w-24 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50">
        <BackButton />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Mon compte
          </p>

          <div className="mt-2 flex items-center gap-3">
            <FiHeart className="text-red-500" size={30} />

            <h1 className="text-3xl font-extrabold text-gray-900">
              Mes favoris
            </h1>
          </div>

          <p className="mt-2 text-gray-500">
            Retrouvez les produits que vous aimez.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
              <FiHeart size={38} />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Aucun favori
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Vous n'avez pas encore ajouté de produit à vos favoris.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => {
              const product = favorite.product;

              if (!product) {
                return null;
              }

              const image = product.images?.[0];

              return (
                <article
                  key={favorite._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative">
                    <Link to={`/products/${product._id}`}>
                      {image ? (
                        <img
                         src={getImageUrl(image)}
                          alt={product.name}
                          className="h-56 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-56 items-center justify-center bg-gray-100 text-gray-400">
                          Aucune image
                        </div>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50"
                      aria-label={`Retirer ${product.name} des favoris`}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>

                  <div className="p-4">
                    <Link to={`/products/${product._id}`}>
                      <h2 className="line-clamp-2 min-h-12 font-bold text-gray-900 hover:text-blue-600">
                        {product.name}
                      </h2>
                    </Link>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xl font-extrabold text-blue-600">
                        {Number(product.price).toLocaleString("fr-FR")} FCFA
                      </p>

                      {product.stock > 0 ? (
                        <span className="text-xs font-medium text-green-600">
                          En stock
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-red-600">
                          Rupture
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <FiShoppingCart size={18} />
                      {product.stock > 0
                        ? "Ajouter au panier"
                        : "Indisponible"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Favorites;