import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiBell,
  FiLock,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";

const Account = () => {
  const navigate = useNavigate();

  const user = (() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <FiUser size={38} />
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
          Connexion nécessaire
        </h1>

        <p className="mt-3 text-gray-500">
          Connectez-vous pour accéder à votre espace personnel.
        </p>

        <Link
          to="/login"
          className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Se connecter
        </Link>
      </section>
    );
  }

  const menuItems = [
    {
      icon: FiUser,
      title: "Mon profil",
      description: "Gérer mes informations personnelles",
      path: "/account/profile",
    },
    {
      icon: FiPackage,
      title: "Mes commandes",
      description: "Consulter et suivre mes commandes",
      path: "/account/orders",
    },
    {
      icon: FiHeart,
      title: "Mes favoris",
      description: "Retrouver mes produits favoris",
      path: "/account/favorites",
    },
    {
      icon: FiMapPin,
      title: "Mes adresses",
      description: "Gérer mes adresses de livraison",
      path: "/account/addresses",
    },
    {
      icon: FiBell,
      title: "Notifications",
      description: "Consulter mes notifications",
      path: "/account/notifications",
    },
    {
      icon: FiLock,
      title: "Sécurité",
      description: "Modifier mon mot de passe",
      path: "/account/security",
    },
  ];

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* En-tête */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg sm:p-8">
          <p className="text-sm font-medium text-blue-100">
            Mon espace personnel
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Bonjour, {user.firstName} 👋
          </h1>

          <p className="mt-2 text-blue-100">
            Gérez votre compte, vos commandes et vos informations.
          </p>
        </div>

        {/* Informations utilisateur */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiUser size={28} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>

              <p className="mt-1 truncate text-sm text-gray-500">
                {user.email}
              </p>

              {user.phone && (
                <p className="mt-1 text-sm text-gray-500">
                  {user.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Menu du compte */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 p-5 transition hover:bg-gray-50 ${
                  index !== menuItems.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>

                <FiChevronRight
                  className="shrink-0 text-gray-400"
                  size={20}
                />
              </Link>
            );
          })}
        </div>

        {/* Déconnexion */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-4 font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
        >
          <FiLogOut size={20} />
          Se déconnecter
        </button>
      </div>
    </section>
  );
};

export default Account;