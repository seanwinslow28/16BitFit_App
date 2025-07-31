#!/usr/bin/env node

/**
 * Test script to verify Supabase connection
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Check if we can query the database
    console.log('\n1. Testing database query...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);

    if (tablesError) {
      // Try a simpler query
      console.log('Information schema not accessible, trying direct table query...');
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('❌ Database query failed:', error.message);
      } else {
        console.log('✅ Database connection successful!');
      }
    } else {
      console.log('✅ Database connection successful!');
      console.log('Found tables:', tables?.map(t => t.table_name).join(', ') || 'None');
    }

    // Test 2: Check auth endpoint
    console.log('\n2. Testing auth endpoint...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.message !== 'Auth session missing!') {
      console.log('❌ Auth endpoint failed:', authError.message);
    } else {
      console.log('✅ Auth endpoint accessible!');
      console.log('Current user:', user ? user.email : 'Not logged in');
    }

    // Test 3: Check if tables exist
    console.log('\n3. Checking for 16BitFit tables...');
    const expectedTables = ['users', 'characters', 'activities', 'battles', 'achievements'];
    
    for (const tableName of expectedTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table '${tableName}' not found or not accessible`);
        } else {
          console.log(`✅ Table '${tableName}' exists`);
        }
      } catch (e) {
        console.log(`❌ Error checking table '${tableName}':`, e.message);
      }
    }

    console.log('\n✅ Connection test complete!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error);
  }
}

testConnection();