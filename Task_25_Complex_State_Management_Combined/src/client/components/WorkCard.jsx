import React from 'react';

import {
  CalendarDays,
  ChevronRight,
  CircleUserRound
} from 'lucide-react';

const statusOrder = [
  'Backlog',
  'In Progress',
  'Review',
  'Done'
];

export default function WorkCard({
  item,
  onOpen,
  onMove
}) {
  const index =
    statusOrder.indexOf(item.status);

  const next =
    statusOrder[
      Math.min(
        index + 1,
        statusOrder.length - 1
      )
    ];

  return (
    <article className="work-card">
      <div className="work-card-top">
        <span
          className={`priority ${item.priority.toLowerCase()}`}
        >
          {item.priority}
        </span>

        <button
          type="button"
          onClick={() =>
            onOpen(item.id)
          }
          aria-label="Open details"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <h3>{item.title}</h3>

      <p>{item.description}</p>

      <div className="work-meta">
        <span>
          <CircleUserRound size={13} />
          {item.owner_name}
        </span>

        <span>
          <CalendarDays size={13} />
          {item.due_date || 'No due date'}
        </span>
      </div>

      {next !== item.status && (
        <button
          type="button"
          className="move-button"
          onClick={() =>
            onMove(item.id, next)
          }
        >
          Move to {next}
        </button>
      )}
    </article>
  );
}
