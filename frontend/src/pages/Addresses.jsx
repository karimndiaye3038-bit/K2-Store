import { useEffect, useState } from "react";
import {
  FiEdit2,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import api from "../services/api";
import BackButton from "../components/BackButton";

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  isDefault: false,
};

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/addresses");

      setAddresses(response.data.addresses || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de récupérer vos adresses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (address) => {
    setForm({
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      region: address.region || "",
      isDefault: Boolean(address.isDefault),
    });

    setEditingId(address._id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await api.put(`/addresses/${editingId}`, form);
        setSuccess("Adresse modifiée avec succès.");
      } else {
        await api.post("/addresses", form);
        setSuccess("Adresse ajoutée avec succès.");
      }

      closeForm();
      await fetchAddresses();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible d'enregistrer cette adresse."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette adresse ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/addresses/${addressId}`);

      setAddresses((currentAddresses) =>
        currentAddresses.filter(
          (address) => address._id !== addressId
        )
      );

      setSuccess("Adresse supprimée avec succès.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de supprimer cette adresse."
      );
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setError("");
      setSuccess("");

      await api.patch(`/addresses/${addressId}/default`);

      setAddresses((currentAddresses) =>
        currentAddresses.map((address) => ({
          ...address,
          isDefault: address._id === addressId,
        }))
      );

      setSuccess("Adresse par défaut mise à jour.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de définir cette adresse par défaut."
      );
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-56 rounded bg-gray-200" />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-52 rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50">
      <BackButton />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Mon compte
            </p>

            <div className="mt-2 flex items-center gap-3">
              <FiMapPin className="text-blue-600" size={28} />

              <h1 className="text-3xl font-extrabold text-gray-900">
                Mes adresses
              </h1>
            </div>

            <p className="mt-2 text-gray-500">
              Gérez vos adresses de livraison.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <FiPlus size={19} />
            Ajouter une adresse
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {showForm && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId
                  ? "Modifier l'adresse"
                  : "Nouvelle adresse"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Fermer"
              >
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Prénom
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nom
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Téléphone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+221 77 000 00 00"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Ville
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Dakar"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Adresse
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Quartier, rue, numéro..."
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Région
                  </label>

                  <input
                    type="text"
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    placeholder="Dakar"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="h-4 w-4 accent-blue-600"
                />

                <span className="text-sm font-medium text-gray-700">
                  Utiliser comme adresse par défaut
                </span>
              </label>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {saving
                    ? "Enregistrement..."
                    : editingId
                      ? "Enregistrer les modifications"
                      : "Ajouter l'adresse"}
                </button>
              </div>
            </form>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiMapPin size={36} />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Aucune adresse
            </h2>

            <p className="mt-2 text-gray-500">
              Ajoutez une adresse pour faciliter vos prochaines commandes.
            </p>

            {!showForm && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <FiPlus size={18} />
                Ajouter une adresse
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {addresses.map((address) => (
              <article
                key={address._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FiMapPin size={20} />
                    </div>

                    <div>
                      <h2 className="font-bold text-gray-900">
                        {address.firstName} {address.lastName}
                      </h2>

                      {address.isDefault && (
                        <span className="mt-1 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Adresse par défaut
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEditForm(address)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                      aria-label="Modifier l'adresse"
                    >
                      <FiEdit2 size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(address._id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Supprimer l'adresse"
                    >
                      <FiTrash2 size={17} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-1.5 text-sm text-gray-600">
                  <p>{address.address}</p>
                  <p>
                    {address.city}
                    {address.region ? `, ${address.region}` : ""}
                  </p>
                  <p>{address.phone}</p>
                </div>

                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address._id)}
                    className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Définir comme adresse par défaut
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Addresses;