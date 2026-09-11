import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
  FiShield,
} from "react-icons/fi";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "client",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/register", formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de créer le compte."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Créer un compte
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Rejoignez notre boutique en ligne
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Prénom / Nom */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Prénom
                </label>

                <div className="relative mt-2">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Prénom"
                    required
                    className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Nom
                </label>

                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Nom"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Adresse email
              </label>

              <div className="relative mt-2">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemple@email.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Téléphone
              </label>

              <div className="relative mt-2">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+221 77 000 00 00"
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Mot de passe
              </label>

              <div className="relative mt-2">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Rôle */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Type de compte
              </label>

              <div className="relative mt-2">
                <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="client">
                    Client
                  </option>

                  <option value="admin">
                    Administrateur
                  </option>
                </select>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Choisissez le type de compte à créer.
              </p>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading
                ? "Création du compte..."
                : "Créer mon compte"}

              {!loading && <FiArrowRight />}
            </button>
          </form>

          <div className="mt-7 border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Vous avez déjà un compte ?
            </p>

            <Link
              to="/login"
              className="mt-2 inline-block font-semibold text-blue-600 hover:text-blue-700"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;