import React from 'react';

export default function StatCard({ label, value, helper, icon: Icon, tone, index }) {
  return (
    <article
      className={`stat-card ${tone}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className="stat-icon">
        <Icon size={18} />
      </span>

      <div>
        <small>{label}</small>
        <b>{value}</b>
        <em>{helper}</em>
      </div>
    </article>
  );
}
