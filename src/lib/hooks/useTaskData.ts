import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface TaskWithProject {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'Backlog' | 'Up Next' | 'In Progress' | 'Approved' | 'Closed';
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
  project?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

/**
 * Fetch individual task data with project info
 */
export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async (): Promise<TaskWithProject> => {
      console.log('🔍 [useTask] Starting task fetch for:', taskId);
      
      // Check auth state
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔍 [useTask] Auth check:', {
        hasUser: !!user,
        authError,
        userId: user?.id,
        userEmail: user?.email
      });

      if (authError || !user) {
        console.error('❌ [useTask] Authentication failed:', { authError, user });
        throw new Error('Authentication required');
      }

      // Get task data with project info
      console.log('🔍 [useTask] Querying task for:', taskId);
      const { data: task, error: taskError } = await supabase
        .from('task')
        .select(`
          *,
          project:project_id (
            id,
            name,
            description
          )
        `)
        .eq('id', taskId)
        .single();

      console.log('🔍 [useTask] Task query result:', {
        taskData: task,
        taskError,
        hasData: !!task
      });

      if (taskError) {
        console.error('❌ [useTask] Task fetch failed:', taskError);
        throw new Error(`Failed to fetch task: ${taskError.message}`);
      }

      if (!task) {
        throw new Error('Task not found');
      }

      // Verify user has access to this project
      const { data: membership, error: membershipError } = await supabase
        .from('project_member')
        .select('role')
        .eq('project_id', task.project_id)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        console.error('❌ [useTask] Project access denied:', { membershipError, membership });
        throw new Error('Access denied to this task');
      }

      // Get assignee info if exists
      let assignee = null;
      if (task.assignee_id) {
        const { data: assigneeData } = await supabase
          .from('auth.users')
          .select('id, raw_user_meta_data, email')
          .eq('id', task.assignee_id)
          .single();
        
        if (assigneeData) {
          assignee = {
            id: assigneeData.id,
            full_name: assigneeData.raw_user_meta_data?.full_name || null,
            email: assigneeData.email
          };
        }
      }

      // Get comments count
      const { data: comments } = await supabase
        .from('task_comment')
        .select('id')
        .eq('task_id', taskId);

      // Get pending updates
      const { data: updates } = await supabase
        .from('task_update')
        .select('id')
        .eq('task_id', taskId)
        .eq('status', 'waiting');

      const result: TaskWithProject = {
        ...task,
        assignee,
        comments_count: comments?.length || 0,
        has_pending_update: (updates?.length || 0) > 0,
      };

      console.log('✅ [useTask] Successfully fetched task:', result);
      return result;
    },
    enabled: !!taskId,
  });
}

// Re-export existing hooks for convenience
export { useProjectTasks } from './useProjectData'; 