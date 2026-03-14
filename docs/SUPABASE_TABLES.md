# Supabase tables used by Lockeroom PM Dashboard

All PM tables live in the **public** schema with a `pm_` prefix. Staff data comes from the existing **staff_database** table (shared with gym ops).

| Table | Purpose |
|-------|--------|
| **staff_database** | Existing Lockeroom staff table (first_name, last_name, role, staff_status, rgb_colour, home_gym). Used for project/task ownership and People page. **Not owned by PM** — shared. |
| **pm_dashes** | Two-week dash cycles: dash_number, start_date, end_date, status. Drives the dash banner and "This dash" view. |
| **pm_projects** | Projects: name, owner_id (→ staff_database), team, team_color, status, start_date, target_end_date. |
| **pm_sub_projects** | Sub-projects under a project. Used in task labels and Gantt. |
| **pm_tasks** | Tasks: project_id, sub_project_id, dash_id, title, owner_id (→ staff_database), status, priority, due_date. |
| **pm_task_collaborators** | Many-to-many: pm_tasks ↔ staff_database. Defined; not yet used in UI. |
| **pm_time_entries** | Logged time per task/staff. Defined; not yet used in UI. |
