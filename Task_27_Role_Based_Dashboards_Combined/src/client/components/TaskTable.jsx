import React from 'react';

export default function TaskTable({
  tasks = []
}) {
  return (
    <div className="table-card">
      <div className="table-head">
        <div>
          <small>WORKSPACE</small>
          <h2>Work items</h2>
        </div>

        <span>
          {tasks.length} records
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Due</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <b>{task.title}</b>
                  <small>
                    {task.description}
                  </small>
                </td>

                <td>
                  <span
                    className={`priority ${task.priority}`}
                  >
                    {task.priority}
                  </span>
                </td>

                <td>
                  <span
                    className={`status ${task.status}`}
                  >
                    {task.status.replace(
                      '_',
                      ' '
                    )}
                  </span>
                </td>

                <td>
                  {task.assigned_email}
                </td>

                <td>
                  {task.due_date || '—'}
                </td>
              </tr>
            ))}

            {tasks.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="empty-row"
                >
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
