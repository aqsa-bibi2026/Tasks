import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./index.css";

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    }

    fetchOrders();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("live-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((current) => [payload.new, ...current]);
          }

          if (payload.eventType === "UPDATE") {
            setOrders((current) =>
              current.map((order) =>
                order.id === payload.new.id ? payload.new : order
              )
            );
          }

          if (payload.eventType === "DELETE") {
            setOrders((current) =>
              current.filter((order) => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pending = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const processing = orders.filter(
    (order) => order.status === "Processing"
  ).length;

  const completed = orders.filter(
    (order) => order.status === "Completed"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">O</div>
          <div>
            <h2>OrderFlow</h2>
            <span>Management System</span>
          </div>
        </div>

        <nav>
          <div className="nav-item active">
            <span>▣</span>
            Dashboard
          </div>

          <div className="nav-item">
            <span>▤</span>
            Orders
          </div>

          <div className="nav-item">
            <span>◉</span>
            Customers
          </div>

          <div className="nav-item">
            <span>◫</span>
            Analytics
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-box">
            <div className="avatar">A</div>
            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Live Order Dashboard</h1>
            <p className="subtitle">
              Monitor and manage your orders in real-time.
            </p>
          </div>

          <div className="live-status">
            <span className="pulse"></span>
            Realtime Connected
          </div>
        </header>

        <section className="stats">
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon="◈"
          />

          <StatCard
            title="Pending Orders"
            value={pending}
            icon="◷"
          />

          <StatCard
            title="Processing"
            value={processing}
            icon="↻"
          />

          <StatCard
            title="Completed"
            value={completed}
            icon="✓"
          />
        </section>

        <section className="orders-card">
          <div className="orders-header">
            <div>
              <h2>Recent Orders</h2>
              <p>Live updates from Supabase</p>
            </div>

            <button className="refresh-btn">
              ↻ Live
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>PRODUCT</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>

                      <td>
                        <div className="customer">
                          <div className="customer-avatar">
                            {order.customer_name.charAt(0)}
                          </div>
                          <span>{order.customer_name}</span>
                        </div>
                      </td>

                      <td>{order.product_name}</td>

                      <td className="amount">
                        Rs. {Number(order.amount).toLocaleString()}
                      </td>

                      <td>
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="date">
                        {new Date(
                          order.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>

      <h2>{value}</h2>

      <div className="stat-footer">
        <span className="positive">↑ Live</span>
        <span>updated now</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const className = status.toLowerCase();

  return (
    <span className={`status ${className}`}>
      <span></span>
      {status}
    </span>
  );
}

export default App;