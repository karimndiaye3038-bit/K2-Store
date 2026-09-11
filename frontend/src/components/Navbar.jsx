
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiMenu,
  FiLogOut,
  FiBell,
  FiHome,
  FiGrid,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await api.get("/notifications");
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error(
        "Erreur récupération notifications :",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();

    const interval = setInterval(
      fetchUnreadNotifications,
      30000
    );

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setUnreadCount(0);

    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* =====================================================
          NAVBAR DESKTOP / TABLETTE
      ====================================================== */}
      <header className="sticky top-0 z-50 hidden border-b border-gray-200 bg-white md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-blue-600"
          >
            K2-Store
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition ${
                isActive("/")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Accueil
            </Link>

            <Link
              to="/products"
              className={`text-sm font-medium transition ${
                isActive("/products")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Produits
            </Link>

            <Link
              to="/categories"
              className={`text-sm font-medium transition ${
                isActive("/categories")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Catégories
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Recherche */}
            <Link
              to="/products"
              aria-label="Rechercher"
              className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
            >
              <FiSearch size={20} />
            </Link>

            {/* Notifications */}
            {user && (
              <Link
                to="/notifications"
                aria-label={`Notifications${
                  unreadCount > 0
                    ? `, ${unreadCount} non lues`
                    : ""
                }`}
                className={`relative rounded-full p-2 transition ${
                  isActive("/notifications")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                }`}
              >
                <FiBell size={20} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Compte */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/account"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive("/account")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  <FiUser size={18} />

                  <span>
                    Bonjour, {user.firstName}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Déconnexion"
                  className="rounded-full p-2 text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                >
                  <FiLogOut size={19} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Mon compte"
                className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
              >
                <FiUser size={20} />
              </Link>
            )}

            {/* Panier */}
            <Link
              to="/cart"
              aria-label={`Panier, ${cartCount} article${
                cartCount > 1 ? "s" : ""
              }`}
              className={`relative rounded-full p-2 transition ${
                isActive("/cart")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              }`}
            >
              <FiShoppingCart size={20} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Menu mobile */}
            <button
              type="button"
              aria-label="Ouvrir le menu"
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <FiMenu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          BARRE MOBILE FIXE EN BAS
      ====================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {/* Accueil */}
          <Link
            to="/"
            className={`relative flex min-w-[55px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 transition ${
              isActive("/")
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          >
            <FiHome size={21} />

            <span className="text-[11px] font-medium">
              Accueil
            </span>

            {isActive("/") && (
              <span className="absolute -top-1 h-1 w-1 rounded-full bg-blue-600" />
            )}
          </Link>

          {/* Produits */}
          <Link
            to="/products"
            className={`relative flex min-w-[55px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 transition ${
              isActive("/products")
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          >
            <FiGrid size={21} />

            <span className="text-[11px] font-medium">
              Produits
            </span>

            {isActive("/products") && (
              <span className="absolute -top-1 h-1 w-1 rounded-full bg-blue-600" />
            )}
          </Link>

          {/* Panier */}
          <Link
            to="/cart"
            aria-label={`Panier, ${cartCount} article${
              cartCount > 1 ? "s" : ""
            }`}
            className={`relative flex min-w-[55px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 transition ${
              isActive("/cart")
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          >
            <div className="relative">
              <FiShoppingCart size={22} />

              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </div>

            <span className="text-[11px] font-medium">
              Panier
            </span>
          </Link>

          {/* Notifications */}
          {user && (
            <Link
              to="/notifications"
              aria-label={`Notifications${
                unreadCount > 0
                  ? `, ${unreadCount} non lues`
                  : ""
              }`}
              className={`relative flex min-w-[55px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 transition ${
                isActive("/notifications")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              <div className="relative">
                <FiBell size={21} />

                {unreadCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-medium">
                Alertes
              </span>
            </Link>
          )}

          {/* Compte */}
          <Link
            to={user ? "/account" : "/login"}
            className={`relative flex min-w-[55px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 transition ${
              isActive("/account") ||
              location.pathname === "/login"
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          >
            <FiUser size={21} />

            <span className="text-[11px] font-medium">
              Compte
            </span>

            {(isActive("/account") ||
              location.pathname === "/login") && (
              <span className="absolute -top-1 h-1 w-1 rounded-full bg-blue-600" />
            )}
          </Link>
        </div>
      </nav>

      {/* Espace supplémentaire pour éviter que la barre
          mobile masque le contenu de la page */}
      <div className="h-16 md:hidden" />
    </>
  );
};

export default Navbar;

