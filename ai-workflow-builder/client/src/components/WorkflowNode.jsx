import { Handle, Position } from '@xyflow/react'
import { Bot, Clock3, Database, GitBranch, Globe2, Mail, Zap } from 'lucide-react'

const icons = {
  trigger: Zap,
  api: Globe2,
  condition: GitBranch,
  ai: Bot,
  email: Mail,
  database: Database,
  delay: Clock3
}

export default function WorkflowNode({ data, selected }) {
  const Icon = icons[data.kind] || Zap
  return (
    <div className={`workflow-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className={`node-icon ${data.kind}`}><Icon size={18} /></div>
      <div className="node-copy">
        <span className="node-kicker">{data.kind}</span>
        <strong>{data.label}</strong>
        <small>{data.description}</small>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
