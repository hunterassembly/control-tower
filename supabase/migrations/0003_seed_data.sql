-- Declare User UUIDs (replace with actual UUIDs from your manually created users)
DO $$
DECLARE
  client_user_id UUID := '2c26bc57-ccb9-4cd7-9e43-6833a8290c59';
  designer_user_id UUID := '2359b1ff-6259-46f2-b4e3-a8d3a797e4ca';
  admin_user_id UUID := 'fd4b695b-770e-497b-8d37-db4bcd16cd1c';
  
  off_menu_org_id UUID;
  outpost_project_id UUID;
BEGIN

  -- 1. Create Organization: "Off Menu"
  INSERT INTO public.organization (name) VALUES ('Off Menu') RETURNING id INTO off_menu_org_id;

  -- 2. Create Project: "Outpost" for "Off Menu"
  INSERT INTO public.project (name, organization_id) VALUES ('Outpost', off_menu_org_id) RETURNING id INTO outpost_project_id;

  -- 3. Assign Users to "Outpost" project with roles
  -- Admin
  INSERT INTO public.project_member (project_id, user_id, role)
  VALUES (outpost_project_id, admin_user_id, 'admin');
  
  -- Designer
  INSERT INTO public.project_member (project_id, user_id, role)
  VALUES (outpost_project_id, designer_user_id, 'designer');
  
  -- Client
  INSERT INTO public.project_member (project_id, user_id, role)
  VALUES (outpost_project_id, client_user_id, 'client');

  -- 4. Create Sample Tasks for "Outpost" project
  INSERT INTO public.task (project_id, title, description, status, assignee_id)
  VALUES
    (outpost_project_id, 'Outpost Website - Homepage Design Mockup', 'Create a high-fidelity mockup for the Outpost homepage, focusing on modern aesthetics and user engagement. Include sections for services, portfolio, and contact.', 'Up Next', designer_user_id),
    (outpost_project_id, 'Outpost Website - Develop Responsive Navbar', 'Code the navigation bar component using Next.js and Tailwind CSS. Ensure it is fully responsive across desktop, tablet, and mobile.', 'Backlog', designer_user_id),
    (outpost_project_id, 'Client Onboarding - Kickoff Meeting Prep', 'Prepare slides and agenda for the Outpost project kickoff meeting with the client.', 'Backlog', admin_user_id),
    (outpost_project_id, 'Outpost Branding - Logo Iteration Review', 'Review the latest logo iterations from the design team and provide feedback for final selection.', 'Waiting', client_user_id),
    (outpost_project_id, 'Setup Dev Environment for Outpost Project', 'Configure local development environment, install dependencies, and ensure Next.js app runs correctly.', 'In Progress', designer_user_id);
    
END $$; 