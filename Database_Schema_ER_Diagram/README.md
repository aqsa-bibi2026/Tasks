# Task 7 — Design Database Schema with ER Diagram

This package completes only Task 7.

Included:
- ER_DIAGRAM.png
- ER_DIAGRAM.md
- database_schema.md
- task7_schema.dbml
- schema_reference.sql

Main entities:
- profiles
- projects
- project_members
- tasks

Relationships:
- profiles 1:N projects
- profiles N:M projects through project_members
- projects 1:N tasks
- profiles 1:N tasks through assigned_to
