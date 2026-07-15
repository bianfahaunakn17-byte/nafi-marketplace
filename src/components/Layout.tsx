import { Menu, ShoppingCart, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const doLogout = async () => { await logout(); setOpen(false); navigate('/'); };
  return <div className="app-shell">
    <header className="navbar"><div className="container nav-inner">
      <Link className="brand" to="/"><span className="brand-mark">N</span><span><b>NAFI Marketplace</b><small>AI THAT WORKS FOR YOU</small></span></Link>
      <button className="icon-btn mobile" aria-label="Buka menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
      <nav className={open ? 'nav-links open' : 'nav-links'}>
        <NavLink to="/">Home</NavLink><NavLink to="/products">Produk</NavLink><NavLink to="/about">Tentang</NavLink><NavLink to="/help">Bantuan</NavLink>
        {user ? <><NavLink to="/cart"><ShoppingCart size={17}/> Keranjang <span className="count">{cart.item_count}</span></NavLink><NavLink to="/account"><UserRound size={17}/> {user.name.split(' ')[0]}</NavLink>{(user.role==='admin'||user.role==='staff')&&<NavLink to="/admin">Admin</NavLink>}<button className="link-button" onClick={doLogout}>Keluar</button></> : <><NavLink to="/login">Masuk</NavLink><Link className="btn small primary" to="/register">Daftar</Link></>}
      </nav>
    </div></header>
    <main><Outlet/></main>
    <footer className="footer"><div className="container footer-grid"><div><div className="brand"><span className="brand-mark">N</span><span><b>NAFI Marketplace</b><small>AI THAT WORKS FOR YOU</small></span></div><p>Marketplace produk digital premium untuk mempercepat produktivitas dan pertumbuhan bisnis.</p></div><div><h4>Navigasi</h4><Link to="/products">Produk</Link><Link to="/about">Tentang</Link><Link to="/help">Bantuan</Link></div><div><h4>Kebijakan</h4><Link to="/terms">Syarat</Link><Link to="/privacy">Privasi</Link><Link to="/refund-policy">Refund</Link></div></div><div className="copyright">© 2026 NAFI Marketplace.</div></footer>
  </div>;
}
