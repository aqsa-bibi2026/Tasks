import React from 'react';

export default function MetricCard({
  label,
  value,
  icon: Icon,
  helper
}) {
  return (
    <article className="metric-card">
      <span>
        <Icon size={19} />
      </span>

      <div>
        <small>{label}</small>
        <b>{value}</b>
        <em>{helper}</em>
      </div>
    </article>
  );
}
