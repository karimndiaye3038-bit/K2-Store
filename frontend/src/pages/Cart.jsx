
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const {
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const formatPrice = (price) =>
    Number(price).toLocaleString("fr-FR");

  // ==================== URL IMAGE ====================
  const getImageUrl = (image) => {
    if (!image) return "";

    // Si l'image est déjà une URL complète
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // URL du backend
    const baseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    // Retire /api pour accéder aux fichiers /uploads
    const serverUrl = baseUrl.replace(/\/api\/?$/, "");

    return `${serverUrl}${
      image.startsWith("/") ? image : `/${image}`
    }`;
  };

  // ==================== PANIER VIDE ====================
  if (cartItems.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <FiShoppingCart size={36} />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Votre panier est vide
          </h1>

          <p className="mt-3 text-gray-500">
            Découvrez nos produits et ajoutez vos articles préférés à
            votre panier.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Découvrir les produits
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ==================== EN-TÊTE ==================== */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-blue-600"
            >
              <FiArrowLeft />
              Continuer mes achats
            </Link>

            <h1 className="mt-5 text-3xl font-bold text-gray-900">
              Mon panier
            </h1>

            <p className="mt-2 text-gray-500">
              {cartCount} article{cartCount > 1 ? "s" : ""} dans votre
              panier
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            <FiTrash2 />
            Vider le panier
          </button>
        </div>

        {/* ==================== CONTENU ==================== */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ==================== ARTICLES ==================== */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <article
                key={item._id}
                className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6"
              >
                <div className="flex gap-4 sm:gap-6">

                  {/* ==================== IMAGE ==================== */}
                  <Link
                    to={`/products/${item._id}`}
                    className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-36 sm:w-36"
                  >
                    {item.images?.[0] ? (
                      <img
                        src={getImageUrl(item.images[0])}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        Image indisponible
                      </div>
                    )}
                  </Link>

                  {/* ==================== INFORMATIONS ==================== */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          {item.category?.name || "Produit"}
                        </p>

                        <Link
                          to={`/products/${item._id}`}
                          className="mt-1 block font-bold text-gray-900 transition hover:text-blue-600"
                        >
                          {item.name}
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        aria-label={`Supprimer ${item.name}`}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    {/* Prix */}
                    <p className="mt-4 font-bold text-blue-600">
                      {formatPrice(item.price)} FCFA
                    </p>

                    {/* ==================== QUANTITÉ ==================== */}
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <FiMinus size={16} />
                        </button>

                        <span className="min-w-10 px-2 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.quantity + 1
                            )
                          }
                          disabled={item.quantity >= item.stock}
                          className="p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <FiPlus size={16} />
                        </button>

                      </div>

                      <p className="font-bold text-gray-900">
                        {formatPrice(
                          item.price * item.quantity
                        )}{" "}
                        FCFA
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* ==================== RÉSUMÉ ==================== */}
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-gray-900">
              Résumé de la commande
            </h2>

            <div className="mt-6 space-y-4 border-b border-gray-200 pb-6">

              <div className="flex justify-between gap-4 text-gray-600">
                <span>Sous-total</span>

                <span className="font-semibold text-gray-900">
                  {formatPrice(cartTotal)} FCFA
                </span>
              </div>

              <div className="flex justify-between gap-4 text-gray-600">
                <span>Livraison</span>

                <span className="font-semibold text-gray-900">
                  À définir
                </span>
              </div>

            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="text-lg font-bold text-gray-900">
                Total
              </span>

              <span className="text-2xl font-extrabold text-blue-600">
                {formatPrice(cartTotal)} FCFA
              </span>
            </div>

            <Link
              to="/checkout"
              className="mt-7 flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              Passer la commande
            </Link>
          </aside>

        </div>
      </div>
    </section>
  );
};

export default Cart;
