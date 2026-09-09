import { useCallback, useMemo, useState } from 'react'
import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react'
import { ChevronDown, Play, Save, Settings2 } from 'lucide-react'
import WorkflowNode from './components/WorkflowNode'
import Sidebar from './components/Sidebar'
import Inspector from './components/Inspector'
import ExecutionLog from './components/ExecutionLog'
import { useWorkflowStore } from './store/workflowStore'

export default function App() {
  const {
    workflowName, setWorkflowName, nodes, edges, onNodesChange, onEdgesChange,
    onConnect, selectNode, addNode, saveWorkflow, runWorkflow, saving, running
  } = useWorkflowStore()
  const [showLogs, setShowLogs] = useState(true)
  const nodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), [])

  const onDrop = useCallback((event) => {
    event.preventDefault()
    const kind = event.dataTransfer.getData('application/workflow-node')
    if (!kind) return
    const bounds = event.currentTarget.getBoundingClientRect()
    addNode(kind, { x: event.clientX - bounds.left - 110, y: event.clientY - bounds.top - 50 })
  }, [addNode])

  return (
    <div className="app-shell">
      <Sidebar addNode={addNode} />
      <main className="workspace">
        <header className="topbar">
          <div className="title-wrap">
            <div className="breadcrumb">Workflows <span>/</span></div>
            <input value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} />
          </div>
          <div className="top-actions">
            <button className="ghost-btn" onClick={() => setShowLogs((v) => !v)}><Settings2 size={16} /> Logs <ChevronDown size={14} /></button>
            <button className="ghost-btn" onClick={saveWorkflow} disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save'}</button>
            <button className="run-btn" onClick={runWorkflow} disabled={running}><Play size={16} fill="currentColor" /> {running ? 'Running…' : 'Run workflow'}</button>
          </div>
        </header>

        <div className="canvas-zone" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => selectNode(node.id)}
            onPaneClick={() => selectNode(null)}
            fitView
            
          >
            <Background gap={22} size={1} />
            <Controls position="bottom-left" />
            <MiniMap pannable zoomable position="bottom-right" />
          </ReactFlow>
          <Inspector />
          {showLogs && <ExecutionLog />}
        </div>
      </main>
    </div>
  )
}
