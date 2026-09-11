import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMail, FiPhone, FiUser } from "react-icons/fi";
import api from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/auth/me");

        setUser(response.data.user);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Impossible de récupérer votre profil."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
            <div className="mx-auto h-20 w-20 rounded-full bg-gray-200" />
            <div className="mx-auto mt-5 h-7 w-48 rounded bg-gray-200" />
            <div className="mx-auto mt-3 h-4 w-64 rounded bg-gray-200" />

            <div className="mt-10 space-y-4">
              <div className="h-16 rounded-xl bg-gray-200" />
              <div className="h-16 rounded-xl bg-gray-200" />
              <div className="h-16 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Impossible de charger le profil
          </h1>

          <p className="mt-3 text-red-500">
            {error || "Utilisateur introuvable."}
          </p>

          <Link
            to="/account"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <FiArrowLeft />
            Retour à mon compte
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

        <Link
          to="/account"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-blue-600"
        >
          <FiArrowLeft />
          Retour à mon compte
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">

          {/* En-tête */}
          <div className="bg-blue-600 px-6 py-10 text-center text-white sm:px-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-blue-600 shadow-md">
              <FiUser size={38} />
            </div>

            <h1 className="mt-5 text-3xl font-extrabold">
              {user.firstName} {user.lastName}
            </h1>

            <p className="mt-2 text-blue-100">
              Mon profil
            </p>
          </div>

          {/* Informations */}
          <div className="p-6 sm:p-8">

            <h2 className="text-xl font-bold text-gray-900">
              Informations personnelles
            </h2>

            <div className="mt-6 space-y-4">

              {/* Nom */}
              <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiUser size={20} />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Nom complet
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiMail size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Adresse email
                  </p>

                  <p className="mt-1 truncate font-semibold text-gray-900">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Téléphone */}
              <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiPhone size={20} />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Téléphone
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {user.phone || "Non renseigné"}
                  </p>
                </div>
              </div>

              {/* Rôle */}
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">
                  Type de compte
                </p>

                <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold capitalize text-blue-600">
                  {user.role === "admin" ? "Administrateur" : "Client"}
                </span>
              </div>

            </div>

            <div className="mt-8 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
              Vos informations sont récupérées directement depuis votre
              compte e-commerce.
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;