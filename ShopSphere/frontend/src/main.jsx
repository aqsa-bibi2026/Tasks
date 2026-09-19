import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API_URL = 'http://localhost:5000/api/products';
const navigation = ['Dashboard', 'Products', 'Orders', 'Customers', 'Analytics'];

function App() {
	const [activePage, setActivePage] = useState('Dashboard');
	const [products, setProducts] = useState([]);
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState('All categories');
	const [modalProduct, setModalProduct] = useState(null);
	const [toast, setToast] = useState('');

	useEffect(() => {
		fetch(API_URL).then(response => response.json()).then(setProducts).catch(() => setToast('Could not connect to the product service.'));
	}, []);

	useEffect(() => {
		if (!toast) return undefined;
		const timeout = setTimeout(() => setToast(''), 3000);
		return () => clearTimeout(timeout);
	}, [toast]);

	const categories = useMemo(() => ['All categories', ...new Set(products.map(product => product.category))], [products]);
	const filteredProducts = products.filter(product => {
		const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
		return matchesSearch && (category === 'All categories' || product.category === category);
	});
	const lowStock = products.filter(product => product.stock > 0 && product.stock < 10).length;
	const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

	async function saveProduct(formData) {
		const isEditing = Boolean(formData.id);
		const response = await fetch(isEditing ? `${API_URL}/${formData.id}` : API_URL, {
			method: isEditing ? 'PUT' : 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData)
		});
		if (!response.ok) throw new Error('Unable to save product');
		const saved = await response.json();
		setProducts(current => isEditing ? current.map(product => product.id === saved.id ? saved : product) : [saved, ...current]);
		setModalProduct(null);
		setToast(isEditing ? 'Product updated.' : 'Product added to your catalog.');
	}

	async function deleteProduct(product) {
		if (!window.confirm(`Remove ${product.name} from your catalog?`)) return;
		const response = await fetch(`${API_URL}/${product.id}`, { method: 'DELETE' });
		if (!response.ok) return setToast('Could not remove that product.');
		setProducts(current => current.filter(item => item.id !== product.id));
		setToast('Product removed.');
	}

	return <div className="app-shell">
		<aside className="sidebar">
			<div className="brand"><span className="brand-mark">S</span><span>ShopSphere</span></div>
			<div className="workspace-switcher"><span className="avatar small">AK</span><span><b>Alex Kim</b><small>Acme storefront</small></span><span className="chevron">v</span></div>
			<nav className="main-nav" aria-label="Main navigation">
				<span className="nav-label">Workspace</span>
				{navigation.map((item, index) => <button key={item} className={activePage === item ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage(item)}><span className="nav-icon">{['+','[]','=', '@','~'][index]}</span>{item}{item === 'Orders' && <span className="nav-count">12</span>}</button>)}
				<span className="nav-label nav-label-spaced">Tools</span>
				<button className="nav-item" onClick={() => setToast('AI insights are being prepared for your store.')}><span className="nav-icon">*</span>AI Assistant<span className="new-tag">NEW</span></button>
			</nav>
			<div className="sidebar-footer"><div className="help-row"><span className="help-icon">?</span><span><b>Need a hand?</b><small>Visit the help center</small></span></div><div className="user-row"><span className="avatar">AK</span><span><b>Alex Kim</b><small>Administrator</small></span><span className="more">...</span></div></div>
		</aside>
		<main className="content">
			<header className="topbar"><div className="breadcrumb">Workspace <span>/</span> {activePage}</div><div className="top-actions"><button className="icon-button" title="Notifications">!<span className="notification-dot" /></button><button className="profile-button"><span className="avatar small">AK</span><span>Alex Kim</span><span className="chevron">v</span></button></div></header>
			{activePage === 'Dashboard' ? <Dashboard products={products} lowStock={lowStock} inventoryValue={inventoryValue} onProducts={() => setActivePage('Products')} /> : activePage === 'Products' ? <ProductsPage products={filteredProducts} allProducts={products} categories={categories} category={category} search={search} setCategory={setCategory} setSearch={setSearch} onAdd={() => setModalProduct({})} onEdit={setModalProduct} onDelete={deleteProduct} /> : <EmptyPage title={activePage} onProducts={() => setActivePage('Products')} />}
		</main>
		{modalProduct && <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} onSave={saveProduct} />}
		{toast && <div className="toast">{toast}</div>}
	</div>;
}

function Dashboard({ products, lowStock, inventoryValue, onProducts }) {
	const sold = products.reduce((sum, product) => sum + product.sales, 0);
	return <div className="page"><div className="page-heading"><div><p className="eyebrow">Saturday, September 19, 2026</p><h1>Good morning, Alex <span className="wave">~</span></h1><p className="subheading">Here is what is happening with your store today.</p></div><button className="primary-button" onClick={onProducts}><span>+</span> Manage products</button></div>
		<div className="metric-grid"><Metric label="Total revenue" value="$125,400" change="+12.8%" note="vs. last month" accent="coral" /><Metric label="Orders" value="1,240" change="+8.4%" note="vs. last month" accent="blue" /><Metric label="Products" value={products.length || '0'} change={`${lowStock} need attention`} note="in your catalog" accent="yellow" /><Metric label="Units sold" value={sold.toLocaleString()} change="+5.2%" note="vs. last month" accent="green" /></div>
		<div className="dashboard-grid"><section className="panel revenue-panel"><div className="panel-heading"><div><h2>Revenue overview</h2><p>Monthly revenue performance</p></div><select defaultValue="6 months"><option>6 months</option><option>12 months</option></select></div><div className="chart"><div className="chart-y"><span>$30k</span><span>$20k</span><span>$10k</span><span>$0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 700 230" preserveAspectRatio="none" aria-label="Revenue chart"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ef745c" stopOpacity=".26"/><stop offset="1" stopColor="#ef745c" stopOpacity="0"/></linearGradient></defs><path d="M0 185 C45 170 75 175 112 142 S180 150 220 115 S285 135 330 95 S390 120 430 82 S490 105 530 62 S600 75 700 28 L700 230 L0 230Z" fill="url(#fill)"/><path d="M0 185 C45 170 75 175 112 142 S180 150 220 115 S285 135 330 95 S390 120 430 82 S490 105 530 62 S600 75 700 28" fill="none" stroke="#ef745c" strokeWidth="3" strokeLinecap="round"/></svg><div className="chart-x"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div></div></div></section><section className="panel insights-panel"><div className="panel-heading"><div><h2>Store pulse</h2><p>Signals worth your attention</p></div><span className="pulse-dot" /></div><div className="insight"><span className="insight-icon coral">$</span><div><b>Revenue is up 12.8%</b><p>You are ahead of last month by <strong>$14,220</strong>.</p></div></div><div className="insight"><span className="insight-icon yellow">!</span><div><b>{lowStock || 'No'} low-stock products</b><p>Review your inventory before it impacts sales.</p></div></div><button className="text-button" onClick={onProducts}>Review catalog <span>-&gt;</span></button></section></div>
		<section className="panel activity-panel"><div className="panel-heading"><div><h2>Top products</h2><p>Your best performers this month</p></div><button className="text-button" onClick={onProducts}>View all <span>-&gt;</span></button></div><div className="top-products">{products.slice(0, 3).map((product, index) => <div className="top-product" key={product.id}><span className={`product-thumb thumb-${index}`}>{product.name.slice(0, 1)}</span><span><b>{product.name}</b><small>{product.category}</small></span><strong>${product.price}</strong></div>)}</div></section>
	</div>;
}

function Metric({ label, value, change, note, accent }) { return <div className="metric"><span className={`metric-icon ${accent}`}>{accent === 'coral' ? '$' : accent === 'blue' ? '=' : accent === 'yellow' ? '[]' : '+'}</span><p>{label}</p><h2>{value}</h2><small className={accent === 'yellow' ? 'warning' : ''}>{change} <em>{note}</em></small></div>; }

function ProductsPage({ products, allProducts, categories, category, search, setCategory, setSearch, onAdd, onEdit, onDelete }) { return <div className="page"><div className="page-heading"><div><p className="eyebrow">Catalog management</p><h1>Products</h1><p className="subheading">Keep your catalog fresh, accurate, and ready to sell.</p></div><button className="primary-button" onClick={onAdd}><span>+</span> Add product</button></div><div className="product-summary"><div><b>{allProducts.length}</b><span>Total products</span></div><div><b>{allProducts.filter(product => product.stock > 0).length}</b><span>In stock</span></div><div className="summary-warning"><b>{allProducts.filter(product => product.stock < 10).length}</b><span>Need attention</span></div><div><b>${allProducts.reduce((sum, product) => sum + product.price * product.stock, 0).toLocaleString()}</b><span>Inventory value</span></div></div><section className="panel products-panel"><div className="product-toolbar"><div className="search-box"><span>/</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products" /></div><select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(option => <option key={option}>{option}</option>)}</select></div>{products.length ? <div className="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Sales</th><th /></tr></thead><tbody>{products.map(product => <tr key={product.id}><td><div className="table-product"><span className="product-thumb">{product.name.slice(0, 1)}</span><span><b>{product.name}</b><small>ID: {product.id}</small></span></div></td><td>{product.category}</td><td><b>${product.price.toFixed(2)}</b></td><td>{product.stock}</td><td><span className={`status status-${product.status.toLowerCase().replaceAll(' ', '-')}`}>{product.status}</span></td><td>{product.sales}</td><td><div className="row-actions"><button title="Edit product" onClick={() => onEdit(product)}>Edit</button><button title="Delete product" onClick={() => onDelete(product)}>Delete</button></div></td></tr>)}</tbody></table></div> : <div className="empty-state"><span>?</span><h3>No products found</h3><p>Try a different search or add a new product.</p></div>}</section></div>; }

function ProductModal({ product, onClose, onSave }) { const [form, setForm] = useState({ name: product.name || '', category: product.category || 'Apparel', price: product.price ?? '', stock: product.stock ?? '' }); const [error, setError] = useState(''); const update = event => setForm({ ...form, [event.target.name]: event.target.value }); const submit = async event => { event.preventDefault(); try { await onSave({ ...form, id: product.id }); } catch { setError('Please check the form and try again.'); } }; return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><div className="modal"><div className="modal-heading"><div><p className="eyebrow">Catalog</p><h2>{product.id ? 'Edit product' : 'Add product'}</h2></div><button className="close-button" onClick={onClose}>x</button></div><form onSubmit={submit}><label>Product name<input name="name" value={form.name} onChange={update} placeholder="e.g. Everyday tote" required /></label><label>Category<select name="category" value={form.category} onChange={update}><option>Apparel</option><option>Accessories</option><option>Footwear</option><option>Home</option><option>Electronics</option></select></label><div className="form-row"><label>Price<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={update} placeholder="0.00" required /></label><label>Stock<input name="stock" type="number" min="0" value={form.stock} onChange={update} placeholder="0" required /></label></div>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">{product.id ? 'Save changes' : 'Add product'}</button></div></form></div></div>; }

function EmptyPage({ title, onProducts }) { return <div className="page empty-page"><span className="empty-illustration">+</span><h1>{title}</h1><p>This workspace is ready for your next workflow.</p><button className="secondary-button" onClick={onProducts}>Go to products</button></div>; }

createRoot(document.getElementById('root')).render(<App />);
