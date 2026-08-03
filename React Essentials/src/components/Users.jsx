import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <section className="users">
      <h2>Users from JSONPlaceholder API</h2>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong>
            <br />
            {user.email}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Users;