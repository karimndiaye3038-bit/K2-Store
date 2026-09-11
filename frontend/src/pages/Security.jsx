import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLock, FiCheckCircle } from "react-icons/fi";
import api from "../services/api";

const Security = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError(
        "Le nouveau mot de passe doit contenir au moins 6 caractères."
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.put("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMessage(
        response.data.message ||
          "Votre mot de passe a été modifié avec succès."
      );

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de modifier votre mot de passe."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">

        <Link
          to="/account"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-blue-600"
        >
          <FiArrowLeft />
          Retour à mon compte
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="bg-blue-600 px-6 py-10 text-center text-white sm:px-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-blue-600 shadow-md">
              <FiLock size={36} />
            </div>

            <h1 className="mt-5 text-3xl font-extrabold">
              Sécurité
            </h1>

            <p className="mt-2 text-blue-100">
              Gérez la sécurité de votre compte
            </p>
          </div>

          <div className="p-6 sm:p-8">

            {message && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <FiCheckCircle size={20} />
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <h2 className="text-xl font-bold text-gray-900">
              Modifier le mot de passe
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Utilisez un mot de passe suffisamment long et difficile à deviner.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">

              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Mot de passe actuel
                </label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Votre mot de passe actuel"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Nouveau mot de passe
                </label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Confirmer le nouveau mot de passe
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Confirmez le nouveau mot de passe"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <FiLock size={18} />
                {loading
                  ? "Modification en cours..."
                  : "Modifier le mot de passe"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;