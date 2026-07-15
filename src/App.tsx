import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AdminRoute, ProtectedRoute } from './components/Routes';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import AccountPage, { ProfilePage } from './pages/AccountPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DownloadsPage from './pages/DownloadsPage';
import HomePage from './pages/HomePage';
import { OrderDetailPage, OrdersPage } from './pages/OrdersPages';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductsPage from './pages/ProductsPage';
import { AboutPage, HelpPage, NotFoundPage, PrivacyPage, RefundPolicyPage, TermsPage, UnauthorizedPage } from './pages/StaticPages';
import { AdminDashboardPage, AdminLayout, AdminOrderDetailPage, AdminOrdersPage, AdminProductsPage, AdminSettingsPage, AdminUsersPage } from './pages/admin/AdminPages';

export default function App(){return <BrowserRouter><AuthProvider><CartProvider><Routes>
<Route element={<Layout/>}><Route index element={<HomePage/>}/><Route path="products" element={<ProductsPage/>}/><Route path="products/:id" element={<ProductDetailPage/>}/><Route path="login" element={<LoginPage/>}/><Route path="register" element={<RegisterPage/>}/><Route path="about" element={<AboutPage/>}/><Route path="help" element={<HelpPage/>}/><Route path="terms" element={<TermsPage/>}/><Route path="privacy" element={<PrivacyPage/>}/><Route path="refund-policy" element={<RefundPolicyPage/>}/><Route path="unauthorized" element={<UnauthorizedPage/>}/><Route element={<ProtectedRoute/>}><Route path="account" element={<AccountPage/>}/><Route path="profile" element={<ProfilePage/>}/><Route path="cart" element={<CartPage/>}/><Route path="checkout" element={<CheckoutPage/>}/><Route path="orders" element={<OrdersPage/>}/><Route path="orders/:id" element={<OrderDetailPage/>}/><Route path="downloads" element={<DownloadsPage/>}/><Route path="my-purchases" element={<Navigate to="/downloads" replace/>}/></Route></Route>
<Route element={<AdminRoute/>}><Route path="admin" element={<AdminLayout/>}><Route index element={<AdminDashboardPage/>}/><Route path="products" element={<AdminProductsPage/>}/><Route path="orders" element={<AdminOrdersPage/>}/><Route path="orders/:id" element={<AdminOrderDetailPage/>}/><Route path="users" element={<AdminUsersPage/>}/><Route path="settings" element={<AdminSettingsPage/>}/></Route></Route><Route path="*" element={<NotFoundPage/>}/>
</Routes></CartProvider></AuthProvider></BrowserRouter>}
