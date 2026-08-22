import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Bell,
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  CircleAlert,
  MoreHorizontal,
  CalendarDays,
  Trash2,
  X,
  LogOut,
  Menu,
} from "lucide-react";

import { supabase } from "./lib/supabase";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [search, setSearch] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });

  useEffect(() => {
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBoard) {
      loadBoardData(selectedBoard.id);
    }
  }, [selectedBoard]);

  async function getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user ?? null);
    setLoading(false);
  }

  async function loadBoards() {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Load boards error:", error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      await createFirstBoard();
      return;
    }

    setBoards(data);
    setSelectedBoard(data[0]);
    setLoading(false);
  }

  async function createFirstBoard() {
    if (!user) return;

    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert({
        user_id: user.id,
        title: "My Project",
        description: "Organize your work and track progress.",
      })
      .select()
      .single();

    if (boardError) {
      console.error("Create board error:", boardError);
      setLoading(false);
      return;
    }

    const { data: createdLists, error: listError } = await supabase
      .from("lists")
      .insert([
        {
          board_id: board.id,
          title: "To Do",
          position: 0,
        },
        {
          board_id: board.id,
          title: "In Progress",
          position: 1,
        },
        {
          board_id: board.id,
          title: "Done",
          position: 2,
        },
      ])
      .select();

    if (listError) {
      console.error("Create lists error:", listError);
    }

    setBoards([board]);
    setSelectedBoard(board);
    setLists(createdLists || []);
    setTasks([]);
    setLoading(false);
  }

  async function loadBoardData(boardId) {
    if (!boardId) return;

    setLoading(true);

    const { data: boardLists, error: listError } = await supabase
      .from("lists")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true });

    if (listError) {
      console.error("Load lists error:", listError);
      setLists([]);
      setTasks([]);
      setLoading(false);
      return;
    }

    let finalLists = boardLists || [];

    if (finalLists.length === 0) {
      const { data: newLists, error: createListError } = await supabase
        .from("lists")
        .insert([
          {
            board_id: boardId,
            title: "To Do",
            position: 0,
          },
          {
            board_id: boardId,
            title: "In Progress",
            position: 1,
          },
          {
            board_id: boardId,
            title: "Done",
            position: 2,
          },
        ])
        .select();

      if (createListError) {
        console.error("Create lists error:", createListError);
        setLists([]);
        setTasks([]);
        setLoading(false);
        return;
      }

      finalLists = newLists || [];
    }

    setLists(finalLists);

    if (finalLists.length === 0) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const listIds = finalLists.map((list) => list.id);

    const { data: boardTasks, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .in("list_id", listIds)
      .order("position", { ascending: true });

    if (taskError) {
      console.error("Load tasks error:", taskError);
      setTasks([]);
    } else {
      setTasks(boardTasks || []);
    }

    setLoading(false);
  }

  async function createBoard() {
    const title = window.prompt("Enter board name");

    if (!title?.trim()) return;

    const { data, error } = await supabase
      .from("boards")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: "Kanban project",
      })
      .select()
      .single();

    if (error) {
      console.error("Create board error:", error);
      alert(error.message);
      return;
    }

    const { error: listError } = await supabase
      .from("lists")
      .insert([
        {
          board_id: data.id,
          title: "To Do",
          position: 0,
        },
        {
          board_id: data.id,
          title: "In Progress",
          position: 1,
        },
        {
          board_id: data.id,
          title: "Done",
          position: 2,
        },
      ]);

    if (listError) {
      console.error("Create lists error:", listError);
    }

    setBoards((prev) => [...prev, data]);
    setSelectedBoard(data);
  }

  function openTaskModal(list) {
    setSelectedList(list);

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
    });

    setShowModal(true);
  }

  async function createTask(event) {
    event.preventDefault();

    if (!newTask.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!selectedList) {
      alert("Please select a list.");
      return;
    }

    const listTasks = tasks.filter(
      (task) => task.list_id === selectedList.id
    );

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        list_id: selectedList.id,
        user_id: user.id,
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        position: listTasks.length,
        completed: selectedList.title === "Done",
      })
      .select()
      .single();

    if (error) {
      console.error("Create task error:", error);
      alert(error.message);
      return;
    }

    setTasks((prev) => [...prev, data]);
    setShowModal(false);

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
    });
  }

  async function deleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Delete task error:", error);
      alert(error.message);
      return;
    }

    setTasks((prev) =>
      prev.filter((task) => task.id !== taskId)
    );
  }

  async function toggleTask(task) {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        completed: !task.completed,
      })
      .eq("id", task.id)
      .select()
      .single();

    if (error) {
      console.error("Update task error:", error);
      alert(error.message);
      return;
    }

    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? data : item
      )
    );
  }

  async function moveTask(task, targetList) {
    if (task.list_id === targetList.id) return;

    const targetTasks = tasks.filter(
      (item) => item.list_id === targetList.id
    );

    const { data, error } = await supabase
      .from("tasks")
      .update({
        list_id: targetList.id,
        position: targetTasks.length,
        completed: targetList.title === "Done",
      })
      .eq("id", task.id)
      .select()
      .single();

    if (error) {
      console.error("Move task error:", error);
      alert(error.message);
      return;
    }

    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? data : item
      )
    );
  }

  async function signOut() {
    await supabase.auth.signOut();

    setUser(null);
    setBoards([]);
    setSelectedBoard(null);
    setLists([]);
    setTasks([]);
  }

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "high"
  ).length;

  const getListTasks = (listId) =>
    filteredTasks.filter(
      (task) => task.list_id === listId
    );

  if (!user) {
    return (
      <LoginScreen />
    );
  }

  return (
    <div className="app-shell">

      <aside
        className={`sidebar ${
          showSidebar ? "show" : ""
        }`}
      >

        <div className="brand">
          <div className="brand-icon">
            <LayoutDashboard size={22} />
          </div>

          <div>
            <h2>TaskFlow</h2>
            <span>Workspace</span>
          </div>
        </div>

        <div className="sidebar-section">

          <p className="section-label">
            Workspace
          </p>

          <button className="nav-item active">
            <LayoutDashboard size={18} />
            Overview
          </button>

        </div>

        <div className="sidebar-section">

          <div className="section-heading">

            <p className="section-label">
              My Boards
            </p>

            <button
              className="small-add"
              onClick={createBoard}
            >
              <Plus size={16} />
            </button>

          </div>

          {boards.map((board) => (
            <button
              key={board.id}
              className={`board-item ${
                selectedBoard?.id === board.id
                  ? "selected"
                  : ""
              }`}
              onClick={() => {
                setSelectedBoard(board);
                setShowSidebar(false);
              }}
            >
              <span className="board-dot"></span>
              {board.title}
            </button>
          ))}

        </div>

        <div className="sidebar-bottom">

          <div className="user-mini">

            <div className="avatar">
              {user.email
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-info">
              <strong>User</strong>
              <span>{user.email}</span>
            </div>

          </div>

          <button
            className="logout-btn"
            onClick={signOut}
          >
            <LogOut size={17} />
            Sign out
          </button>

        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() =>
              setShowSidebar(!showSidebar)
            }
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>
              {selectedBoard?.title || "Board"}
            </strong>
          </div>

          <div className="topbar-actions">

            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <button className="icon-btn">
              <Bell size={19} />
              <span className="notification-dot"></span>
            </button>

            <div className="top-avatar">
              {user.email
                ?.charAt(0)
                .toUpperCase()}
            </div>

          </div>

        </header>

        <section className="page-content">

          <div className="page-heading">

            <div>
              <p className="eyebrow">
                PROJECT BOARD
              </p>

              <h1>
                {selectedBoard?.title ||
                  "My Project"}
              </h1>

              <p className="subtitle">
                Organize your work, track progress
                and get things done.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => {
                if (lists.length > 0) {
                  openTaskModal(lists[0]);
                } else if (selectedBoard) {
                  loadBoardData(
                    selectedBoard.id
                  );
                }
              }}
            >
              <Plus size={18} />
              Add Task
            </button>

          </div>

          <div className="stats-grid">

            <StatCard
              icon={<LayoutDashboard size={20} />}
              label="Total Tasks"
              value={totalTasks}
            />

            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Completed"
              value={completedTasks}
            />

            <StatCard
              icon={<Clock3 size={20} />}
              label="In Progress"
              value={inProgressTasks}
            />

            <StatCard
              icon={<CircleAlert size={20} />}
              label="High Priority"
              value={highPriorityTasks}
            />

          </div>

          <div className="board-toolbar">

            <div>
              <h2>Project Tasks</h2>
              <span>
                {totalTasks} tasks in this board
              </span>
            </div>

            <span>All tasks</span>

          </div>

          {loading ? (
            <div className="board-loading">
              Loading...
            </div>
          ) : lists.length === 0 ? (
            <div className="empty-board">

              <LayoutDashboard size={40} />

              <h3>No lists found</h3>

              <p>
                Click Add Task to create your
                default lists.
              </p>

            </div>
          ) : (
            <div className="kanban-board">

              {lists.map((list) => (
                <KanbanColumn
                  key={list.id}
                  list={list}
                  tasks={getListTasks(list.id)}
                  lists={lists}
                  onAddTask={openTaskModal}
                  onDelete={deleteTask}
                  onToggle={toggleTask}
                  onMove={moveTask}
                />
              ))}

            </div>
          )}

        </section>

      </main>

      {showModal && (
        <TaskModal
          list={selectedList}
          task={newTask}
          setTask={setNewTask}
          onClose={() =>
            setShowModal(false)
          }
          onSubmit={createTask}
        />
      )}

    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}

function KanbanColumn({
  list,
  tasks,
  lists,
  onAddTask,
  onDelete,
  onToggle,
  onMove,
}) {
  return (
    <section className="kanban-column">

      <div className="column-header">

        <div className="column-title">

          <span className="status-dot"></span>

          <h3>{list.title}</h3>

          <span className="task-count">
            {tasks.length}
          </span>

        </div>

        <button
          className="column-add"
          onClick={() =>
            onAddTask(list)
          }
        >
          <Plus size={18} />
        </button>

      </div>

      <div className="task-list">

        {tasks.length === 0 ? (

          <div className="empty-column">

            <div className="empty-icon">
              <Plus size={18} />
            </div>

            <span>No tasks yet</span>

            <button
              onClick={() =>
                onAddTask(list)
              }
            >
              Add task
            </button>

          </div>

        ) : (

          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              lists={lists}
              onDelete={onDelete}
              onToggle={onToggle}
              onMove={onMove}
            />
          ))

        )}

      </div>

    </section>
  );
}

function TaskCard({
  task,
  lists,
  onDelete,
  onToggle,
  onMove,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  return (
    <article className="task-card">

      <div className="task-top">

        <span
          className={`priority ${task.priority}`}
        >
          {task.priority}
        </span>

        <div className="task-menu">

          <button
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (

            <div className="task-dropdown">

              {lists
                .filter(
                  (list) =>
                    list.id !== task.list_id
                )
                .map((list) => (
                  <button
                    key={list.id}
                    onClick={() => {
                      onMove(task, list);
                      setMenuOpen(false);
                    }}
                  >
                    Move to {list.title}
                  </button>
                ))}

              <button
                className="delete-option"
                onClick={() => {
                  onDelete(task.id);
                  setMenuOpen(false);
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>

            </div>

          )}

        </div>

      </div>

      <h4
        className={
          task.completed
            ? "line-through"
            : ""
        }
      >
        {task.title}
      </h4>

      {task.description && (
        <p className="task-description">
          {task.description}
        </p>
      )}

      <div className="task-footer">

        <button
          className={`complete-btn ${
            task.completed
              ? "checked"
              : ""
          }`}
          onClick={() =>
            onToggle(task)
          }
        >
          <CheckCircle2 size={16} />

          {task.completed
            ? "Completed"
            : "Mark done"}
        </button>

        {task.due_date && (
          <span className="due-date">
            <CalendarDays size={14} />

            {new Date(
              task.due_date
            ).toLocaleDateString()}
          </span>
        )}

      </div>

    </article>
  );
}

function TaskModal({
  list,
  task,
  setTask,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>

            <p className="eyebrow">
              NEW TASK
            </p>

            <h2>
              Add task to {list?.title}
            </h2>

          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>

        <form onSubmit={onSubmit}>

          <label>
            Task title

            <input
              autoFocus
              required
              type="text"
              value={task.title}
              onChange={(event) =>
                setTask({
                  ...task,
                  title:
                    event.target.value,
                })
              }
              placeholder="Build homepage"
            />
          </label>

          <label>
            Description

            <textarea
              rows="4"
              value={task.description}
              onChange={(event) =>
                setTask({
                  ...task,
                  description:
                    event.target.value,
                })
              }
              placeholder="Describe your task..."
            />
          </label>

          <div className="form-row">

            <label>
              Priority

              <select
                value={task.priority}
                onChange={(event) =>
                  setTask({
                    ...task,
                    priority:
                      event.target.value,
                  })
                }
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </label>

            <label>
              Due date

              <input
                type="date"
                value={task.due_date}
                onChange={(event) =>
                  setTask({
                    ...task,
                    due_date:
                      event.target.value,
                  })
                }
              />
            </label>

          </div>

          <div className="modal-actions">

            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
            >
              <Plus size={18} />
              Create Task
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loginLoading, setLoginLoading] =
    useState(false);

  async function login(event) {
    event.preventDefault();

    setLoginLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
    }

    setLoginLoading(false);
  }

  return (
    <div className="login-screen">

      <div className="login-card">

        <div className="login-brand">

          <div className="brand-icon">
            <LayoutDashboard size={24} />
          </div>

          <h1>TaskFlow</h1>

          <p>
            Manage your work beautifully.
          </p>

        </div>

        <form onSubmit={login}>

          <label>
            Email

            <input
              type="email"
              required
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password

            <input
              type="password"
              required
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="primary-btn login-btn"
            disabled={loginLoading}
          >
            {loginLoading
              ? "Signing in..."
              : "Sign in"}
          </button>

        </form>

        <p className="login-note">
          Use your Supabase Auth account to
          access the workspace.
        </p>

      </div>

    </div>
  );
}

export default App;