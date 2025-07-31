#!/usr/bin/env node

/**
 * Test Production Supabase Tables
 * Verifies that all tables were created successfully
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTables() {
  console.log('🔍 Testing Supabase Production Tables...\n');

  const tables = [
    'profiles', 'user_settings', 'character_archetypes', 'characters',
    'character_stats', 'activities', 'battles', 'achievements',
    'user_achievements', 'friendships', 'guilds', 'guild_members',
    'character_evolution', 'character_customization', 'daily_challenges',
    'user_daily_challenges', 'matchmaking_queue', 'pvp_battles', 'guild_chat'
  ];

  let successCount = 0;
  let failedTables = [];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        failedTables.push(table);
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
      failedTables.push(table);
    }
  }

  // Test character archetypes
  console.log('\n📊 Testing Character Archetypes...');
  const { data: archetypes, error: archetypeError } = await supabase
    .from('character_archetypes')
    .select('*');
  
  if (!archetypeError && archetypes) {
    console.log(`✅ Found ${archetypes.length} character archetypes:`);
    archetypes.forEach(arch => {
      console.log(`   - ${arch.name}: ${arch.description}`);
    });
  }

  // Test views
  console.log('\n👁️ Testing Views...');
  try {
    const { data: leaderboard, error: lbError } = await supabase
      .from('character_leaderboard')
      .select('*')
      .limit(1);
    
    if (!lbError) {
      console.log('✅ character_leaderboard view is accessible');
    } else {
      console.log(`❌ character_leaderboard: ${lbError.message}`);
    }

    const { data: stats, error: statsError } = await supabase
      .from('user_activity_stats')
      .select('*')
      .limit(1);
    
    if (!statsError) {
      console.log('✅ user_activity_stats view is accessible');
    } else {
      console.log(`❌ user_activity_stats: ${statsError.message}`);
    }
  } catch (err) {
    console.log('❌ Error testing views:', err.message);
  }

  console.log('\n📈 Summary:');
  console.log(`✅ ${successCount}/${tables.length} tables successfully created`);
  
  if (failedTables.length > 0) {
    console.log(`❌ Failed tables: ${failedTables.join(', ')}`);
  } else {
    console.log('🎉 All tables created successfully!');
  }

  console.log('\n🚀 Your database is ready for 16BitFit!');
}

testTables().catch(console.error);