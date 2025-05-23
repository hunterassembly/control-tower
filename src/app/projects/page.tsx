'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * Projects landing page - redirects users to their project(s)
 * For now, redirects to the test "Outpost" project
 */
export default function ProjectsPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          // Not authenticated, redirect to login
          router.push('/login');
          return;
        }

        // For testing: redirect to the Outpost project
        // In production, this would fetch user's projects and show a list
        const testProjectId = '49b31685-877b-4d32-9b03-c0796876e33d';
        router.push(`/projects/${testProjectId}`);
        
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-muted">Loading your projects...</p>
      </div>
    </div>
  );
} 