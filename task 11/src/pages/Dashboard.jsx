import Counter from "../components/Counter";
import Users from "../components/Users";

function Dashboard() {
  return (
    <div>
      <h1 className="dashboard-title">Dashboard</h1>
      <Counter />
      <Users />
    </div>
  );
}

export default Dashboard;