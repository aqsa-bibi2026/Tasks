import React, {
  useState
} from 'react';

import {
  LoaderCircle,
  Plus,
  X
} from 'lucide-react';

export default function CreateModal({
  onClose,
  onCreate
}) {
  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState({
      title: '',
      ownerName: '',
      priority: 'Medium',
      status: 'Backlog',
      dueDate: '',
      description: ''
    });

  const update = (key, value) =>
    setForm((state) => ({
      ...state,
      [key]: value
    }));

  const submit = async (event) => {
    event.preventDefault();

    setSaving(true);
    const ok = await onCreate(form);
    setSaving(false);

    if (ok) {
      setForm({
        title: '',
        ownerName: '',
        priority: 'Medium',
        status: 'Backlog',
        dueDate: '',
        description: ''
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <small>NEW WORK ITEM</small>
            <h2>Create task</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            <span>Title</span>
            <input
              value={form.title}
              onChange={(event) =>
                update(
                  'title',
                  event.target.value
                )
              }
              placeholder="e.g. Customer export"
              required
            />
          </label>

          <div className="two-col">
            <label>
              <span>Owner</span>
              <input
                value={form.ownerName}
                onChange={(event) =>
                  update(
                    'ownerName',
                    event.target.value
                  )
                }
                placeholder="Owner name"
                required
              />
            </label>

            <label>
              <span>Priority</span>
              <select
                value={form.priority}
                onChange={(event) =>
                  update(
                    'priority',
                    event.target.value
                  )
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>
          </div>

          <div className="two-col">
            <label>
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  update(
                    'status',
                    event.target.value
                  )
                }
              >
                <option>Backlog</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Done</option>
              </select>
            </label>

            <label>
              <span>Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  update(
                    'dueDate',
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <label>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                update(
                  'description',
                  event.target.value
                )
              }
              placeholder="Short task summary..."
            />
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <LoaderCircle
                  className="spin"
                  size={16}
                />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create work item
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
