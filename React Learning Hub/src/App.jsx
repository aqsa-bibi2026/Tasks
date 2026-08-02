import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <nav className="navbar">

        <Link to="/">Home</Link>

        <Link to="/about">About</Link>

        <Link to="/dashboard">Dashboard</Link>

      </nav>


      <Routes>

        <Route 
          path="/" 
          element={<Home />} 
        />


        <Route 
          path="/about" 
          element={<About />} 
        />


        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>


    </BrowserRouter>
  );
}

export default App;