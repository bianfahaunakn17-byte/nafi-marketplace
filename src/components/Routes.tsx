import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
export function LoadingScreen(){ return <div className="loading-screen"><div className="spinner"/><p>Memuat NAFI Marketplace...</p></div>; }
export function ProtectedRoute(){ const {isLoading,user}=useAuth(); const location=useLocation(); if(isLoading)return <LoadingScreen/>; if(!user)return <Navigate to="/login" state={{from:location.pathname}} replace/>; return <Outlet/>; }
export function AdminRoute(){ const {isLoading,user}=useAuth(); if(isLoading)return <LoadingScreen/>; if(!user)return <Navigate to="/login" replace/>; if(user.role!=='admin'&&user.role!=='staff')return <Navigate to="/unauthorized" replace/>; return <Outlet/>; }
