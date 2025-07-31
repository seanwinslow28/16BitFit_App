// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Basic health check
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: '16BitFit Backend',
      version: '1.0.0',
      checks: {
        api: 'operational',
        database: 'unknown',
        auth: 'unknown',
      }
    }

    // Check database connection
    try {
      const { error: dbError } = await supabaseClient
        .from('characters')
        .select('count')
        .limit(1)
        .single()
      
      healthStatus.checks.database = dbError ? 'error' : 'operational'
      if (dbError) {
        console.error('Database check failed:', dbError)
      }
    } catch (error) {
      healthStatus.checks.database = 'error'
      console.error('Database check error:', error)
    }

    // Check auth service
    try {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
      healthStatus.checks.auth = authError ? 'error' : 'operational'
      if (authError && authError.message !== 'Auth session missing!') {
        console.error('Auth check failed:', authError)
      }
    } catch (error) {
      healthStatus.checks.auth = 'error'
      console.error('Auth check error:', error)
    }

    // Determine overall health
    const allChecks = Object.values(healthStatus.checks)
    if (allChecks.every(check => check === 'operational')) {
      healthStatus.status = 'healthy'
    } else if (allChecks.some(check => check === 'operational')) {
      healthStatus.status = 'degraded'
    } else {
      healthStatus.status = 'unhealthy'
    }

    // Return health status
    return new Response(
      JSON.stringify(healthStatus),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        status: healthStatus.status === 'healthy' ? 200 : 503
      }
    )
  } catch (error) {
    console.error('Health check error:', error)
    
    return new Response(
      JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        service: '16BitFit Backend',
        error: error.message || 'Unknown error',
        checks: {
          api: 'error',
          database: 'unknown',
          auth: 'unknown',
        }
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})

// To invoke:
// curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/health-check' \
//   --header 'Authorization: Bearer YOUR_ANON_KEY' \
//   --header 'Content-Type: application/json'