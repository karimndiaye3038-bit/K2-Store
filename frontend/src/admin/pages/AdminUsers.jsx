import { useEffect, useMemo, useState } from "react";
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiUser,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";
import api from "../../services/api";

const formatDate = (date) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [updating, setUpdating] = useState("");

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/users");

      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (err) {
      console.error("Erreur utilisateurs :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les utilisateurs."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        filterRole === "all" || user.role === filterRole;

      const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        (user.email || "").toLowerCase().includes(term) ||
        (user.phone || "").toLowerCase().includes(term);

      return matchesRole && matchesSearch;
    });
  }, [users, search, filterRole]);

  const updateRole = async (userId, role) => {
    try {
      setUpdating(`${userId}-role`);

      const response = await api.put(`/users/${userId}/role`, {
        role,
      });

      if (response.data.success) {
        setUsers((current) =>
          current.map((user) =>
            user._id === userId
              ? { ...user, role: response.data.user.role }
              : user
          )
        );
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de modifier le rôle."
      );
    } finally {
      setUpdating("");
    }
  };

  const updateStatus = async (userId, isActive) => {
    try {
      setUpdating(`${userId}-status`);

      const response = await api.put(`/users/${userId}/status`, {
        isActive,
      });

      if (response.data.success) {
        setUsers((current) =>
          current.map((user) =>
            user._id === userId
              ? { ...user, isActive: response.data.user.isActive }
              : user
          )
        );
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Impossible de modifier le statut."
      );
    } finally {
      setUpdating("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FiLoader
            className="mx-auto animate-spin text-blue-600"
            size={36}
          />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Chargement des utilisateurs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            Utilisateurs
          </h1>

          <p className="mt-2 text-gray-500">
            Gérez les comptes clients et administrateurs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          <FiRefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          Actualiser
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiUsers size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-extrabold text-gray-900">
                {users.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FiUser size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Clients</p>
              <p className="text-2xl font-extrabold text-gray-900">
                {users.filter((user) => user.role === "client").length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FiShield size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Administrateurs</p>
              <p className="text-2xl font-extrabold text-gray-900">
                {users.filter((user) => user.role === "admin").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={19}
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email ou téléphone..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">Tous les rôles</option>
            <option value="client">Clients</option>
            <option value="admin">Administrateurs</option>
          </select>
        </div>
      </div>

      {/* Users */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Liste des utilisateurs
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredUsers.length} utilisateur
              {filteredUsers.length > 1 ? "s" : ""} affiché
              {filteredUsers.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <FiUsers
              className="mx-auto text-gray-300"
              size={44}
            />

            <h3 className="mt-4 font-bold text-gray-700">
              Aucun utilisateur trouvé
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              Modifiez votre recherche ou votre filtre.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredUsers.map((user) => (
                <div key={user._id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                        {(user.firstName?.[0] || "").toUpperCase()}
                        {(user.lastName?.[0] || "").toUpperCase()}
                      </div>

                      <div>
                        <p className="font-bold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>

                        <p className="text-xs text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {user.role === "admin"
                        ? "Administrateur"
                        : "Client"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>{user.phone}</p>
                    <p className="mt-1">
                      Inscrit le {formatDate(user.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={user.role}
                      disabled={updating === `${user._id}-role`}
                      onChange={(e) =>
                        updateRole(user._id, e.target.value)
                      }
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      type="button"
                      disabled={updating === `${user._id}-status`}
                      onClick={() =>
                        updateStatus(user._id, !user.isActive)
                      }
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                        user.isActive
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <FiXCircle size={16} />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={16} />
                          Activer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                      Utilisateur
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                      Téléphone
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                      Rôle
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                      Statut
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                      Inscription
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                            {(user.firstName?.[0] || "").toUpperCase()}
                            {(user.lastName?.[0] || "").toUpperCase()}
                          </div>

                          <div>
                            <p className="font-bold text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>

                            <p className="text-xs text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.phone}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          disabled={
                            updating === `${user._id}-role`
                          }
                          onChange={(e) =>
                            updateRole(user._id, e.target.value)
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500"
                        >
                          <option value="client">Client</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <FiCheckCircle size={14} />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            <FiXCircle size={14} />
                            Inactif
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={
                            updating === `${user._id}-status`
                          }
                          onClick={() =>
                            updateStatus(
                              user._id,
                              !user.isActive
                            )
                          }
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            user.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <FiXCircle size={16} />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <FiCheckCircle size={16} />
                              Activer
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
