import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [name, setName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const [projectRes, logRes] = await Promise.all([
      fetch(`${API}/projects`),
      fetch(`${API}/audit-logs`)
    ]);

    setProjects(await projectRes.json());
    setLogs(await logRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function addProject(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    setName('');
    await load();
    setLoading(false);
  }

  async function toggleStatus(project) {
    const status = project.status === 'completed' ? 'active' : 'completed';

    await fetch(`${API}/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    await load();
  }

  async function addTask(e) {
    e.preventDefault();
    if (!selectedProject || !taskTitle.trim()) return;

    setLoading(true);

    await fetch(`${API}/projects/${selectedProject}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: taskTitle })
    });

    setTaskTitle('');
    await load();
    setLoading(false);
  }

  return (
    <main className="shell">
      <section className="hero">
        <span className="badge">FULL STACK DATABASE AUTOMATION</span>
        <h1>Task 9 — Supabase Triggers</h1>
        <p>
          Create projects and tasks from React. Supabase triggers automatically
          update timestamps, task counts and audit logs.
        </p>
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Create Project</h2>
          <form onSubmit={addProject} className="form">
            <input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button disabled={loading}>Create Project</button>
          </form>

          <h2 className="spaced">Add Task</h2>
          <form onSubmit={addTask} className="form">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />

            <button disabled={loading}>Add Task</button>
          </form>
        </div>

        <div className="panel">
          <h2>Projects</h2>
          <div className="cards">
            {projects.map((project) => (
              <article className="card" key={project.id}>
                <div>
                  <h3>{project.name}</h3>
                  <p>Status: <strong>{project.status}</strong></p>
                  <p>Automatic task count: <strong>{project.task_count}</strong></p>
                  <small>
                    Updated: {new Date(project.updated_at).toLocaleString()}
                  </small>
                </div>

                <button className="secondary" onClick={() => toggleStatus(project)}>
                  Change Status
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel audit">
        <div className="auditHeader">
          <div>
            <span className="badge">AUTOMATIC TRIGGER OUTPUT</span>
            <h2>Audit Logs</h2>
          </div>
          <button className="secondary" onClick={load}>Refresh</button>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Table</th>
                <th>Record</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td><span className={`action ${log.action.toLowerCase()}`}>{log.action}</span></td>
                  <td>{log.table_name}</td>
                  <td>{log.record_id?.slice(0, 8)}...</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
