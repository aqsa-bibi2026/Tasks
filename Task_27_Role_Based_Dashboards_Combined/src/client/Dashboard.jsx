import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Activity,
  BarChart3,
  Blocks,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  Sparkles,
  UsersRound
} from 'lucide-react';

import {
  fetchAdminUsers,
  fetchDashboard,
  fetchManagerTeam,
  logout
} from './api.js';

import MetricCard from './components/MetricCard.jsx';
import TaskTable from './components/TaskTable.jsx';
import UserDirectory from './components/UserDirectory.jsx';

const icons = [
  UsersRound,
  Activity,
  ClipboardList,
  CheckCircle2
];

const roleCopy = {
  admin: {
    eyebrow:
      'ADMIN CONTROL CENTER',
    title:
      'Organization overview',
    description:
      'Full visibility across users, roles and protected system metrics.'
  },
  manager: {
    eyebrow:
      'MANAGER WORKSPACE',
    title:
      'Lead your team',
    description:
      'Monitor Product department workload, priorities and delivery.'
  },
  member: {
    eyebrow:
      'MEMBER WORKSPACE',
    title:
      'Your focused dashboard',
    description:
      'A personal view of assigned work with no administrative access.'
  }
};

export default function Dashboard({
  user,
  onLoggedOut
}) {
  const [dashboard, setDashboard] =
    useState(null);

  const [adminUsers, setAdminUsers] =
    useState([]);

  const [teamTasks, setTeamTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const copy = roleCopy[user.role];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const data =
          await fetchDashboard();

        setDashboard(data);

        if (user.role === 'admin') {
          const usersData =
            await fetchAdminUsers();

          setAdminUsers(
            usersData.users
          );
        }

        if (
          user.role === 'manager'
        ) {
          const teamData =
            await fetchManagerTeam();

          setTeamTasks(
            teamData.tasks
          );
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user.role]);

  const tasks = useMemo(() => {
    if (user.role === 'manager') {
      return teamTasks;
    }

    return dashboard?.tasks || [];
  }, [
    dashboard,
    teamTasks,
    user.role
  ]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      onLoggedOut();
    }
  };

  return (
    <div className="dashboard-page">
      <Background />

      <aside className="dashboard-sidebar">
        <div className="brand">
          <span>
            <ShieldCheck size={22} />
          </span>

          <div>
            <b>RoleSphere</b>
            <small>
              Access Intelligence
            </small>
          </div>
        </div>

        <nav>
          <button className="active">
            <LayoutDashboard size={17} />
            Dashboard
          </button>

          {user.role !==
            'member' && (
            <button disabled>
              <BarChart3 size={17} />
              Analytics
            </button>
          )}

          {user.role ===
            'admin' && (
            <button disabled>
              <UsersRound size={17} />
              Users
            </button>
          )}

          <button disabled>
            <Activity size={17} />
            Activity
          </button>
        </nav>

        <div className="role-card">
          <div className="role-avatar">
            {user.fullName
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')}
          </div>

          <div>
            <b>{user.fullName}</b>
            <small>
              {user.email}
            </small>

            <span>
              {user.role}
              {' · '}
              {user.department}
            </span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </aside>

      <main className="dashboard-workspace">
        <header>
          <div>
            <small className="eyebrow">
              {copy.eyebrow}
            </small>

            <h1>
              {copy.title}
              <em>.</em>
            </h1>

            <p>
              {copy.description}
            </p>
          </div>

          <span
            className={`role-pill ${user.role}`}
          >
            <ShieldCheck size={14} />
            {user.role} access
          </span>
        </header>

        {loading && (
          <div className="state-panel">
            <LoaderCircle
              className="spin"
              size={25}
            />
            Loading authorized dashboard...
          </div>
        )}

        {!loading && error && (
          <div className="state-panel error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          dashboard && (
          <>
            <section className="metrics">
              {dashboard.metrics.map(
                (metric, index) => {
                  const Icon =
                    icons[index] ||
                    Blocks;

                  return (
                    <MetricCard
                      key={metric.label}
                      metric={metric}
                      icon={Icon}
                      index={index}
                    />
                  );
                }
              )}
            </section>

            <section className="access-banner">
              <Sparkles size={18} />

              <div>
                <b>
                  Role-aware rendering active
                </b>

                <p>
                  The backend authorized
                  this dashboard using your
                  JWT role before returning
                  protected data.
                </p>
              </div>
            </section>

            {user.role ===
              'admin' && (
              <UserDirectory
                users={adminUsers}
              />
            )}

            {user.role !==
              'admin' && (
              <TaskTable
                tasks={tasks}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Background() {
  return (
    <>
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="background-grid" />
    </>
  );
}
