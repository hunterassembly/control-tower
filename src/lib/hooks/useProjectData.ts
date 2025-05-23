import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ProjectWithMember {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_role: 'admin' | 'designer';
  user_id: string;
}

export interface TaskWithDetails {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'backlog' | 'up_next' | 'in_progress' | 'completed';
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
  position: number;
  assignee?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
  comments_count: number;
  has_pending_update: boolean;
}

export interface TasksByStatus {
  in_progress: TaskWithDetails[];
  up_next: TaskWithDetails[];
  backlog: TaskWithDetails[];
  completed: TaskWithDetails[];
}

/**
 * Fetch project data with user role-based permissions
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async (): Promise<ProjectWithMember> => {
      // First get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Get project with user's role
      const { data, error } = await supabase
        .from('project_member')
        .select(`
          user_id,
          role,
          project:project_id (
            id,
            name,
            description,
            created_at,
            updated_at
          )
        `)
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch project: ${error.message}`);
      }

      if (!data || !data.project) {
        throw new Error('Project not found or access denied');
      }

      const project = data.project as any; // Type assertion for nested query
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        created_at: project.created_at,
        updated_at: project.updated_at,
        user_role: data.role,
        user_id: data.user_id,
      };
    },
    enabled: !!projectId,
  });
}

/**
 * Fetch tasks grouped by status for a project
 */
export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async (): Promise<TasksByStatus> => {
      // Get tasks with assignee details and comments count
      const { data, error } = await supabase
        .from('task')
        .select(`
          *,
          assignee:assignee_id (
            id,
            full_name,
            email
          ),
          comments:task_comment (count),
          updates:task_update (
            is_approved
          )
        `)
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }

      // Process tasks and group by status
      const tasksWithDetails: TaskWithDetails[] = (data || []).map(task => ({
        ...task,
        assignee: task.assignee,
        comments_count: task.comments?.[0]?.count || 0,
        has_pending_update: task.updates?.some((u: any) => u.is_approved === null) || false,
      }));

      // Group by status
      const grouped: TasksByStatus = {
        in_progress: tasksWithDetails.filter(t => t.status === 'in_progress'),
        up_next: tasksWithDetails.filter(t => t.status === 'up_next'),
        backlog: tasksWithDetails.filter(t => t.status === 'backlog'),
        completed: tasksWithDetails.filter(t => t.status === 'completed'),
      };

      return grouped;
    },
    enabled: !!projectId,
  });
}

/**
 * Get task counts for display
 */
export function useTaskCounts(projectId: string) {
  const { data: tasks } = useProjectTasks(projectId);
  
  if (!tasks) return { active: 0, total: 0 };
  
  const active = tasks.in_progress.length + tasks.up_next.length;
  const total = active + tasks.backlog.length + tasks.completed.length;
  
  return { active, total };
} 