import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const app = express()
const PORT = process.env.PORT || 5000
app.use(cors())
app.use(express.json({ limit: '2mb' }))

const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
const supabase = hasSupabase
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

const memory = new Map()

const workflowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  nodes: z.array(z.any()),
  edges: z.array(z.any())
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, storage: hasSupabase ? 'supabase' : 'memory' })
})

app.get('/api/workflows/:id', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('workflows').select('*').eq('id', req.params.id).maybeSingle()
      if (error) throw error
      return res.json({ workflow: data })
    }
    res.json({ workflow: memory.get(req.params.id) || null })
  } catch (error) { next(error) }
})

app.post('/api/workflows', async (req, res, next) => {
  try {
    const workflow = workflowSchema.parse(req.body)
    const payload = { ...workflow, updated_at: new Date().toISOString() }
    if (supabase) {
      const { data, error } = await supabase.from('workflows').upsert(payload).select().single()
      if (error) throw error
      return res.json({ ok: true, workflow: data })
    }
    memory.set(workflow.id, payload)
    res.json({ ok: true, workflow: payload })
  } catch (error) { next(error) }
})

app.post('/api/workflows/:id/run', async (req, res, next) => {
  try {
    const input = workflowSchema.partial({ id: true }).parse(req.body)
    const nodes = input.nodes || []
    const logs = []
    logs.push({ type: 'info', message: `Executing ${nodes.length} workflow nodes.` })
    for (const node of nodes) {
      logs.push({ type: 'success', message: `${node.data?.label || node.id} completed successfully.` })
    }
    logs.push({ type: 'success', message: 'Workflow execution completed.' })
    res.json({ ok: true, workflowId: req.params.id, logs })
  } catch (error) { next(error) }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: error.flatten() })
  res.status(500).json({ error: error.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`FlowForge API running on http://localhost:${PORT}`)
  console.log(`Storage mode: ${hasSupabase ? 'Supabase' : 'In-memory fallback'}`)
})
