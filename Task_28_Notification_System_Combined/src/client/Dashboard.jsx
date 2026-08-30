import React, { useEffect, useMemo, useState } from 'react';

import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCheck,
  CircleAlert,
  Inbox,
  LoaderCircle,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2
} from 'lucide-react';

import { api } from './api.js';
import NotificationItem from './components/NotificationItem.jsx';
import StatCard from './components/StatCard.jsx';
import Toast from './components/Toast.jsx';

const statusFilters = [
  { key: 'all', label: 'All notifications' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' }
];

const typeFilters = ['all', 'info', 'success', 'warning', 'error'];
const priorityFilters = ['all', 'urgent', 'high', 'normal', 'low'];

export default function Dashboard({ user, onLoggedOut }) {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    urgent: 0,
    warnings: 0
  });

  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [priority, setPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [notificationsData, statsData] = await Promise.all([
        api.notifications({ status, type, priority, q: query }),
        api.stats()
      ]);

      setNotifications(notificationsData.notifications);
      setStats(statsData.stats);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status, type, priority, query]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const mutate = async (action, successMessage) => {
    setBusy(true);

    try {
      await action();
      await load();
      showToast(successMessage);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const cards = useMemo(
    () => [
      {
        label: 'Unread',
        value: stats.unread,
        helper: 'Needs your attention',
        icon: BellRing,
        tone: 'violet'
      },
      {
        label: 'Total',
        value: stats.total,
        helper: 'Notification history',
        icon: Inbox,
        tone: 'blue'
      },
      {
        label: 'Urgent',
        value: stats.urgent,
        helper: 'Immediate action',
        icon: CircleAlert,
        tone: 'red'
      },
      {
        label: 'Warnings',
        value: stats.warnings,
        helper: 'Review recommended',
        icon: AlertTriangle,
        tone: 'amber'
      }
    ],
    [stats]
  );

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      onLoggedOut();
    }
  };

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="brand">
          <span><BellRing size={22} /></span>
          <div>
            <b>PulseNotify</b>
            <small>Notification Intelligence</small>
          </div>
        </div>

        <nav>
          <button className="active">
            <Inbox size={17} />
            Notification Center
            {stats.unread > 0 && <strong>{stats.unread}</strong>}
          </button>

          <button disabled>
            <Bell size={17} />
            Preferences
          </button>

          <button disabled>
            <ShieldCheck size={17} />
            Delivery Rules
          </button>
        </nav>

        <div className="sidebar-tip">
          <Sparkles size={16} />
          <div>
            <b>Smart inbox</b>
            <small>Focus on unread and urgent notifications first.</small>
          </div>
        </div>

        <div className="profile-card">
          <span className="profile-avatar">
            {user.fullName
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')}
          </span>
          <div>
            <b>{user.fullName}</b>
            <small>{user.email}</small>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={15} />
          Sign out
        </button>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <span className="eyebrow">BUSINESS NOTIFICATION CENTER</span>
            <h1>
              Stay informed.
              <em> Stay focused.</em>
            </h1>
            <p>
              Search, filter and action your notifications from one organized workspace.
            </p>
          </div>

          <button
            className="primary-button create-button"
            disabled={busy}
            onClick={() =>
              mutate(api.createDemo, 'New demo notification created.')
            }
          >
            <Plus size={17} />
            Generate notification
          </button>
        </header>

        <section className="stats-grid">
          {cards.map((card, index) => (
            <StatCard key={card.label} {...card} index={index} />
          ))}
        </section>

        <section className="notification-shell">
          <div className="notification-toolbar">
            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notifications..."
              />
            </div>

            <div className="toolbar-actions">
              <select value={type} onChange={(event) => setType(event.target.value)}>
                {typeFilters.map((item) => (
                  <option key={item} value={item}>
                    Type: {item}
                  </option>
                ))}
              </select>

              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                {priorityFilters.map((item) => (
                  <option key={item} value={item}>
                    Priority: {item}
                  </option>
                ))}
              </select>

              <button
                className="secondary-button"
                disabled={busy || stats.unread === 0}
                onClick={() =>
                  mutate(api.markAllRead, 'All notifications marked as read.')
                }
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
            </div>
          </div>

          <div className="status-tabs">
            {statusFilters.map((item) => (
              <button
                key={item.key}
                className={status === item.key ? 'active' : ''}
                onClick={() => setStatus(item.key)}
              >
                {item.label}
                {item.key === 'unread' && stats.unread > 0 && (
                  <span>{stats.unread}</span>
                )}
              </button>
            ))}
          </div>

          {loading && (
            <div className="state-panel">
              <LoaderCircle className="spin" size={25} />
              Loading notifications...
            </div>
          )}

          {!loading && error && (
            <div className="state-panel error">{error}</div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="empty-state">
              <div><Bell size={27} /></div>
              <h3>No notifications found</h3>
              <p>Try another filter or generate a new demo notification.</p>
            </div>
          )}

          {!loading && !error && notifications.length > 0 && (
            <div className="notification-list">
              {notifications.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onRead={(id) =>
                    mutate(
                      () => api.markRead(id),
                      'Notification marked as read.'
                    )
                  }
                  onDelete={(id) =>
                    mutate(
                      () => api.remove(id),
                      'Notification deleted.'
                    )
                  }
                />
              ))}
            </div>
          )}

          <footer className="notification-footer">
            <span>
              Showing {notifications.length} notification
              {notifications.length === 1 ? '' : 's'}
            </span>

            <span>
              <Trash2 size={13} />
              Deleted items are removed permanently
            </span>
          </footer>
        </section>
      </main>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
