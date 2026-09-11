
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { CartProvider } from "./context/CartContext";

// ==================== PAGES BOUTIQUE ====================
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Categories from "./pages/Categories";

// ==================== AUTHENTIFICATION ====================
import Login from "./pages/Login";
import Register from "./pages/Register";

// ==================== COMPTE CLIENT ====================
import Account from "./pages/Account";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Favorites from "./pages/Favorites";
import Addresses from "./pages/Addresses";
import Notifications from "./pages/Notifications";
import Security from "./pages/Security";

// ==================== ADMINISTRATION ====================
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminReviews from "./admin/pages/AdminReviews";
import AdminNotifications from "./admin/pages/AdminNotifications";

const App = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>

          {/* ==================================================
              BOUTIQUE + COMPTE CLIENT
          ================================================== */}
          <Route element={<MainLayout />}>

            {/* Boutique */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Authentification */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Compte */}
            <Route path="/account" element={<Account />} />
            <Route path="/account/profile" element={<Profile />} />
            <Route path="/account/orders" element={<Orders />} />
            <Route
              path="/account/orders/:id"
              element={<OrderDetail />}
            />
            <Route path="/account/favorites" element={<Favorites />} />
            <Route path="/account/addresses" element={<Addresses />} />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/account/notifications"
              element={<Notifications />}
            />

            {/* Sécurité */}
            <Route
              path="/account/security"
              element={<Security />}
            />

          </Route>

          {/* ==================================================
              ADMINISTRATION
          ================================================== */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>

              <Route
                path="/admin"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/products"
                element={<AdminProducts />}
              />

              <Route
                path="/admin/categories"
                element={<AdminCategories />}
              />

              <Route
                path="/admin/orders"
                element={<AdminOrders />}
              />

              <Route
                path="/admin/users"
                element={<AdminUsers />}
              />

              <Route
                path="/admin/reviews"
                element={<AdminReviews />}
              />

              <Route
                path="/admin/notifications"
                element={<AdminNotifications />}
              />

            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
