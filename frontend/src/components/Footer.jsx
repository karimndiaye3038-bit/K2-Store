const Footer = () => {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-xl font-bold text-blue-400">K2-Store</h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Votre boutique en ligne moderne et fiable.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Boutique</h3>
            <p className="mt-3 text-sm text-gray-400">Produits</p>
            <p className="mt-2 text-sm text-gray-400">Catégories</p>
          </div>

          <div>
            <h3 className="font-semibold">Service client</h3>
            <p className="mt-3 text-sm text-gray-400">Contact</p>
            <p className="mt-2 text-sm text-gray-400">Livraison</p>
          </div>

          <div>
            <h3 className="font-semibold">Paiement</h3>
            <p className="mt-3 text-sm text-gray-400">
              Paiement sécurisé et adapté au Sénégal.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} K2-Store. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;