import React from 'react';

import {
  AlertTriangle,
  BellRing,
  Check,
  CheckCircle2,
  CircleAlert,
  Info,
  Trash2
} from 'lucide-react';

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: CircleAlert
};

export default function NotificationItem({
  item,
  onRead,
  onDelete
}) {
  const Icon = icons[item.type] || BellRing;
  const date = new Date(item.created_at);

  return (
    <article className={`notification-item ${item.read_at ? 'read' : 'unread'}`}>
      <div className={`notification-icon ${item.type}`}>
        <Icon size={18} />
      </div>

      <div className="notification-copy">
        <div className="notification-topline">
          <div>
            <span className="notification-source">{item.source}</span>
            {!item.read_at && <span className="unread-dot" />}
          </div>

          <time>
            {date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            })}
            {' · '}
            {date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </time>
        </div>

        <h3>{item.title}</h3>
        <p>{item.message}</p>

        <div className="notification-meta">
          <span className={`type-badge ${item.type}`}>{item.type}</span>
          <span className={`priority-badge ${item.priority}`}>{item.priority}</span>

          {item.action_label && (
            <a href={item.action_url || '#'}>{item.action_label}</a>
          )}
        </div>
      </div>

      <div className="notification-actions">
        {!item.read_at && (
          <button
            className="icon-button success"
            onClick={() => onRead(item.id)}
            title="Mark as read"
          >
            <Check size={15} />
          </button>
        )}

        <button
          className="icon-button danger"
          onClick={() => onDelete(item.id)}
          title="Delete notification"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}
