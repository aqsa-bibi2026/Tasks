import React from 'react';
import { BarChart3, Bell, BriefcaseBusiness, CandlestickChart, LayoutDashboard, Settings, Star, WalletCards } from 'lucide-react';

const items = [
  [LayoutDashboard, 'Overview'], [CandlestickChart, 'Markets'], [Star, 'Watchlist'],
  [BriefcaseBusiness, 'Portfolio'], [WalletCards, 'Orders'], [Bell, 'Alerts']
];

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><BarChart3 size={18}/></div><span>NexaTrade</span></div>
      <nav>
        <p className="nav-label">Workspace</p>
        {items.map(([Icon, label]) => (
          <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => onChange(label)}>
            <Icon size={18}/><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item"><Settings size={18}/><span>Settings</span></button>
        <div className="profile"><div className="avatar">AK</div><div><strong>Alex Khan</strong><small>Pro account</small></div></div>
      </div>
    </aside>
  );
}
