import React from 'react';

export default function MetricCard({
  metric,
  icon: Icon,
  index
}) {
  return (
    <article
      className="metric-card"
      style={{
        animationDelay:
          `${index * 70}ms`
      }}
    >
      <span>
        <Icon size={18} />
      </span>

      <div>
        <small>{metric.label}</small>
        <b>{metric.value}</b>
        <em>{metric.helper}</em>
      </div>
    </article>
  );
}
