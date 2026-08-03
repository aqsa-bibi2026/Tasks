import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import UsersTable from "./pages/UsersTable";

import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartProvider";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <nav className="navbar">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/users">Users</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/cart" element={<Cart />} />
          <Route path="/users" element={<UsersTable />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;