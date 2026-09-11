import { useEffect, useState } from "react";
import {
  FiEdit2,
  FiImage,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import api from "../../services/api";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  oldPrice: "",
  stock: "",
  category: "",
  brand: "",
  sizes: "",
  colors: "",
  shoeSizes: "",
  weight: "",
  isFeatured: false,
  isPromotion: false,
  isNewProduct: true,
  isBestSeller: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedImages, setSelectedImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);

      setProducts(productsResponse.data.products || []);
      setCategories(categoriesResponse.data.categories || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Impossible de récupérer les données."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "name" && !editingId
        ? {
            slug: value
              .toLowerCase()
              .trim()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          }
        : {}),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 6) {
      setError("Vous pouvez sélectionner au maximum 6 images.");
      setSelectedImages(files.slice(0, 6));
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const invalidFile = files.find(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFile) {
      setError(
        `Le fichier "${invalidFile.name}" n'est pas accepté. Utilisez JPG, PNG ou WEBP.`
      ); 

      setSelectedImages([]);
      return;
    }

    const tooLarge = files.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (tooLarge) {
      setError(
        `L'image "${tooLarge.name}" dépasse la taille maximale de 5 Mo.`
      );
      setSelectedImages([]);
      return;
    }

    setError("");
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.slug.trim() ||
      !form.description.trim() ||
      !form.price ||
      form.stock === "" ||
      !form.category
    ) {
      setError(
        "Nom, slug, description, prix, stock et catégorie sont obligatoires."
      );
      return;
    }

    const productData = new FormData();

    productData.append("name", form.name.trim());
    productData.append("slug", form.slug.trim());
    productData.append("description", form.description.trim());
    productData.append("price", form.price);
    productData.append("oldPrice", form.oldPrice || "");
    productData.append("stock", form.stock);
    productData.append("category", form.category);
    productData.append("brand", form.brand.trim());
    productData.append("sizes", form.sizes);
    productData.append("colors", form.colors);
    productData.append("shoeSizes", form.shoeSizes);
    productData.append("weight", form.weight.trim());
    productData.append("isFeatured", form.isFeatured);
    productData.append("isPromotion", form.isPromotion);
    productData.append("isNewProduct", form.isNewProduct);
    productData.append("isBestSeller", form.isBestSeller);

console.log("📸 Images sélectionnées :", selectedImages);
console.log("📦 Nombre d'images :", selectedImages.length);
    selectedImages.forEach((file) => {
      productData.append("images", file);
    });

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/products/${editingId}`, productData);
      } else {
        await api.post("/products", productData);
      }

      setForm(emptyForm);
      setSelectedImages([]);
      setEditingId(null);

      await loadData();
    } catch (err) {
      console.error("Erreur produit :", err);

      setError(
        err.response?.data?.message ||
          "Impossible d'enregistrer le produit."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setSelectedImages([]);

    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: product.price ?? "",
      oldPrice: product.oldPrice ?? "",
      stock: product.stock ?? "",
      category: product.category?._id || product.category || "",
      brand: product.brand || "",
      sizes: product.sizes?.join(", ") || "",
      colors: product.colors?.join(", ") || "",
      shoeSizes: product.shoeSizes?.join(", ") || "",
      weight: product.weight || "",
      isFeatured: Boolean(product.isFeatured),
      isPromotion: Boolean(product.isPromotion),
      isNewProduct:
        product.isNewProduct === undefined
          ? true
          : Boolean(product.isNewProduct),
      isBestSeller: Boolean(product.isBestSeller),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer le produit."
      );
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedImages([]);
    setError("");
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("fr-FR").format(price) + " FCFA";

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    const apiUrl =
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000/api";

    const serverUrl = apiUrl.replace(/\/api\/?$/, "");

    return `${serverUrl}${image}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Gestion des produits
          </h1>

          <p className="mt-2 text-slate-500">
            Gérez les vêtements, chaussures, sacs, accessoires et produits
            de nutrition.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[430px_1fr]">

          <div className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Modifier le produit" : "Nouveau produit"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informations du produit
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nom *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex : Costume homme élégant"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Slug *
                </label>

                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="costume-homme-elegant"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description *
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Décrivez le produit..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Prix (FCFA) *
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    placeholder="30000"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Ancien prix
                  </label>

                  <input
                    type="number"
                    name="oldPrice"
                    value={form.oldPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="35000"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Stock *
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    placeholder="10"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Marque
                  </label>

                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="Ebuy"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Catégorie *
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Choisir une catégorie
                  </option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>

                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FiImage />
                  Images du produit
                </label>

                <input
                  type="file"
                  name="images"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
                />

                <p className="mt-2 text-xs text-slate-500">
                  JPG, PNG ou WEBP — maximum 6 images, 5 Mo par image.
                </p>

                {selectedImages.length > 0 && (
                  <div className="mt-4">

                    <p className="mb-2 text-sm font-medium text-slate-700">
                      Aperçu
                    </p>

                    <div className="grid grid-cols-3 gap-2">

                      {selectedImages.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="overflow-hidden rounded-lg border border-slate-200"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Aperçu ${index + 1}`}
                            className="h-24 w-full object-cover"
                          />
                        </div>
                      ))}

                    </div>

                  </div>
                )}

                {editingId && selectedImages.length === 0 && (
                  <div className="mt-4">

                    <p className="mb-2 text-sm font-medium text-slate-700">
                      Images actuelles
                    </p>

                    {(() => {
                      const currentProduct = products.find(
                        (item) => item._id === editingId
                      );

                      const images = currentProduct?.images || [];

                      if (images.length === 0) {
                        return (
                          <p className="text-xs text-slate-400">
                            Aucune image actuellement.
                          </p>
                        );
                      }

                      return (
                        <div className="grid grid-cols-3 gap-2">
                          {images.map((image, index) => (
                            <div
                              key={`${image}-${index}`}
                              className="overflow-hidden rounded-lg border border-slate-200"
                            >
                              <img
                                src={getImageUrl(image)}
                                alt={`${currentProduct.name} ${index + 1}`}
                                className="h-24 w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                  </div>
                )}

              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <p className="mb-3 text-sm font-semibold text-slate-800">
                  Variantes du produit
                </p>

                <div className="space-y-3">

                  <input
                    name="sizes"
                    value={form.sizes}
                    onChange={handleChange}
                    placeholder="Tailles : S, M, L, XL, XXL"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                  <input
                    name="colors"
                    value={form.colors}
                    onChange={handleChange}
                    placeholder="Couleurs : Bleu, Noir, Rouge"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                  <input
                    name="shoeSizes"
                    value={form.shoeSizes}
                    onChange={handleChange}
                    placeholder="Pointures : 39, 40, 41, 42, 43"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                  <input
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="Format / poids : 2 kg, 5 kg..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Séparez les valeurs par des virgules.
                </p>

              </div>

              <div className="grid grid-cols-2 gap-3">

                {[
                  ["isFeatured", "Produit vedette"],
                  ["isPromotion", "En promotion"],
                  ["isNewProduct", "Nouveau"],
                  ["isBestSeller", "Meilleure vente"],
                ].map(([name, label]) => (
                  <label
                    key={name}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name={name}
                      checked={form[name]}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />

                    {label}
                  </label>
                ))}

              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {editingId ? <FiEdit2 /> : <FiPlus />}

                {saving
                  ? "Enregistrement..."
                  : editingId
                    ? "Modifier le produit"
                    : "Ajouter le produit"}

              </button>

            </form>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

            <div className="flex items-center justify-between border-b border-slate-200 p-6">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Produits
                </h2>

                <p className="text-sm text-slate-500">
                  {products.length} produit
                  {products.length > 1 ? "s" : ""}
                </p>
              </div>

            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Chargement...
              </div>
            ) : products.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Aucun produit pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">

                {products.map((product) => (

                  <div
                    key={product._id}
                    className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                  >

                    <div className="flex min-w-0 items-center gap-4">

                      {product.images?.[0] ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                          Pas d'image
                        </div>
                      )}

                      <div className="min-w-0">

                        <h3 className="font-semibold text-slate-900">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-blue-600">
                          {formatPrice(product.price)}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Stock : {product.stock}
                        </p>

                        {product.images?.length > 0 && (
                          <p className="mt-1 text-xs text-slate-400">
                            {product.images.length} image
                            {product.images.length > 1 ? "s" : ""}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-2">

                          {product.isPromotion && (
                            <span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-600">
                              Promotion
                            </span>
                          )}

                          {product.isNewProduct && (
                            <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">
                              Nouveau
                            </span>
                          )}

                          {product.isBestSeller && (
                            <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                              Best-seller
                            </span>
                          )}

                          {product.isFeatured && (
                            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                              Vedette
                            </span>
                          )}

                        </div>

                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">

                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <FiEdit2 />
                        Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
                        className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 />
                        Supprimer
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
