/**
 * Main Project Page - Primary workspace where users land after authentication
 * This is NOT a tasks subpage but the main project hub with task management
 */

interface ProjectPageProps {
  params: { id: string };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const projectId = params.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Project Header */}
      <header className="project-header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="project-title">Vantian</h1>
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
            <span className="task-count">Active Tasks (24)</span>
          </div>
          <button className="btn-primary">
            + New Task
          </button>
        </div>

        {/* Task Sections */}
        <div className="space-y-8">
          {/* In Progress Section */}
          <section className="task-section">
            <h2 className="task-section-header">
              <span className="status-dot in-progress"></span>
              In Progress
            </h2>
            <div className="space-y-4">
              {/* Placeholder for task cards */}
              <div className="task-card">
                <div className="p-4">
                  <p className="text-muted">Task cards will be implemented in the next phase...</p>
                </div>
              </div>
            </div>
          </section>

          {/* Up Next Section */}
          <section className="task-section">
            <h2 className="task-section-header">
              <span className="status-dot up-next"></span>
              Up Next
            </h2>
            <div className="space-y-4">
              <div className="task-card">
                <div className="p-4">
                  <p className="text-muted">Coming soon...</p>
                </div>
              </div>
            </div>
          </section>

          {/* Backlog Section */}
          <section className="task-section">
            <h2 className="task-section-header">
              <span className="status-dot backlog"></span>
              Backlog
              <span className="task-count ml-2">24</span>
            </h2>
            
            {/* Search for Backlog */}
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-4">
              <div className="task-card">
                <div className="p-4">
                  <p className="text-muted">Backlog tasks coming soon...</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
} 