import { Trash2, X } from 'lucide-react'
import { useWorkflowStore } from '../store/workflowStore'

export default function Inspector() {
  const { nodes, selectedNodeId, selectNode, updateSelectedNode, deleteSelectedNode } = useWorkflowStore()
  const node = nodes.find((n) => n.id === selectedNodeId)

  return (
    <aside className={`inspector ${node ? 'open' : ''}`}>
      {node ? (
        <>
          <div className="inspector-head">
            <div><span>NODE SETTINGS</span><strong>{node.data.label}</strong></div>
            <button className="icon-btn" onClick={() => selectNode(null)}><X size={17} /></button>
          </div>
          <label className="field-label">Node title</label>
          <input className="field-input" value={node.data.label} onChange={(e) => updateSelectedNode({ label: e.target.value })} />
          <label className="field-label">Description</label>
          <textarea className="field-input textarea" value={node.data.description} onChange={(e) => updateSelectedNode({ description: e.target.value })} />
          <label className="field-label">Node type</label>
          <div className="readonly-box">{node.data.kind}</div>
          <div className="inspector-spacer" />
          <button className="danger-btn" onClick={deleteSelectedNode}><Trash2 size={16} /> Delete node</button>
        </>
      ) : (
        <div className="inspector-empty">
          <div className="empty-ring">⌁</div>
          <strong>Select a node</strong>
          <p>Click any workflow node to configure it.</p>
        </div>
      )}
    </aside>
  )
}
