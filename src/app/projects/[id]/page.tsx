'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useProject, useProjectTasks, useTaskCounts, useAuthDebug, TaskWithDetails } from '@/lib/hooks/useProjectData';

/**
 * Project Tasks Page - Main task management interface matching target design
 */

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

function TaskCard({ task, userRole }: { task: TaskWithDetails; userRole: 'admin' | 'designer' }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="mt-1 text-gray-400 cursor-grab">
          <svg width="6" height="10" viewBox="0 0 6 10" fill="currentColor">
            <circle cx="1" cy="2" r="1"/>
            <circle cx="1" cy="5" r="1"/>
            <circle cx="1" cy="8" r="1"/>
            <circle cx="5" cy="2" r="1"/>
            <circle cx="5" cy="5" r="1"/>
            <circle cx="5" cy="8" r="1"/>
          </svg>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <div className="flex items-center gap-2">
              {/* Comments/Updates Count Badge */}
              {(task.comments_count > 0 || task.has_pending_update) && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {task.comments_count || 1}
                </span>
              )}
                             {/* Actions Menu */}
               <div className="relative" ref={dropdownRef}>
                 <button 
                   className="p-1 rounded hover:bg-gray-100 transition-colors"
                   onClick={() => setShowDropdown(!showDropdown)}
                 >
                   <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-gray-400">
                     <circle cx="10" cy="5" r="1.5"/>
                     <circle cx="10" cy="10" r="1.5"/>
                     <circle cx="10" cy="15" r="1.5"/>
                   </svg>
                 </button>
                 
                 {/* Dropdown Menu */}
                 {showDropdown && (
                   <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px] z-10">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve Task
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Task Summary Section */}
          {task.description && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Summary</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed pl-6">
                {task.description}
              </p>
            </div>
          )}

          {/* Task Metadata */}
          <div className="space-y-2 text-sm text-gray-500 mb-4">
            {task.assignee && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Designer</span>
                <span className="font-medium text-gray-900">{task.assignee.full_name || task.assignee.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Last Updated</span>
              <span>{formatDate(task.updated_at)}</span>
            </div>
          </div>

          {/* Pending Update Notification */}
          {task.has_pending_update && userRole === 'admin' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800 text-sm">An update is ready for you to review!</span>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Review Update
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskSection({ 
  title, 
  tasks, 
  isExpanded = true,
  onToggle,
  showSearch = false 
}: { 
  title: string; 
  tasks: TaskWithDetails[];
  isExpanded?: boolean;
  onToggle?: () => void;
  showSearch?: boolean;
}) {
  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div 
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 -m-1 rounded"
        onClick={onToggle}
      >
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        <h2 className="text-base font-medium text-gray-900">
          {title}
          {tasks.length > 0 && (
            <span className="text-gray-500 ml-1">({tasks.length})</span>
          )}
        </h2>
      </div>
      
      {/* Search for Backlog */}
      {showSearch && isExpanded && (
        <div className="ml-5">
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
      
      {/* Task Cards */}
      {isExpanded && (
        <div className="space-y-3 ml-5">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} userRole="admin" />
            ))
          ) : (
            <div className="text-gray-500 text-sm italic">
              No {title.toLowerCase()} tasks
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function ProjectPage({ params }: ProjectPageProps) {
  // Fix for Next.js 15: unwrap params Promise using React.use()
  const { id: projectId } = use(params);
  
  // Debug auth state
  const authDebug = useAuthDebug();
  console.log('🔍 [ProjectPage] Auth debug state:', authDebug);
  
  // Fetch project and task data
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useProjectTasks(projectId);
  const { active: activeTasks } = useTaskCounts(projectId);

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState({
    'In Progress': true,
    'Up Next': true,
    'Backlog': true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Loading state
  if (projectLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (projectError || tasksError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">
            Error: {projectError?.message || tasksError?.message}
          </p>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">Debug Info</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
              <strong>Project Error:</strong> {JSON.stringify(projectError, null, 2)}
              <strong>Tasks Error:</strong> {JSON.stringify(tasksError, null, 2)}
              <strong>Auth Debug:</strong> {JSON.stringify(authDebug, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  if (!project || !tasks) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">O/M</span>
                <span className="text-lg font-medium text-gray-900">{project.name}</span>
              </div>
              <div className="text-sm text-gray-500">Project Dashboard</div>
            </div>
            
            {/* User Controls */}
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-yellow-500">🔔</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-600">⚙️</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-sm font-medium text-white">👤</span>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <nav className="flex space-x-1 mt-6">
            <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-b-2 border-gray-900 -mb-px">
              Tasks
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Overview
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Assets
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700">Active Tasks ({activeTasks})</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {project.user_role === 'admin' && (
              <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
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
              isExpanded={expandedSections['In Progress']}
              onToggle={() => toggleSection('In Progress')}
            />

            {/* Up Next Section */}
            <TaskSection 
              title="Up Next" 
              tasks={tasks.up_next} 
              isExpanded={expandedSections['Up Next']}
              onToggle={() => toggleSection('Up Next')}
            />

            {/* Backlog Section */}
            <TaskSection 
              title="Backlog" 
              tasks={tasks.backlog} 
              isExpanded={expandedSections['Backlog']}
              onToggle={() => toggleSection('Backlog')}
              showSearch={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 