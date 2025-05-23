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

      // Get user's membership info for this project
      const { data: membershipData, error: membershipError } = await supabase
        .from('project_member')
        .select('user_id, role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membershipData) {
        throw new Error('Project not found or access denied');
      }

      // Get project details separately
      const { data: projectData, error: projectError } = await supabase
        .from('project')
        .select('id, name, description, created_at, updated_at')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        throw new Error(`Failed to fetch project: ${projectError?.message || 'Project not found'}`);
      }
      
      return {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        created_at: projectData.created_at,
        updated_at: projectData.updated_at,
        user_role: membershipData.role,
        user_id: membershipData.user_id,
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
      // Get basic task data first
      const { data: tasks, error: tasksError } = await supabase
        .from('task')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (tasksError) {
        throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
      }

      if (!tasks || tasks.length === 0) {
        // Return empty groups if no tasks
        return {
          in_progress: [],
          up_next: [],
          backlog: [],
          completed: [],
        };
      }

      // Get assignee info for tasks that have assignees
      const assigneeIds = tasks
        .map(task => task.assignee_id)
        .filter(Boolean);

      let assigneeMap: Record<string, any> = {};
      
      if (assigneeIds.length > 0) {
        const { data: assignees } = await supabase
          .from('auth_user')
          .select('id, full_name, email')
          .in('id', assigneeIds);
        
        if (assignees) {
          assigneeMap = assignees.reduce((acc, assignee) => {
            acc[assignee.id] = assignee;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Get comments count for each task
      const taskIds = tasks.map(task => task.id);
      let commentsMap: Record<string, number> = {};
      
      if (taskIds.length > 0) {
        const { data: comments } = await supabase
          .from('task_comment')
          .select('task_id')
          .in('task_id', taskIds);
        
        if (comments) {
          commentsMap = comments.reduce((acc, comment) => {
            acc[comment.task_id] = (acc[comment.task_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }
      }

      // Get pending updates for each task
      let updatesMap: Record<string, boolean> = {};
      
      if (taskIds.length > 0) {
        const { data: updates } = await supabase
          .from('task_update')
          .select('task_id, is_approved')
          .in('task_id', taskIds)
          .is('is_approved', null);
        
        if (updates) {
          updatesMap = updates.reduce((acc, update) => {
            acc[update.task_id] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }

      // Process tasks and add related data
      const tasksWithDetails: TaskWithDetails[] = tasks.map(task => ({
        ...task,
        assignee: task.assignee_id ? assigneeMap[task.assignee_id] || null : null,
        comments_count: commentsMap[task.id] || 0,
        has_pending_update: updatesMap[task.id] || false,
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