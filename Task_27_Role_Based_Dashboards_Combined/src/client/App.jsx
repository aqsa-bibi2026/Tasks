import React, {
  useEffect,
  useState
} from 'react';

import {
  LoaderCircle
} from 'lucide-react';

import { getMe } from './api.js';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';

export default function App() {
  const [user, setUser] =
    useState(null);

  const [checking, setChecking] =
    useState(true);

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <div className="boot-screen">
        <LoaderCircle
          className="spin"
          size={27}
        />
        Checking secure session...
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        onSuccess={setUser}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLoggedOut={() =>
        setUser(null)
      }
    />
  );
}
