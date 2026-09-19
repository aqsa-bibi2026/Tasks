const express=require('express');
const cors=require('cors');
const app=express();
app.use(cors());
app.use(express.json());

let products = [
	{ id: 'p-1001', name: 'Aero Knit Sneakers', category: 'Footwear', price: 129, stock: 42, status: 'Active', sales: 186 },
	{ id: 'p-1002', name: 'Contour Everyday Tote', category: 'Accessories', price: 84, stock: 18, status: 'Active', sales: 124 },
	{ id: 'p-1003', name: 'Lumen Desk Lamp', category: 'Home', price: 68, stock: 7, status: 'Low stock', sales: 98 },
	{ id: 'p-1004', name: 'Cloudline Overshirt', category: 'Apparel', price: 112, stock: 0, status: 'Out of stock', sales: 76 },
	{ id: 'p-1005', name: 'Arc Ceramic Set', category: 'Home', price: 56, stock: 31, status: 'Active', sales: 64 }
];

app.get('/api/products',(req,res)=>res.json(products));
app.post('/api/products',(req,res)=>{
	const { name, category, price, stock } = req.body;
	if (!name || !category || Number.isNaN(Number(price)) || Number.isNaN(Number(stock))) {
		return res.status(400).json({ error: 'Name, category, price and stock are required.' });
	}
	const product = { id: `p-${Date.now()}`, name, category, price: Number(price), stock: Number(stock), status: Number(stock) === 0 ? 'Out of stock' : Number(stock) < 10 ? 'Low stock' : 'Active', sales: 0 };
	products = [product, ...products];
	res.status(201).json(product);
});
app.put('/api/products/:id',(req,res)=>{
	const index = products.findIndex(product => product.id === req.params.id);
	if (index === -1) return res.status(404).json({ error: 'Product not found.' });
	const current = products[index];
	const next = { ...current, ...req.body, price: Number(req.body.price ?? current.price), stock: Number(req.body.stock ?? current.stock) };
	next.status = next.stock === 0 ? 'Out of stock' : next.stock < 10 ? 'Low stock' : 'Active';
	products[index] = next;
	res.json(next);
});
app.delete('/api/products/:id',(req,res)=>{
	const exists = products.some(product => product.id === req.params.id);
	if (!exists) return res.status(404).json({ error: 'Product not found.' });
	products = products.filter(product => product.id !== req.params.id);
	res.status(204).end();
});
app.listen(5000,()=>console.log('ShopSphere API running on 5000'));
