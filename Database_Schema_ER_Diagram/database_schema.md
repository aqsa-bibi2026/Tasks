# Database Schema Design

## profiles
- id UUID PK
- full_name TEXT NOT NULL
- email TEXT UNIQUE NOT NULL
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ

## projects
- id UUID PK
- owner_id UUID FK -> profiles.id
- name TEXT NOT NULL
- description TEXT
- status TEXT
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ

## project_members
- project_id UUID PK/FK -> projects.id
- user_id UUID PK/FK -> profiles.id
- role TEXT
- joined_at TIMESTAMPTZ

## tasks
- id UUID PK
- project_id UUID FK -> projects.id
- assigned_to UUID FK -> profiles.id
- title TEXT NOT NULL
- description TEXT
- status TEXT
- priority TEXT
- due_date TIMESTAMPTZ
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ

## Cardinality
- profiles 1:N projects
- profiles N:M projects through project_members
- projects 1:N tasks
- profiles 1:N tasks
