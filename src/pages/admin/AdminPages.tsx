import{CheckCircle,Package,Users,Wallet,XCircle}from'lucide-react';import{useEffect,useState}from'react';import {
  Link,
  NavLink,
  Outlet,
  useParams,
} from 'react-router-dom';import{errorMessage}from'../../api';import{marketplaceService}from'../../service';import type{AdminOverview,Order,Product}from'../../types';import{formatDate,formatRupiah,statusLabel}from'../../utils';
export function AdminLayout(){return <div className="admin-shell"><aside className="admin-sidebar"><div className="brand"><span className="brand-mark">N</span><span><b>NAFI Admin</b><small>CONTROL PANEL</small></span></div><NavLink end to="/admin">Overview</NavLink><NavLink to="/admin/products">Produk</NavLink><NavLink to="/admin/orders">Pesanan</NavLink><NavLink to="/admin/users">Pengguna</NavLink><NavLink to="/admin/settings">Pengaturan</NavLink><Link to="/">← Kembali ke toko</Link></aside><div className="admin-content"><Outlet/></div></div>}
export function AdminDashboardPage(){const[d,setD]=useState<AdminOverview|null>(null);useEffect(()=>{marketplaceService.adminOverview().then(setD)},[]);if(!d)return <div className="loading-screen"><div className="spinner"/></div>;const cards=[[Wallet,'Pendapatan',formatRupiah(d.total_revenue)],[Package,'Total Order',d.total_orders],[Users,'Total Pengguna',d.total_users],[CheckCircle,'Menunggu Verifikasi',d.waiting_verification]] as const;return <><div className="page-head"><h1>Dashboard Admin</h1><p>Ringkasan performa NAFI Marketplace.</p></div><div className="metric-grid">{cards.map(([I,l,v])=><div className="metric" key={l}><I/><span>{l}</span><b>{v}</b></div>)}</div><div className="content-card"><h2>Pesanan Terbaru</h2>{d.recent_orders?.map(o=><div className="info-row" key={o.order_id}><span>{o.invoice_number} — {o.customer_name}</span><b>{formatRupiah(o.total)}</b></div>)}</div></>}
export function AdminProductsPage(){const[p,setP]=useState<Product[]>([]);const[error,setError]=useState('');const load=()=>marketplaceService.getProducts({limit:200}).then(setP).catch(e=>setError(errorMessage(e)));useEffect(()=>{void load()},[]);return <><div className="page-head"><h1>Kelola Produk</h1></div>{error&&<p className="form-error">{error}</p>}<div className="table-wrap"><table><thead><tr><th>Produk</th><th>Harga</th><th>Stok</th><th>Status</th><th></th></tr></thead><tbody>{p.map(x=><tr key={x.id}><td><b>{x.name}</b></td><td>{formatRupiah(x.price)}</td><td>{x.stock}</td><td>{x.status}</td><td><button className="link-button" onClick={async()=>{if(confirm('Arsipkan produk ini?')){await marketplaceService.adminArchiveProduct(x.id);load()}}}>Arsipkan</button></td></tr>)}</tbody></table></div></>}
export function AdminOrdersPage(){const[o,setO]=useState<Order[]>([]);const load=()=>marketplaceService.adminListOrders().then(setO);useEffect(()=>{void load()},[]);const verify=async(id:string,approved:boolean)=>{await marketplaceService.adminVerifyPayment(id,approved,approved?'Pembayaran diverifikasi.':'Bukti pembayaran ditolak.');await load()};return <><div className="page-head"><h1>Kelola Pesanan</h1></div><div className="table-wrap"><table><thead><tr><th>Invoice</th><th>Pelanggan</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{o.map(x=><tr key={x.order_id}><td>{x.invoice_number}</td><td>{x.customer_name}<small>{x.customer_email}</small></td><td>{formatRupiah(x.total)}</td><td>{statusLabel(x.payment_status)}</td><td><Link to={`/admin/orders/${x.order_id}`}>Detail</Link>{x.payment_status==='waiting_verification'&&<div className="action-row"><button className="icon-btn success" onClick={()=>verify(x.order_id,true)}><CheckCircle/></button><button className="icon-btn danger" onClick={()=>verify(x.order_id,false)}><XCircle/></button></div>}</td></tr>)}</tbody></table></div></>}
export function AdminOrderDetailPage() {
  const { id = '' } = useParams();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const loadOrder = async () => {
    if (!id) {
      setError('ID pesanan tidak ditemukan.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result =
        await marketplaceService.getOrderDetail(id);

      setOrder(result);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [id]);

  const verifyPayment = async (
    approved: boolean
  ) => {
    if (!order) return;

    const confirmation = approved
      ? 'Setujui pembayaran pesanan ini?'
      : 'Tolak bukti pembayaran ini?';

    if (!window.confirm(confirmation)) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await marketplaceService.adminVerifyPayment(
        order.order_id,
        approved,
        approved
          ? 'Pembayaran telah diverifikasi admin.'
          : 'Bukti pembayaran ditolak admin.'
      );

      await loadOrder();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Memuat detail pesanan...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="content-card">
        <h1>Detail Pesanan Admin</h1>

        <p className="form-error">
          {error}
        </p>

        <Link to="/admin/orders">
          Kembali ke daftar pesanan
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="content-card">
        <h1>Pesanan tidak ditemukan</h1>

        <Link to="/admin/orders">
          Kembali ke daftar pesanan
        </Link>
      </div>
    );
  }

  const payment =
    order.payment &&
    typeof order.payment === 'object'
      ? order.payment
      : {};

  const proofUrl = String(
    order.proof_url ||
    payment.proof_url ||
    ''
  );

  const paymentStatus = String(
    order.payment_status || ''
  );

  return (
    <>
      <div className="page-head">
        <h1>Detail Pesanan Admin</h1>

        <p>
          Invoice: <b>{order.invoice_number}</b>
        </p>
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div className="content-card">
        <h2>Informasi Pelanggan</h2>

        <div className="info-row">
          <span>Nama</span>
          <b>{order.customer_name || '-'}</b>
        </div>

        <div className="info-row">
          <span>Email</span>
          <b>{order.customer_email || '-'}</b>
        </div>

        <div className="info-row">
          <span>Tanggal</span>
          <b>{formatDate(order.created_at)}</b>
        </div>
      </div>

      <div className="content-card">
        <h2>Ringkasan Pembayaran</h2>

        <div className="info-row">
          <span>Subtotal</span>
          <b>{formatRupiah(order.subtotal)}</b>
        </div>

        <div className="info-row">
          <span>Diskon</span>
          <b>{formatRupiah(order.discount)}</b>
        </div>

        <div className="info-row">
          <span>Total</span>
          <b>{formatRupiah(order.total)}</b>
        </div>

        <div className="info-row">
          <span>Status pembayaran</span>
          <b>{statusLabel(paymentStatus)}</b>
        </div>

        <div className="info-row">
          <span>Status pesanan</span>
          <b>
            {statusLabel(order.order_status)}
          </b>
        </div>
      </div>

      <div className="content-card">
        <h2>Produk yang Dibeli</h2>

        {order.items?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Harga</th>
                  <th>Jumlah</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {order.items.map((item) => (
                  <tr key={item.order_item_id}>
                    <td>{item.product_name}</td>

                    <td>
                      {formatRupiah(item.price)}
                    </td>

                    <td>{item.quantity}</td>

                    <td>
                      {formatRupiah(
                        item.subtotal
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Item pesanan tidak ditemukan.</p>
        )}
      </div>

      <div className="content-card">
        <h2>Bukti Pembayaran</h2>

        {proofUrl ? (
          <>
            <img
              src={proofUrl}
              alt="Bukti pembayaran"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '420px',
                maxHeight: '520px',
                objectFit: 'contain',
                borderRadius: '16px',
                marginBottom: '20px',
              }}
            />

            <a
              className="btn"
              href={proofUrl}
              target="_blank"
              rel="noreferrer"
            >
              Buka bukti pembayaran
            </a>
          </>
        ) : (
          <p>
            Pengguna belum mengunggah bukti
            pembayaran.
          </p>
        )}

        {paymentStatus ===
          'waiting_verification' && (
          <div
            className="action-row"
            style={{ marginTop: '24px' }}
          >
            <button
              type="button"
              className="btn primary"
              disabled={isSubmitting}
              onClick={() =>
                void verifyPayment(true)
              }
            >
              <CheckCircle size={18} />
              Setujui Pembayaran
            </button>

            <button
              type="button"
              className="btn"
              disabled={isSubmitting}
              onClick={() =>
                void verifyPayment(false)
              }
            >
              <XCircle size={18} />
              Tolak Pembayaran
            </button>
          </div>
        )}
      </div>

      <div className="content-card">
        <Link to="/admin/orders">
          ← Kembali ke daftar pesanan
        </Link>
      </div>
    </>
  );
}
export function AdminUsersPage(){const[u,setU]=useState<Record<string,unknown>[]>([]);useEffect(()=>{marketplaceService.adminListUsers().then(setU)},[]);return <><div className="page-head"><h1>Pengguna</h1></div><div className="table-wrap"><table><thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{u.map((x,i)=><tr key={String(x.user_id||i)}><td>{String(x.full_name||'')}</td><td>{String(x.email||'')}</td><td>{String(x.role||'')}</td><td>{String(x.status||'')}</td></tr>)}</tbody></table></div></>}
export function AdminSettingsPage(){return <><div className="page-head"><h1>Pengaturan</h1></div><div className="content-card"><p>Pengaturan marketplace dikelola melalui sheet <b>settings</b> di Google Sheets agar tetap sesuai backend.</p></div></>}
