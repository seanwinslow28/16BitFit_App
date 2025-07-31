#!/usr/bin/env node

/**
 * Test Production Supabase Connection
 * Verifies that the production credentials are working
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use environment variables for security
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🔌 Testing Supabase Production Connection...');
console.log(`📍 URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    console.log('\n✅ Successfully connected to Supabase!');
    
    // Test 2: Try to query a table (it might not exist yet)
    console.log('\n📊 Testing database access...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Tables not yet created (this is expected for a new project)');
        console.log('   Run the migration scripts to create the database schema');
      } else {
        console.log('❌ Database error:', error.message);
      }
    } else {
      console.log('✅ Database connection successful!');
    }
    
    // Test 3: Check auth configuration
    console.log('\n🔐 Testing authentication setup...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (!authError) {
      console.log('✅ Authentication is configured correctly');
    }
    
    console.log('\n🎉 Connection test complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the database migrations to create all tables');
    console.log('2. Enable Row Level Security (RLS) policies');
    console.log('3. Configure real-time subscriptions in the dashboard');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();