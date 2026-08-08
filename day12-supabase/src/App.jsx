import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"
import "./App.css"

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("*")

      if (error) {
        console.error("Supabase Error:", error)
        setError(error.message)
        setLoading(false)
        return
      }

      setUsers(data || [])
      setLoading(false)
    }

    fetchUsers()
  }, [])

  return (
    <div className="app">
      <div className="container">

        <div className="header">
          <h1>User Management</h1>
          <p>Users fetched from Supabase database</p>
        </div>

        {loading && (
          <div className="table-card">
            <p className="loading">Loading users...</p>
          </div>
        )}

        {error && (
          <div className="table-card">
            <p className="error">Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td className="name">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="role">
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}

export default App