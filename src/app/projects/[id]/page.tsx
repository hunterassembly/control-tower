'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useProject, useProjectTasks, useTaskCounts, useAuthDebug, TaskWithDetails } from '@/lib/hooks/useProjectData';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Project Tasks Page - Main task management interface matching target design
 */

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

function TaskCard({ task, userRole, onTaskUpdate, dragHandleProps, isDragging }: { 
  task: TaskWithDetails; 
  userRole: 'admin' | 'designer';
  onTaskUpdate?: () => void;
  dragHandleProps?: any;
  isDragging?: boolean;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDropdown]);

  // Context menu action handlers
  const handleViewDetails = () => {
    setShowViewDetails(true);
    setShowDropdown(false);
  };

  const handleApproveTask = async () => {
    if (userRole !== 'admin') return;
    
    setIsLoading(true);
    setShowDropdown(false);
    
    try {
      // Update task status to approved
      const { error } = await supabase
        .from('task')
        .update({ status: 'Approved' })
        .eq('id', task.id);

      if (error) throw error;
      
      // Trigger refresh
      onTaskUpdate?.();
      
      console.log('✅ Task approved successfully');
    } catch (error) {
      console.error('❌ Failed to approve task:', error);
      alert('Failed to approve task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (userRole !== 'admin') return;
    
    setIsLoading(true);
    setShowDeleteConfirm(false);
    setShowDropdown(false);
    
    try {
      // Delete task
      const { error } = await supabase
        .from('task')
        .delete()
        .eq('id', task.id);

      if (error) throw error;
      
      // Trigger refresh
      onTaskUpdate?.();
      
      console.log('✅ Task deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
    setShowDropdown(false);
  };

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 cursor-pointer ${
        isExpanded ? 'ring-2 ring-blue-500 ring-opacity-20 shadow-md' : ''
      } ${isDragging ? 'shadow-lg ring-2 ring-blue-300' : ''}`}
      onClick={(e) => {
        // Don't expand if clicking on dropdown or buttons or if dragging
        if (!(e.target as HTMLElement).closest('.dropdown-menu, .action-button') && !isDragging) {
          setIsExpanded(!isExpanded);
        }
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !isExpanded && !isDragging) {
          setIsExpanded(true);
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div 
          className={`mt-1 text-gray-400 cursor-grab active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : ''}`}
          {...(dragHandleProps || {})}
        >
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
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                {/* Expand/Collapse Indicator */}
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
              {/* Comments/Updates Count Badge */}
              {(task.comments_count > 0 || task.has_pending_update) && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {task.comments_count || 1}
                </span>
              )}
                             {/* Actions Menu */}
               <div className="relative dropdown-menu" ref={dropdownRef}>
                 <button 
                   className="p-1 rounded hover:bg-gray-100 transition-colors action-button"
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
                   <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px] z-10 dropdown-menu">
                     <button 
                       onClick={handleViewDetails}
                       className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 action-button"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       View Details
                     </button>
                     {userRole === 'admin' && task.status !== 'Approved' && (
                       <button 
                         onClick={handleApproveTask}
                         disabled={isLoading}
                         className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 action-button disabled:opacity-50"
                       >
                         {isLoading ? (
                           <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="m100 50 A50 50 0 0 1 75 25 L25 25 A25 25 0 0 1 50 0 Z"></path>
                           </svg>
                         ) : (
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                           </svg>
                         )}
                         {isLoading ? 'Approving...' : 'Approve Task'}
                       </button>
                     )}
                     {userRole === 'admin' && (
                       <button 
                         onClick={confirmDelete}
                         disabled={isLoading}
                         className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 action-button disabled:opacity-50"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                         Delete Task
                       </button>
                     )}
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
            
            {/* Expanded Content */}
            {isExpanded && (
              <>
                {/* Separator */}
                <div className="border-t border-gray-200 my-3"></div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Created</span>
                  <span>{formatDate(task.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Status</span>
                  <span className="font-medium text-gray-900">{task.status}</span>
                </div>
                {task.comments_count > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Comments</span>
                    <span className="font-medium text-gray-900">{task.comments_count}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
                  </svg>
                  <span>Position</span>
                  <span className="font-medium text-gray-900">#{task.position}</span>
                </div>
              </>
            )}
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
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors action-button">
                Review Update
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showViewDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
                <button 
                  onClick={() => setShowViewDetails(false)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'Up Next' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'Backlog' ? 'bg-gray-100 text-gray-800' :
                    task.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
                
                {task.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{task.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Assignee:</span>
                    <p className="text-gray-700">
                      {task.assignee ? (task.assignee.full_name || task.assignee.email) : 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Position:</span>
                    <p className="text-gray-700">#{task.position}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Created:</span>
                    <p className="text-gray-700">{formatDate(task.created_at)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Last Updated:</span>
                    <p className="text-gray-700">{formatDate(task.updated_at)}</p>
                  </div>
                </div>
                
                {task.comments_count > 0 && (
                  <div>
                    <span className="font-medium text-gray-900">Comments:</span>
                    <p className="text-gray-700">{task.comments_count} comment{task.comments_count !== 1 ? 's' : ''}</p>
                  </div>
                )}
                
                {task.has_pending_update && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">This task has pending updates awaiting review.</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowViewDetails(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                {userRole === 'admin' && task.status !== 'Approved' && (
                  <button 
                    onClick={handleApproveTask}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Approving...' : 'Approve Task'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Delete Task</h3>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "<strong>{task.title}</strong>"? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteTask}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DraggableTaskCard({ task, userRole, onTaskUpdate }: { 
  task: TaskWithDetails; 
  userRole: 'admin' | 'designer';
  onTaskUpdate?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard 
        task={task} 
        userRole={userRole} 
        onTaskUpdate={onTaskUpdate}
        dragHandleProps={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

function TaskSection({ 
  title, 
  tasks, 
  isExpanded = true,
  onToggle,
  showSearch = false,
  userRole,
  onTaskUpdate
}: { 
  title: string; 
  tasks: TaskWithDetails[];
  isExpanded?: boolean;
  onToggle?: () => void;
  showSearch?: boolean;
  userRole: 'admin' | 'designer';
  onTaskUpdate: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Optimistically update UI
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        
        try {
          // Update positions in database
          const updates = newTasks.map((task, index) => ({
            id: task.id,
            position: index + 1,
          }));

          // Batch update all positions
          for (const update of updates) {
            await supabase
              .from('task')
              .update({ position: update.position })
              .eq('id', update.id);
          }

          // Refresh data
          onTaskUpdate();
          console.log('✅ Task positions updated successfully');
        } catch (error) {
          console.error('❌ Failed to update task positions:', error);
          alert('Failed to update task order. Please try again.');
          // Refresh to restore original order
          onTaskUpdate();
        }
      }
    }
  };

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
        <div className="ml-5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {tasks.length > 0 ? (
                  tasks.map(task => (
                    <DraggableTaskCard key={task.id} task={task} userRole={userRole} onTaskUpdate={onTaskUpdate} />
                  ))
                ) : (
                  <div className="text-gray-500 text-sm italic">
                    No {title.toLowerCase()} tasks
                  </div>
                )}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {activeId ? (
                <div className="opacity-90 transform rotate-3 shadow-lg">
                  <TaskCard 
                    task={tasks.find(task => task.id === activeId)!} 
                    userRole={userRole} 
                    onTaskUpdate={onTaskUpdate}
                    isDragging={true}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </section>
  );
}

export default function ProjectPage({ params }: ProjectPageProps) {
  // Fix for Next.js 15: unwrap params Promise using React.use()
  const { id: projectId } = use(params);
  
  // Query client for data refresh
  const queryClient = useQueryClient();
  
  // Debug auth state
  const authDebug = useAuthDebug();
  console.log('🔍 [ProjectPage] Auth debug state:', authDebug);
  
  // Fetch project and task data
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useProjectTasks(projectId);
  const { active: activeTasks } = useTaskCounts(projectId);

  // Task update handler
  const handleTaskUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
  };

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
              userRole={project.user_role}
              onTaskUpdate={handleTaskUpdate}
            />

            {/* Up Next Section */}
            <TaskSection 
              title="Up Next" 
              tasks={tasks.up_next} 
              isExpanded={expandedSections['Up Next']}
              onToggle={() => toggleSection('Up Next')}
              userRole={project.user_role}
              onTaskUpdate={handleTaskUpdate}
            />

            {/* Backlog Section */}
            <TaskSection 
              title="Backlog" 
              tasks={tasks.backlog} 
              isExpanded={expandedSections['Backlog']}
              onToggle={() => toggleSection('Backlog')}
              showSearch={true}
              userRole={project.user_role}
              onTaskUpdate={handleTaskUpdate}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 