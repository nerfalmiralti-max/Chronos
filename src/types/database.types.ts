export type Profile = { id: string; display_name: string | null; avatar_url: string | null; timezone: string; locale: string; onboarding_completed: boolean; created_at: string; updated_at: string };
export type Goal = { id: string; user_id: string; title: string; target_value: number; current_value: number; unit: string; due_date: string | null; status: 'active' | 'completed' | 'paused'; created_at: string; updated_at: string };
export type Task = { id: string; user_id: string; goal_id: string | null; title: string; scheduled_at: string | null; duration_minutes: number; completed_at: string | null; category: string | null; created_at: string; updated_at: string };
export type FocusSession = { id: string; user_id: string; task_id: string | null; started_at: string; ended_at: string | null; duration_seconds: number; created_at: string };

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile>; Relationships: [] };
      goals: { Row: Goal; Insert: Partial<Goal> & { user_id: string; title: string }; Update: Partial<Goal>; Relationships: [] };
      tasks: { Row: Task; Insert: Partial<Task> & { user_id: string; title: string }; Update: Partial<Task>; Relationships: [] };
      focus_sessions: { Row: FocusSession; Insert: Partial<FocusSession> & { user_id: string; started_at: string }; Update: Partial<FocusSession>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
