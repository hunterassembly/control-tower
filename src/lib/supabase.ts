import { createClient } from '@supabase/supabase-js';

// Local development configuration
// In production, these would come from environment variables
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (these would normally be generated)
export interface Database {
  public: {
    Tables: {
      project: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      project_member: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: 'admin' | 'designer';
          created_at: string;
        };
      };
      task: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: 'backlog' | 'up_next' | 'in_progress' | 'completed';
          assignee_id: string | null;
          created_at: string;
          updated_at: string;
          position: number;
        };
      };
      task_comment: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
      };
      task_update: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          content: string;
          is_approved: boolean | null;
          created_at: string;
        };
      };
      auth_user: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        };
      };
    };
  };
} 