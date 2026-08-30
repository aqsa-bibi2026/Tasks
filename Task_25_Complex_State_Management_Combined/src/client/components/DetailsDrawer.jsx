import React from 'react';

import {
  CalendarDays,
  CircleUserRound,
  Trash2,
  X
} from 'lucide-react';

export default function DetailsDrawer({
  item,
  onClose,
  onDelete
}) {
  if (!item) return null;

  return (
    <div className="drawer-layer">
      <button
        type="button"
        className="drawer-scrim"
        onClick={onClose}
        aria-label="Close details"
      />

      <aside className="details-drawer">
        <div className="drawer-head">
          <div>
            <small>WORK ITEM</small>
            <h2>{item.title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <span
          className={`priority ${item.priority.toLowerCase()}`}
        >
          {item.priority}
        </span>

        <p>{item.description}</p>

        <div className="drawer-meta">
          <article>
            <CircleUserRound size={15} />
            <div>
              <small>OWNER</small>
              <b>{item.owner_name}</b>
            </div>
          </article>

          <article>
            <CalendarDays size={15} />
            <div>
              <small>DUE DATE</small>
              <b>
                {item.due_date ||
                  'Not assigned'}
              </b>
            </div>
          </article>
        </div>

        <div className="status-detail">
          <small>CURRENT STATUS</small>
          <b>{item.status}</b>
        </div>

        <button
          type="button"
          className="danger-button"
          onClick={() =>
            onDelete(item.id)
          }
        >
          <Trash2 size={15} />
          Delete work item
        </button>
      </aside>
    </div>
  );
}
