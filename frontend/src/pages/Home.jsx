
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiStar,
  FiMail,
  FiShoppingBag,
} from "react-icons/fi";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const getImageUrl = (image) => {
  if (!image) return "/placeholder-product.jpg";

  const baseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const serverUrl = baseUrl.replace(/\/api\/?$/, "");

  if (
    image.startsWith("http://localhost:5000") ||
    image.startsWith("https://localhost:5000")
  ) {
    return image.replace(
      /^https?:\/\/localhost:5000/,
      serverUrl
    );
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${serverUrl}${image.startsWith("/") ? "" : "/"}${image}`;
};
const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR").format(price || 0) + " FCFA";
};

function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition duration-300 group">
      <Link to={`/products/${product._id}`}>
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-product.jpg";
            }}
          />

          {product.oldPrice &&
            product.oldPrice > product.price && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                PROMO
              </span>
            )}

          {product.isNewProduct && (
            <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              NOUVEAU
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        {product.category?.name && (
          <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
            {product.category.name}
          </p>
        )}

        <Link to={`/products/${product._id}`}>
          <h3 className="mt-1 text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>

          {product.oldPrice &&
            product.oldPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
        </div>

        <button
          type="button"
          onClick={() => addToCart(product)}
          disabled={product.stock <= 0}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition"
        >
          <FiShoppingBag />
          {product.stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
        </button>
      </div>
    </article>
  );
}

function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const [categoriesResponse, productsResponse] =
          await Promise.all([
            api.get("/categories"),
            api.get("/products", {
              params: {
                page: 1,
                limit: 50,
              },
            }),
          ]);

        setCategories(
          categoriesResponse.data.categories || []
        );

        setProducts(
          productsResponse.data.products || []
        );
      } catch (err) {
        console.error("Erreur page d'accueil :", err);

        setError(
          "Impossible de charger les données de la boutique."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  /*
   * Produits populaires
   */
  const popularProducts = products
    .filter((product) => product.isBestSeller)
    .slice(0, 4);

  /*
   * Promotions
   */
  const promotionProducts = products
    .filter(
      (product) =>
        product.isPromotion ||
        (product.oldPrice && product.oldPrice > product.price)
    )
    .slice(0, 4);

  /*
   * Nouveautés
   */
  const newProducts = products
    .filter((product) => product.isNewProduct)
    .slice(0, 4);

  /*
   * Meilleures ventes
   */
  const bestSellerProducts = products
    .filter((product) => product.isBestSeller)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-medium">
              <FiCheckCircle />
              Votre boutique en ligne
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Achetez simplement.
              <br />
              Recevez rapidement.
            </h1>

            <p className="mt-6 text-lg text-blue-100 max-w-2xl">
              Découvrez notre sélection de produits de qualité
              et profitez d'une expérience d'achat simple,
              rapide et sécurisée.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-blue-700 rounded-xl font-bold hover:bg-gray-100 transition"
              >
                Découvrir les produits
                <FiArrowRight />
              </Link>

              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-white/40 rounded-xl font-bold hover:bg-white/10 transition"
              >
                Voir les catégories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiTruck size={23} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Livraison rapide
                </h3>
                <p className="text-sm text-gray-500">
                  Partout au Sénégal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <FiShield size={23} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Paiement sécurisé
                </h3>
                <p className="text-sm text-gray-500">
                  Transactions protégées
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FiCheckCircle size={23} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Produits de qualité
                </h3>
                <p className="text-sm text-gray-500">
                  Sélection soigneuse
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <FiHeadphones size={23} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Support client
                </h3>
                <p className="text-sm text-gray-500">
                  Nous sommes à votre écoute
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ERREUR */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-blue-600 font-semibold">
              Découvrez
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              Nos catégories
            </h2>
          </div>

          <Link
            to="/categories"
            className="hidden sm:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
          >
            Toutes les catégories
            <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-48 bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-500">
            Aucune catégorie disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="group relative overflow-hidden rounded-2xl bg-white border shadow-sm hover:shadow-xl transition"
              >
                <div className="h-48 bg-gray-100">
                  <img
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder-product.jpg";
                    }}
                  />
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
                  <h3 className="text-white font-bold text-lg">
                    {category.name}
                  </h3>

                  <p className="text-white/80 text-sm mt-1">
                    Découvrir
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* PROMOTIONS */}
      {promotionProducts.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-red-500 font-semibold">
                  Offres limitées
                </p>
                <h2 className="text-3xl font-bold text-gray-900">
                  Promotions
                </h2>
              </div>

              <Link
                to="/products"
                className="flex items-center gap-2 text-blue-600 font-semibold"
              >
                Tout voir
                <FiArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotionProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NOUVEAUTES */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-green-600 font-semibold">
                Fraîchement ajoutés
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                Nouveautés
              </h2>
            </div>

            <Link
              to="/products"
              className="flex items-center gap-2 text-blue-600 font-semibold"
            >
              Tout voir
              <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        </section>
      )}

      {/* MEILLEURES VENTES */}
      {bestSellerProducts.length > 0 && (
        <section className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-orange-600 font-semibold">
                  Les préférés de nos clients
                </p>
                <h2 className="text-3xl font-bold text-gray-900">
                  Meilleures ventes
                </h2>
              </div>

              <Link
                to="/products?sort=popular"
                className="flex items-center gap-2 text-blue-600 font-semibold"
              >
                Tout voir
                <FiArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellerProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* POPULAIRES — fallback si pas de best-sellers */}
      {popularProducts.length === 0 && products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <p className="text-blue-600 font-semibold">
              Notre sélection
            </p>

            <h2 className="text-3xl font-bold text-gray-900">
              Produits populaires
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        </section>
      )}

      {/* TEMOIGNAGES */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-blue-600 font-semibold">
              Avis clients
            </p>

            <h2 className="text-3xl font-bold text-gray-900">
              Ils nous font confiance
            </h2>

            <p className="mt-3 text-gray-500">
              Une expérience simple et agréable pour nos clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              {
                name: "Client satisfait",
                text: "Commande simple, livraison rapide et produit conforme.",
              },
              {
                name: "Client fidèle",
                text: "Une boutique pratique avec beaucoup de choix.",
              },
              {
                name: "Client vérifié",
                text: "Très bonne expérience, je recommande la boutique.",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="bg-gray-50 rounded-2xl p-6 border"
              >
                <div className="flex gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar key={star} fill="currentColor" />
                  ))}
                </div>

                <p className="mt-4 text-gray-600 leading-relaxed">
                  “{review.text}”
                </p>

                <p className="mt-5 font-bold text-gray-900">
                  {review.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <FiMail size={25} />
          </div>

          <h2 className="mt-5 text-3xl font-bold">
            Ne manquez aucune offre
          </h2>

          <p className="mt-3 text-blue-100">
            Inscrivez-vous pour recevoir nos nouveautés et
            promotions.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-7 flex flex-col sm:flex-row max-w-xl mx-auto gap-3"
          >
            <input
              type="email"
              required
              placeholder="Votre adresse email"
              className="flex-1 px-5 py-4 rounded-xl text-gray-900 outline-none"
            />

            <button
              type="submit"
              className="px-7 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-gray-100 transition"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold">
              Prêt à faire vos achats ?
            </h2>

            <p className="mt-3 text-gray-300 max-w-xl">
              Parcourez notre catalogue et trouvez les produits
              qui vous conviennent.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition whitespace-nowrap"
          >
            Voir le catalogue
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
