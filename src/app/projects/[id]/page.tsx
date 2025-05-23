'use client';

import { use } from 'react';
import { useProject, useProjectTasks, useTaskCounts, TaskWithDetails } from '@/lib/hooks/useProjectData';

/**
 * Main Project Page - Primary workspace where users land after authentication
 * This is NOT a tasks subpage but the main project hub with task management
 */

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

function TaskCard({ task, userRole }: { task: TaskWithDetails; userRole: 'admin' | 'designer' }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="task-card">
      <div className="flex items-start gap-3 p-4">
        {/* Drag Handle */}
        <div className="drag-handle mt-1">
          <svg width="6" height="10" viewBox="0 0 6 10" fill="currentColor">
            <circle cx="2" cy="2" r="1"/>
            <circle cx="2" cy="5" r="1"/>
            <circle cx="2" cy="8" r="1"/>
            <circle cx="4" cy="2" r="1"/>
            <circle cx="4" cy="5" r="1"/>
            <circle cx="4" cy="8" r="1"/>
          </svg>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-primary mb-2">{task.title}</h3>
          
          {/* Task Metadata */}
          <div className="flex items-center gap-4 text-sm text-secondary">
            {task.assignee && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Designer</span>
                <span>{task.assignee.full_name || task.assignee.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>Last updated</span>
              <span>{formatDate(task.updated_at)}</span>
            </div>
          </div>

          {/* Comments Count */}
          {task.comments_count > 0 && (
            <div className="mt-2">
              <span className="badge">{task.comments_count}</span>
            </div>
          )}

          {/* Pending Update Notification */}
          {task.has_pending_update && userRole === 'admin' && (
            <div className="alert-info mt-3">
              <span>An update is ready for you to review!</span>
              <button className="btn-primary ml-3">Review Update</button>
            </div>
          )}
        </div>

        {/* Actions Menu */}
        <div className="dropdown-trigger">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="5" r="1.5"/>
            <circle cx="10" cy="10" r="1.5"/>
            <circle cx="10" cy="15" r="1.5"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function TaskSection({ 
  title, 
  tasks, 
  status, 
  userRole,
  showSearch = false 
}: { 
  title: string; 
  tasks: TaskWithDetails[];
  status: string;
  userRole: 'admin' | 'designer';
  showSearch?: boolean;
}) {
  return (
    <section className="task-section">
      <h2 className="task-section-header">
        <span className={`status-dot ${status.replace('_', '-')}`}></span>
        {title}
        {tasks.length > 0 && <span className="task-count ml-2">{tasks.length}</span>}
      </h2>
      
      {/* Search for Backlog */}
      {showSearch && (
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} userRole={userRole} />
          ))
        ) : (
          <div className="task-card">
            <div className="p-4">
              <p className="text-muted">No {title.toLowerCase()} tasks</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ProjectPage({ params }: ProjectPageProps) {
  // Fix for Next.js 15: unwrap params Promise using React.use()
  const { id: projectId } = use(params);
  
  // Fetch project and task data
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useProjectTasks(projectId);
  const { active: activeTasks } = useTaskCounts(projectId);

  // Loading state
  if (projectLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (projectError || tasksError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive">
            Error: {projectError?.message || tasksError?.message}
          </p>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted">Debug Info</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
              Project Error: {JSON.stringify(projectError, null, 2)}
              Tasks Error: {JSON.stringify(tasksError, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  if (!project || !tasks) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Project Header */}
      <header className="project-header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="project-title">{project.name}</h1>
              <p className="project-subtitle">Project Dashboard</p>
            </div>
            
            {/* User Controls */}
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <span className="text-gray-600">🔔</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <span className="text-gray-600">⚙️</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium">👤</span>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <nav className="nav-tabs mt-6">
            <button className="nav-tab active">Tasks</button>
            <button className="nav-tab">Overview</button>
            <button className="nav-tab">Assets</button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-6 py-6">
        {/* Task Management Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="task-count">Active Tasks ({activeTasks})</span>
          </div>
          {project.user_role === 'admin' && (
            <button className="btn-primary">
              + New Task
            </button>
          )}
        </div>

        {/* Task Sections */}
        <div className="space-y-8">
          {/* In Progress Section */}
          <TaskSection 
            title="In Progress" 
            tasks={tasks.in_progress} 
            status="in-progress"
            userRole={project.user_role}
          />

          {/* Up Next Section */}
          <TaskSection 
            title="Up Next" 
            tasks={tasks.up_next} 
            status="up-next"
            userRole={project.user_role}
          />

          {/* Backlog Section */}
          <TaskSection 
            title="Backlog" 
            tasks={tasks.backlog} 
            status="backlog"
            userRole={project.user_role}
            showSearch={true}
          />
        </div>
      </main>
    </div>
  );
} 