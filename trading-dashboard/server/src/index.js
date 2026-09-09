import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = hasSupabase ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;
const memoryOrders = [];

app.get('/api/health', (_req, res) => res.json({ ok: true, storage: hasSupabase ? 'supabase' : 'memory' }));

app.get('/api/orders', async (_req, res) => {
  if (!supabase) return res.json(memoryOrders);
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/orders', async (req, res) => {
  const { symbol, side, qty, price } = req.body;
  if (!symbol || !['Buy','Sell'].includes(side) || !Number.isFinite(Number(qty)) || Number(qty) <= 0) {
    return res.status(400).json({ error: 'Invalid order payload' });
  }
  const order = { symbol, side, qty: Number(qty), price: Number(price), status: 'Filled' };
  if (!supabase) {
    const saved = { id: Date.now(), ...order, created_at: new Date().toISOString() };
    memoryOrders.unshift(saved);
    return res.status(201).json(saved);
  }
  const { data, error } = await supabase.from('orders').insert(order).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.listen(port, () => {
  console.log(`NexaTrade API running on http://localhost:${port}`);
  console.log(`Storage mode: ${hasSupabase ? 'Supabase' : 'In-memory fallback'}`);
});
