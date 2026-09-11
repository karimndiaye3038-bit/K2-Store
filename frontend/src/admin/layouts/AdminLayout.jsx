import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiBox,
  FiFolder,
  FiHome,
  FiLogOut,
  FiShoppingBag,
  FiUsers,
   FiStar,
  FiMenu,
FiBell,

  FiX,
} from "react-icons/fi";
import { useState } from "react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const links = [
    {
      to: "/admin",
      label: "Tableau de bord",
      icon: FiHome,
      end: true,
    },
    {
      to: "/admin/products",
      label: "Produits",
      icon: FiBox,
    },
    {
      to: "/admin/categories",
      label: "Catégories",
      icon: FiFolder,
    },
    {
      to: "/admin/orders",
      label: "Commandes",
      icon: FiShoppingBag,
    },
    {
      to: "/admin/users",
      label: "Utilisateurs",
      icon: FiUsers,
    },
 {
  to: "/admin/reviews",
  label: "Avis clients",
  icon: FiStar,
},
{
  to: "/admin/notifications",
  label: "Notifications",
  icon: FiBell,
},
  ];

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <Link
          to="/admin"
          onClick={closeMenu}
          className="text-xl font-extrabold text-blue-600"
        >
          Admin
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-gray-200 p-6">
              <Link
                to="/admin"
                className="text-2xl font-extrabold text-blue-600"
              >
                Admin
              </Link>

              <p className="mt-1 text-sm text-gray-500">
                E-commerce
              </p>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {links.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`
                    }
                  >
                    <Icon size={20} />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-gray-200 p-4">
              <Link
                to="/"
                className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                <FiHome size={20} />
                Voir la boutique
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <FiLogOut size={20} />
                Déconnexion
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={closeMenu}
            />

            <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-5">
                <div>
                  <p className="text-xl font-extrabold text-blue-600">
                    Admin
                  </p>

                  <p className="text-sm text-gray-500">
                    E-commerce
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeMenu}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  <FiX size={22} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 p-4">
                {links.map((link) => {
                  const Icon = link.icon;

                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`
                      }
                    >
                      <Icon size={20} />
                      {link.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="border-t border-gray-200 p-4">
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  <FiHome size={20} />
                  Voir la boutique
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <FiLogOut size={20} />
                  Déconnexion
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
