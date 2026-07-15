import { ShoppingCart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { formatRupiah } from '../utils';
export default function ProductCard({product}:{product:Product}){
 const {user}=useAuth(); const cart=useCart(); const nav=useNavigate();
 const add=async()=>{ if(!user){nav('/login',{state:{from:`/products/${product.id}`}});return;} await cart.add(product.id); };
 return <article className="product-card"><Link to={`/products/${product.id}`} className="product-image"><img src={product.imageUrl||'https://placehold.co/800x600/17181f/e8c547?text=NAFI'} alt={product.name}/>{product.featured&&<span className="featured">Unggulan</span>}</Link><div className="product-body"><div className="meta"><span>{product.category?.name||'Digital'}</span><span><Star size={14} fill="currentColor"/> {product.ratingAverage.toFixed(1)}</span></div><Link to={`/products/${product.id}`}><h3>{product.name}</h3></Link><p>{product.shortDescription||product.description.slice(0,100)}</p><div className="product-footer"><div><strong>{formatRupiah(product.price)}</strong><small>{product.seller?.name||'NAFI Store'}</small></div><button className="icon-btn gold" onClick={add} aria-label="Tambah ke keranjang"><ShoppingCart size={20}/></button></div></div></article>;
}
