'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTask } from '@/lib/hooks/useTaskData';
import Link from 'next/link';

interface TaskPageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskPage({ params }: TaskPageProps) {
  // Fix for Next.js 15: unwrap params Promise using React.use()
  const { taskId } = use(params);
  const router = useRouter();
  
  // Fetch task data
  const { data: task, isLoading, error } = useTask(taskId);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric', 
      year: 'numeric'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Task not found</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">O/M</span>
                <span className="text-lg font-medium text-gray-900">{task.project?.name}</span>
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
            <Link 
              href={`/projects/${task.project_id}`}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Tasks
            </Link>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Overview
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Assets
            </button>
          </nav>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link 
            href={`/projects/${task.project_id}`}
            className="hover:text-gray-700 transition-colors"
          >
            Tasks
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Task Details</span>
        </nav>
      </div>

      {/* Main Content - 70/30 Split Layout */}
      <main className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (70%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>
              
              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                {/* Designer */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Designer</span>
                  <span className="font-medium text-gray-900">
                    {task.assignee ? (task.assignee.full_name || task.assignee.email) : 'Unassigned'}
                  </span>
                </div>

                {/* Reviewer */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Reviewer</span>
                  <span className="font-medium text-gray-900">Dave Cohen</span>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Last Updated</span>
                  <span className="font-medium text-gray-900">{formatDate(task.updated_at)}</span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Status</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'Up Next' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'Backlog' ? 'bg-gray-100 text-gray-800' :
                    task.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>

              {/* Pending Update Notification */}
              {task.has_pending_update && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-800 font-medium">An update is ready for you to review!</span>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Review Update
                  </button>
                </div>
              )}
            </div>

            {/* Task Content Sections */}
            <div className="space-y-6">
              {/* Description Section */}
              {task.description && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <p className="leading-relaxed">{task.description}</p>
                  </div>
                </div>
              )}

              {/* Background Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Background</h2>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p className="leading-relaxed">
                    The original logo was designed in 2018 and hasn't been revisited since. It's currently too thin for small 
                    screens and loses clarity in grayscale. During stakeholder interviews, clients noted that the logo felt 
                    "dated" and "not aligned with product quality." The goal is to make the mark more confident without 
                    losing recognizability.
                  </p>
                </div>
              </div>

              {/* Requirements Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ul className="space-y-2">
                    <li>Explore 2-3 updated versions deep and close to the original, and one bolder reinterpretation</li>
                    <li>Adjust typeface to improve readability at small sizes</li>
                    <li>Create both horizontal and stacked variations</li>
                    <li>Include black, white, and color options</li>
                    <li>Export in SVG + PNG (400px min), plus vector source file</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (30%) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Timeline & Updates */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Updates</h3>
              <div className="text-sm text-gray-500">
                Timeline updates will appear here...
              </div>
            </div>

            {/* Assets */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.102m-.758 4.899L7.5 7.5l4.5 4.5" />
                  </svg>
                  <a href="https://westian.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    https://westian.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-gray-600">brand-guidelines.zip</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">social_templates.fig</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Close Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 