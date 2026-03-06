import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CakesPage from './pages/CakesPage';
import CakeDetailsPage from './pages/CakeDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer Routes */}
          <Route
            path="/"
            element={
              <CustomerLayout>
                <HomePage />
              </CustomerLayout>
            }
          />
          <Route
            path="/cakes"
            element={
              <CustomerLayout>
                <CakesPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/cakes/:id"
            element={
              <CustomerLayout>
                <CakeDetailsPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <CustomerLayout>
                <CartPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerLayout>
                <CheckoutPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/order-confirmation/:orderId"
            element={
              <CustomerLayout>
                <OrderConfirmationPage />
              </CustomerLayout>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
