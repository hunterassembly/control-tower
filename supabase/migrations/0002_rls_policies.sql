-- Enable RLS for all tables
ALTER TABLE public.organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_update ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'organization'
-- For MVP, keeping it simple: authenticated users can view. Modifications might be restricted to superadmin or specific functions.
CREATE POLICY "Allow authenticated users to SELECT organizations" ON public.organization
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Restrict INSERT on organizations" ON public.organization
  FOR INSERT WITH CHECK (false); -- No direct inserts via RLS
CREATE POLICY "Restrict UPDATE on organizations" ON public.organization
  FOR UPDATE USING (false); -- No direct updates via RLS
CREATE POLICY "Restrict DELETE on organizations" ON public.organization
  FOR DELETE USING (false); -- No direct deletes via RLS

-- RLS Policies for 'project'
CREATE POLICY "Allow project members to SELECT their projects" ON public.project
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      WHERE pm.project_id = project.id AND pm.user_id = auth.uid()
    )
  );
-- Project creation is complex for RLS. Assume admins (of an org, or global) handle this, perhaps via a security definer function.
-- For now, let's allow a user who is an 'admin' in ANY project to create a new project. This is a placeholder and might need refinement.
CREATE POLICY "Allow admins to INSERT new projects" ON public.project
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      WHERE pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );
CREATE POLICY "Restrict UPDATE on projects" ON public.project
  FOR UPDATE USING (false); -- Updates via specific functions if needed
CREATE POLICY "Restrict DELETE on projects" ON public.project
  FOR DELETE USING (false); -- Deletes via specific functions if needed

-- RLS Policies for 'project_member'
CREATE POLICY "Allow project members to SELECT members of their own projects" ON public.project_member
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_member pm_viewer
      WHERE pm_viewer.project_id = project_member.project_id AND pm_viewer.user_id = auth.uid()
    )
  );
CREATE POLICY "Allow project admins to INSERT project members" ON public.project_member
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_member pm_admin
      WHERE pm_admin.project_id = project_member.project_id AND pm_admin.user_id = auth.uid() AND pm_admin.role = 'admin'
    )
  );
CREATE POLICY "Allow project admins to UPDATE project member roles" ON public.project_member
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_member pm_admin
      WHERE pm_admin.project_id = project_member.project_id AND pm_admin.user_id = auth.uid() AND pm_admin.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_member pm_admin
      WHERE pm_admin.project_id = project_member.project_id AND pm_admin.user_id = auth.uid() AND pm_admin.role = 'admin'
    )
  );
CREATE POLICY "Allow project admins to DELETE project members (or user to leave)" ON public.project_member
  FOR DELETE USING (
    ( -- Project admin can remove anyone from their project
      EXISTS (
        SELECT 1 FROM public.project_member pm_admin
        WHERE pm_admin.project_id = project_member.project_id AND pm_admin.user_id = auth.uid() AND pm_admin.role = 'admin'
      )
    ) OR ( -- User can remove themselves (leave project)
      project_member.user_id = auth.uid()
    )
  );

-- RLS Policies for 'task'
CREATE POLICY "Allow project members to SELECT tasks in their projects" ON public.task
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      WHERE pm.project_id = task.project_id AND pm.user_id = auth.uid()
    )
  );
CREATE POLICY "Allow project admins/designers to INSERT tasks" ON public.task
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      WHERE pm.project_id = task.project_id AND pm.user_id = auth.uid() AND (pm.role = 'admin' OR pm.role = 'designer')
    )
  );
CREATE POLICY "Allow project members to UPDATE tasks in their projects" ON public.task -- Specific field updates controlled by app logic
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      WHERE pm.project_id = task.project_id AND pm.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      WHERE pm.project_id = task.project_id AND pm.user_id = auth.uid()
    )
  );
-- DELETE tasks policy might be admin/designer only, or soft delete via status. For now, let's restrict direct deletes.
CREATE POLICY "Restrict DELETE on tasks" ON public.task
  FOR DELETE USING (false);


-- RLS Policies for 'task_update'
CREATE POLICY "Allow project members to SELECT task updates" ON public.task_update
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      JOIN public.task t ON t.project_id = pm.project_id
      WHERE t.id = task_update.task_id AND pm.user_id = auth.uid()
    )
  );
CREATE POLICY "Allow project designers/admins to INSERT task updates" ON public.task_update
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      JOIN public.task t ON t.project_id = pm.project_id
      WHERE t.id = task_update.task_id AND pm.user_id = auth.uid() AND (pm.role = 'designer' OR pm.role = 'admin')
    )
  );
CREATE POLICY "Allow relevant project members to UPDATE task updates" ON public.task_update -- e.g. client approves, designer revises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      JOIN public.task t ON t.project_id = pm.project_id
      WHERE t.id = task_update.task_id AND pm.user_id = auth.uid()
    )
  ) WITH CHECK (
     EXISTS (
      SELECT 1 FROM public.project_member pm
      JOIN public.task t ON t.project_id = pm.project_id
      WHERE t.id = task_update.task_id AND pm.user_id = auth.uid()
    )
  );

-- RLS Policies for 'task_comment'
CREATE POLICY "Allow project members to SELECT task comments" ON public.task_comment
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      JOIN public.task_update tu ON task_comment.task_update_id = tu.id
      JOIN public.task t ON tu.task_id = t.id
      WHERE t.project_id = pm.project_id AND pm.user_id = auth.uid()
    )
  );
CREATE POLICY "Allow project members to INSERT task comments" ON public.task_comment
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      JOIN public.task_update tu ON task_comment.task_update_id = tu.id
      JOIN public.task t ON tu.task_id = t.id
      WHERE t.project_id = pm.project_id AND pm.user_id = auth.uid()
    )
  );

-- RLS Policies for 'task_asset'
CREATE POLICY "Allow project members to SELECT task assets" ON public.task_asset
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      JOIN public.task_update tu ON task_asset.task_update_id = tu.id
      JOIN public.task t ON tu.task_id = t.id
      WHERE t.project_id = pm.project_id AND pm.user_id = auth.uid()
    )
  );
CREATE POLICY "Allow project designers to INSERT task assets" ON public.task_asset
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      JOIN public.task_update tu ON task_asset.task_update_id = tu.id
      JOIN public.task t ON tu.task_id = t.id
      WHERE t.project_id = pm.project_id AND pm.user_id = auth.uid() AND pm.role = 'designer'
    )
  );
CREATE POLICY "Allow uploader or project admin to DELETE task assets" ON public.task_asset
  FOR DELETE USING (
    (task_asset.uploader_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.project_member pm
      JOIN public.task_update tu ON task_asset.task_update_id = tu.id
      JOIN public.task t ON tu.task_id = t.id
      WHERE t.project_id = pm.project_id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );

-- RLS Policies for 'timeline'
CREATE POLICY "Allow project members to SELECT timeline events for their projects" ON public.timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_member pm
      WHERE pm.project_id = timeline.project_id AND pm.user_id = auth.uid()
    )
  );
-- Timeline events should be inserted by the system (triggers or security definer functions)
CREATE POLICY "Restrict direct INSERT on timeline" ON public.timeline
  FOR INSERT WITH CHECK (false);
CREATE POLICY "Restrict direct UPDATE on timeline" ON public.timeline
  FOR UPDATE USING (false);
CREATE POLICY "Restrict direct DELETE on timeline" ON public.timeline
  FOR DELETE USING (false); 