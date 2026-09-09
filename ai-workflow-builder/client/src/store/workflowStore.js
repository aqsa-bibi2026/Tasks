import { create } from 'zustand'
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'

const initialNodes = [
  {
    id: 'trigger-1',
    type: 'workflowNode',
    position: { x: 120, y: 170 },
    data: { kind: 'trigger', label: 'Webhook Trigger', description: 'Starts when an incoming webhook arrives.' }
  },
  {
    id: 'ai-1',
    type: 'workflowNode',
    position: { x: 430, y: 170 },
    data: { kind: 'ai', label: 'AI Prompt', description: 'Summarize and classify the incoming payload.' }
  },
  {
    id: 'email-1',
    type: 'workflowNode',
    position: { x: 740, y: 170 },
    data: { kind: 'email', label: 'Send Email', description: 'Send the generated result to the customer.' }
  }
]

const initialEdges = [
  { id: 'e1-2', source: 'trigger-1', target: 'ai-1', animated: true },
  { id: 'e2-3', source: 'ai-1', target: 'email-1', animated: true }
]

export const useWorkflowStore = create((set, get) => ({
  workflowId: 'demo-workflow',
  workflowName: 'Lead Qualification Flow',
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  logs: [],
  saving: false,
  running: false,

  setWorkflowName: (workflowName) => set({ workflowName }),
  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) => set({ edges: addEdge({ ...connection, animated: true }, get().edges) }),
  selectNode: (selectedNodeId) => set({ selectedNodeId }),
  addNode: (kind, position = { x: 300, y: 260 }) => {
    const id = `${kind}-${Date.now()}`
    const defaults = {
      trigger: ['Webhook Trigger', 'Start the workflow from an event.'],
      api: ['API Request', 'Call an external REST API.'],
      condition: ['Condition', 'Branch based on a rule.'],
      ai: ['AI Prompt', 'Generate or transform content with AI.'],
      email: ['Send Email', 'Deliver a message to a recipient.'],
      database: ['Database', 'Read or write workflow data.'],
      delay: ['Delay', 'Pause execution before the next step.']
    }
    const [label, description] = defaults[kind]
    set({
      nodes: [...get().nodes, { id, type: 'workflowNode', position, data: { kind, label, description } }],
      selectedNodeId: id
    })
  },
  updateSelectedNode: (patch) => {
    const id = get().selectedNodeId
    if (!id) return
    set({ nodes: get().nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n) })
  },
  deleteSelectedNode: () => {
    const id = get().selectedNodeId
    if (!id) return
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: null
    })
  },
  clearLogs: () => set({ logs: [] }),
  saveWorkflow: async () => {
    set({ saving: true })
    try {
      const state = get()
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: state.workflowId,
          name: state.workflowName,
          nodes: state.nodes,
          edges: state.edges
        })
      })
      if (!response.ok) throw new Error('Could not save workflow')
      const result = await response.json()
      set({ logs: [{ type: 'success', message: 'Workflow saved successfully.' }, ...get().logs] })
      return result
    } catch (error) {
      set({ logs: [{ type: 'error', message: error.message }, ...get().logs] })
    } finally {
      set({ saving: false })
    }
  },
  runWorkflow: async () => {
    set({ running: true, logs: [{ type: 'info', message: 'Workflow execution started…' }, ...get().logs] })
    try {
      const state = get()
      const response = await fetch(`/api/workflows/${state.workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: state.workflowName, nodes: state.nodes, edges: state.edges })
      })
      if (!response.ok) throw new Error('Workflow execution failed')
      const result = await response.json()
      set({ logs: [...result.logs.reverse(), ...get().logs] })
    } catch (error) {
      set({ logs: [{ type: 'error', message: error.message }, ...get().logs] })
    } finally {
      set({ running: false })
    }
  }
}))
