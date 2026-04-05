const { useState, useEffect } = React;

function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: '', price: '' });
  const [orderForm, setOrderForm] = useState({ product_id: '', quantity: 1 });
  const [tab, setTab] = useState('products');
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const [p, o] = await Promise.all([
        fetch('/products').then(r => r.json()),
        fetch('/orders').then(r => r.json()),
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const addProduct = async () => {
    if (!form.name || !form.price) return;
    await fetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, price: parseFloat(form.price) }),
    });
    setForm({ name: '', price: '' });
    setMsg('Produit ajouté !');
    load();
    setTimeout(() => setMsg(''), 2000);
  };

  const addOrder = async () => {
    if (!orderForm.product_id) return;
    const res = await fetch('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: parseInt(orderForm.product_id), quantity: parseInt(orderForm.quantity) }),
    });
    const data = await res.json();
    if (data.error) setMsg('Erreur : ' + data.error);
    else setMsg('Commande créée ! Total : ' + data.total + '€');
    load();
    setTimeout(() => setMsg(''), 3000);
  };

  const s = {
    app: { fontFamily: 'system-ui,sans-serif', maxWidth: 900, margin: '0 auto', padding: '2rem' },
    header: { background: '#2E4057', color: '#fff', borderRadius: 12, padding: '1.5rem 2rem', marginBottom: '2rem' },
    tabs: { display: 'flex', gap: 8, marginBottom: '1.5rem' },
    tab: (a) => ({ padding: '0.5rem 1.5rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: a ? '#4472C4' : '#eee', color: a ? '#fff' : '#333', fontWeight: a ? 600 : 400 }),
    card: { background: '#f8f9fa', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem', border: '1px solid #e0e0e0' },
    input: { padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #ccc', fontSize: 14, marginRight: 8 },
    btn: { padding: '0.5rem 1.25rem', borderRadius: 6, background: '#4472C4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 },
    badge: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 20, background: '#e3f2fd', color: '#1565c0', fontSize: 12, fontWeight: 600 },
    msg: { background: '#e8f5e9', color: '#2e7d32', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 },
  };

  return (
    <div style={s.app}>
      <div style={s.header}>
        <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Shop Microservices pour projet MLSD</h1>
        <p style={{ margin: '0.3rem 0 0', opacity: 0.8, fontSize: 14 }}>
          {products.length} produits — {orders.length} commandes
        </p>
      </div>

      {msg && <div style={s.msg}>{msg}</div>}

      <div style={s.tabs}>
        <button style={s.tab(tab === 'products')} onClick={() => setTab('products')}>Produits</button>
        <button style={s.tab(tab === 'orders')} onClick={() => setTab('orders')}>Commandes</button>
      </div>

      {tab === 'products' && (
        <div>
          <div style={s.card}>
            <h3 style={{ marginTop: 0 }}>Ajouter un produit</h3>
            <input style={s.input} placeholder="Nom" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
            <input style={{ ...s.input, width: 100 }} placeholder="Prix €" type="number" value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })} />
            <button style={s.btn} onClick={addProduct}>Ajouter</button>
          </div>
          <div style={s.grid}>
            {products.map(p => (
              <div key={p.id} style={s.card}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
                <span style={s.badge}>{parseFloat(p.price).toFixed(2)} €</span>
                <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>ID #{p.id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div>
          <div style={s.card}>
            <h3 style={{ marginTop: 0 }}>Passer une commande</h3>
            <select style={s.input} value={orderForm.product_id}
              onChange={e => setOrderForm({ ...orderForm, product_id: e.target.value })}>
              <option value="">-- Choisir un produit --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.price}€)</option>
              ))}
            </select>
            <input style={{ ...s.input, width: 70 }} type="number" min="1" value={orderForm.quantity}
              onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })} />
            <button style={s.btn} onClick={addOrder}>Commander</button>
          </div>
          {orders.map(o => (
            <div key={o.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Commande #{o.id}</span>
                  <span style={{ color: '#888', marginLeft: 8, fontSize: 13 }}>{o.product_name} × {o.quantity}</span>
                </div>
                <span style={{ ...s.badge, background: '#fff3e0', color: '#e65100' }}>
                  {parseFloat(o.total_price).toFixed(2)} €
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);