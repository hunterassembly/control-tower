import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for elevated permissions
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Initialize regular Supabase client to verify user authentication
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { invite_token } = await req.json()

    if (!invite_token) {
      return new Response(
        JSON.stringify({ error: 'invite_token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find the invite token in the database
    const { data: tokenData, error: tokenError } = await supabaseServiceRole
      .from('invite_token')
      .select('*')
      .eq('token', invite_token)
      .is('used_at', null)
      .is('voided_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      console.log('Token lookup error:', tokenError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid, expired, or already used invite token',
          details: tokenError?.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is already a member of this project
    const { data: existingMember } = await supabaseServiceRole
      .from('project_member')
      .select('*')
      .eq('project_id', tokenData.project_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      // User is already a member, just mark token as used
      await supabaseServiceRole
        .from('invite_token')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenData.id)

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Already a member of this project',
          project_id: tokenData.project_id,
          role: existingMember.role
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create project membership
    const { data: memberData, error: memberError } = await supabaseServiceRole
      .from('project_member')
      .insert({
        project_id: tokenData.project_id,
        user_id: user.id,
        role: tokenData.role
      })
      .select()
      .single()

    if (memberError) {
      console.log('Failed to create project membership:', memberError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create project membership',
          details: memberError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Mark token as used
    const { error: updateError } = await supabaseServiceRole
      .from('invite_token')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id)

    if (updateError) {
      console.log('Failed to mark token as used:', updateError)
      // Note: We don't fail here since the membership was created successfully
    }

    // Get project details for response
    const { data: projectData } = await supabaseServiceRole
      .from('project')
      .select('id, name')
      .eq('id', tokenData.project_id)
      .single()

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Successfully joined project',
        project_id: tokenData.project_id,
        project_name: projectData?.name,
        role: tokenData.role,
        membership: memberData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.log('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 