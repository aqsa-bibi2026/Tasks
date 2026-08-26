import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.warn('Missing SUPABASE_URL or SUPABASE_KEY in server/.env');
}

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Task 9 API running' });
});

app.get('/api/projects', async (req, res) => {
  const { data, error } = await supabase
    .from('task9_projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/projects', async (req, res) => {
  const { name, status = 'planning' } = req.body;

  const { data, error } = await supabase
    .from('task9_projects')
    .insert({ name, status })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.patch('/api/projects/:id', async (req, res) => {
  const { name, status } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (status !== undefined) updateData.status = status;

  const { data, error } = await supabase
    .from('task9_projects')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/projects/:id/tasks', async (req, res) => {
  const { title, status = 'todo' } = req.body;

  const { data, error } = await supabase
    .from('task9_tasks')
    .insert({
      project_id: req.params.id,
      title,
      status
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.get('/api/audit-logs', async (req, res) => {
  const { data, error } = await supabase
    .from('task9_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Task 9 backend running at http://localhost:${PORT}`);
});
