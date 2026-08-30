import React from 'react';

import {
  ShieldCheck,
  UsersRound
} from 'lucide-react';

export default function UserDirectory({
  users = []
}) {
  return (
    <section className="directory-card">
      <div className="table-head">
        <div>
          <small>ADMIN ONLY</small>
          <h2>User directory</h2>
        </div>

        <UsersRound size={19} />
      </div>

      <div className="user-grid">
        {users.map((user) => (
          <article key={user.id}>
            <div className="user-avatar">
              {user.full_name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div>
              <b>{user.full_name}</b>
              <small>{user.email}</small>

              <span>
                <ShieldCheck size={12} />
                {user.role}
                {' · '}
                {user.department}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
