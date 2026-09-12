
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
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

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [category, setCategory] = useState(categoryFromUrl);

  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") || ""
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") || ""
  );

  const [sort, setSort] = useState(
    searchParams.get("sort") || "newest"
  );

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  /*
   * Synchroniser la catégorie avec l'URL
   */
  useEffect(() => {
    setCategory(categoryFromUrl);
    setPage(1);
  }, [categoryFromUrl]);

  /*
   * Charger catégories + produits
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            api.get("/products", {
              params: {
                search: search || undefined,
                category: category || undefined,
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
                sort: sort === "newest" ? undefined : sort,
                page,
                limit: 12,
              },
            }),
            api.get("/categories"),
          ]);

        setProducts(productsResponse.data.products || []);
        setTotalPages(productsResponse.data.pages || 1);

        setCategories(categoriesResponse.data.categories || []);
      } catch (err) {
        console.error("Erreur chargement catalogue :", err);

        setError(
          err.response?.data?.message ||
            "Impossible de charger les produits."
        );

        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, category, minPrice, maxPrice, sort, page]);

  /*
   * Appliquer les filtres
   */
  const handleFilter = (e) => {
    e.preventDefault();

    setPage(1);

    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (category) {
      params.category = category;
    }

    if (minPrice) {
      params.minPrice = minPrice;
    }

    if (maxPrice) {
      params.maxPrice = maxPrice;
    }

    if (sort && sort !== "newest") {
      params.sort = sort;
    }

    setSearchParams(params);
  };

  /*
   * Réinitialiser les filtres
   */
  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    setSearchParams({});
  };

  /*
   * Ajouter au panier
   */
  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Nos produits
              </h1>

              <p className="mt-2 text-gray-600">
                Découvrez tous nos produits disponibles.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {products.length} produit
              {products.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <form
          onSubmit={handleFilter}
          className="bg-white rounded-2xl shadow-sm border p-5 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>

              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nom, marque, produit..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>

                {categories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix minimum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix minimum
              </label>

              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0 FCFA"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Prix maximum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix maximum
              </label>

              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="500000"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tri + boutons */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
              <option value="popular">Plus populaires</option>
            </select>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
            >
              Appliquer les filtres
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition"
            >
              Réinitialiser
            </button>
          </div>
        </form>

        {/* Erreur */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Chargement */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden border animate-pulse"
              >
                <div className="h-64 bg-gray-200" />

                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Aucun produit */
          <div className="bg-white rounded-2xl border p-12 text-center">
            <FiSearch className="mx-auto text-gray-400" size={48} />

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Aucun produit trouvé
            </h2>

            <p className="mt-2 text-gray-500">
              Essayez de modifier vos critères de recherche.
            </p>

            <button
              onClick={resetFilters}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            {/* Produits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <article
                  key={product._id}
                  className="group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition"
                >
                  {/* Image */}
                  <div className="relative bg-gray-100">
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder-product.jpg";
                        }}
                      />
                    </Link>

                    {/* Badge promotion */}
                    {product.oldPrice &&
                      product.oldPrice > product.price && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          PROMO
                        </span>
                      )}

                    {/* Favori */}
                    <button
                      type="button"
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:text-red-500 transition"
                      title="Ajouter aux favoris"
                    >
                      <FiHeart size={19} />
                    </button>
                  </div>

                  {/* Infos */}
                  <div className="p-4">
                    {product.category?.name && (
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                        {product.category.name}
                      </p>
                    )}

                    <Link to={`/products/${product._id}`}>
                      <h2 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition">
                        {product.name}
                      </h2>
                    </Link>

                    {product.brand && (
                      <p className="mt-1 text-sm text-gray-500">
                        {product.brand}
                      </p>
                    )}

                    {/* Prix */}
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

                    {/* Stock */}
                    <p
                      className={`mt-2 text-sm ${
                        product.stock > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} disponible${
                            product.stock > 1 ? "s" : ""
                          }`
                        : "Rupture de stock"}
                    </p>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <Link
                        to={`/products/${product._id}`}
                        className="flex-1 text-center px-4 py-3 border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition"
                      >
                        Voir
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition"
                      >
                        <FiShoppingCart size={18} />
                        Ajouter
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((current) => current - 1);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="w-11 h-11 flex items-center justify-center border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
                >
                  <FiChevronLeft />
                </button>

                <span className="px-5 py-3 bg-white border rounded-xl font-semibold">
                  Page {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((current) => current + 1);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="w-11 h-11 flex items-center justify-center border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Products;

