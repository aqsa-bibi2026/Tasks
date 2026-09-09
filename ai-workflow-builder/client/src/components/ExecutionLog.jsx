import { CheckCircle2, CircleAlert, Info, Trash2 } from 'lucide-react'
import { useWorkflowStore } from '../store/workflowStore'

export default function ExecutionLog() {
  const { logs, clearLogs } = useWorkflowStore()
  return (
    <section className="log-panel">
      <div className="log-head">
        <div><strong>Execution log</strong><span>{logs.length} events</span></div>
        <button className="ghost-btn small" onClick={clearLogs}><Trash2 size={14} /> Clear</button>
      </div>
      <div className="log-list">
        {logs.length === 0 ? <div className="log-empty">Run the workflow to see execution details.</div> : logs.map((log, i) => {
          const Icon = log.type === 'success' ? CheckCircle2 : log.type === 'error' ? CircleAlert : Info
          return <div className={`log-item ${log.type}`} key={`${log.message}-${i}`}><Icon size={15} /><span>{log.message}</span></div>
        })}
      </div>
    </section>
  )
}
