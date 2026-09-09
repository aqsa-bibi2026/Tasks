import { Bot, Clock3, Database, GitBranch, Globe2, Mail, Sparkles, Zap } from 'lucide-react'

const items = [
  ['trigger', 'Trigger', Zap],
  ['api', 'API Request', Globe2],
  ['condition', 'Condition', GitBranch],
  ['ai', 'AI Prompt', Bot],
  ['email', 'Send Email', Mail],
  ['database', 'Database', Database],
  ['delay', 'Delay', Clock3]
]

export default function Sidebar({ addNode }) {
  const startDrag = (event, kind) => {
    event.dataTransfer.setData('application/workflow-node', kind)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Sparkles size={18} /></div>
        <div><strong>FlowForge</strong><span>AI automations</span></div>
      </div>
      <div className="sidebar-section-title">NODES</div>
      <div className="node-palette">
        {items.map(([kind, label, Icon]) => (
          <button key={kind} className="palette-item" draggable onDragStart={(e) => startDrag(e, kind)} onClick={() => addNode(kind)}>
            <span className={`palette-icon ${kind}`}><Icon size={17} /></span>
            <span>{label}</span>
            <span className="drag-dots">⋮⋮</span>
          </button>
        ))}
      </div>
      <div className="sidebar-tip">
        <strong>Tip</strong>
        <p>Drag a node onto the canvas or click it to add instantly.</p>
      </div>
    </aside>
  )
}
