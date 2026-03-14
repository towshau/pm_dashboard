export type StaffStatus = 'active' | 'inactive' | 'onboarding';
export type Team = 'Admin' | 'Maintenance' | 'Leadership' | 'Managers' | 'Subsidiary' | 'Marketing';
export type DashStatus = 'upcoming' | 'active' | 'completed';
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TaskStatus = 'to_do' | 'in_progress' | 'review' | 'blocked' | 'done';
export type Priority = 'high' | 'medium' | 'low';
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string | null;
  role: string | null;
  staff_status: StaffStatus | null;
  home_gym: string | null;
  rgb_colour: string | null;
  lockeroom_email: string | null;
  employment_type: string | null;
}

export interface Dash {
  id: string;
  dash_number: number;
  start_date: string;
  end_date: string;
  status: DashStatus;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  team: Team;
  team_color: string;
  status: ProjectStatus;
  start_date: string | null;
  target_end_date: string | null;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  owner_initials?: string;
  owner_avatar_color?: string;
  tasks_done?: number;
  tasks_total?: number;
}

export interface SubProject {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  target_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  sub_project_id: string | null;
  dash_id: string | null;
  title: string;
  description: string | null;
  owner_id: string | null;
  status: TaskStatus;
  priority: Priority;
  size: Size;
  due_date: string | null;
  time_logged_minutes: number;
  time_estimated_minutes: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  project_name?: string;
  project_team?: Team;
  team_color?: string;
  project_owner_id?: string | null;
  sub_project_name?: string | null;
  owner_name?: string | null;
  owner_initials?: string | null;
  owner_avatar_color?: string | null;
}

export const TEAM_COLORS: Record<Team, string> = {
  Admin: '#7f77dd',
  Maintenance: '#1d9e75',
  Leadership: '#378add',
  Managers: '#d85a30',
  Subsidiary: '#d4537e',
  Marketing: '#ef9f27',
};

export function deriveInitials(first: string, last: string | null): string {
  const f = first.charAt(0).toUpperCase();
  const l = last ? last.charAt(0).toUpperCase() : '';
  return f + l;
}
