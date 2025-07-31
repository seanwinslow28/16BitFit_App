/**
 * Character CRUD Test Script
 * Run with: node scripts/test-character-crud.js
 */

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

console.log('Testing Character CRUD Operations...');
console.log('Supabase URL:', supabaseUrl);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test data
const testEmail = `test_${Date.now()}@16bitfit.com`;
const testPassword = 'testpass123';
let testUserId = null;
let testCharacterId = null;

async function runTests() {
  try {
    console.log('\n1. Testing Authentication...');
    
    // Create test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('❌ Auth failed:', authError.message);
      return;
    }

    testUserId = authData.user?.id;
    console.log('✅ User created:', testUserId);

    console.log('\n2. Testing Character Creation...');
    
    const newCharacter = {
      user_id: testUserId,
      name: 'Test Fighter',
      archetype: 'power',
      level: 1,
      strength: 75,
      stamina: 50,
      health: 70,
      speed: 40,
      experience: 0,
      evolution_stage: 0,
      streak_days: 0,
    };

    const { data: createData, error: createError } = await supabase
      .from('characters')
      .insert(newCharacter)
      .select()
      .single();

    if (createError) {
      console.error('❌ Character creation failed:', createError.message);
      return;
    }

    testCharacterId = createData.id;
    console.log('✅ Character created:', testCharacterId);
    console.log('   Name:', createData.name);
    console.log('   Archetype:', createData.archetype);

    console.log('\n3. Testing Character Read...');
    
    const { data: readData, error: readError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', testCharacterId)
      .single();

    if (readError) {
      console.error('❌ Character read failed:', readError.message);
      return;
    }

    console.log('✅ Character retrieved:', readData.name);
    console.log('   Level:', readData.level);
    console.log('   Stats:', {
      strength: readData.strength,
      stamina: readData.stamina,
      health: readData.health,
      speed: readData.speed,
    });

    console.log('\n4. Testing Character Update...');
    
    const updates = {
      level: 2,
      strength: 80,
      experience: 100,
      updated_at: new Date().toISOString(),
    };

    const { data: updateData, error: updateError } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', testCharacterId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Character update failed:', updateError.message);
      return;
    }

    console.log('✅ Character updated:');
    console.log('   Level:', updateData.level);
    console.log('   Strength:', updateData.strength);
    console.log('   Experience:', updateData.experience);

    console.log('\n5. Testing Activity Logging...');
    
    const activity = {
      user_id: testUserId,
      character_id: testCharacterId,
      type: 'workout',
      category: 'strength',
      duration_minutes: 30,
      intensity: 3,
      calories_estimated: 250,
      stat_gains: {
        strength: 5,
        stamina: 2,
        experience: 50,
      },
    };

    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    if (activityError) {
      console.error('❌ Activity logging failed:', activityError.message);
      return;
    }

    console.log('✅ Activity logged:');
    console.log('   Type:', activityData.type);
    console.log('   Duration:', activityData.duration_minutes, 'minutes');
    console.log('   Stat gains:', activityData.stat_gains);

    console.log('\n6. Testing Character Deletion...');
    
    const { error: deleteError } = await supabase
      .from('characters')
      .delete()
      .eq('id', testCharacterId);

    if (deleteError) {
      console.error('❌ Character deletion failed:', deleteError.message);
      return;
    }

    console.log('✅ Character deleted successfully');

    console.log('\n7. Cleaning up test user...');
    
    await supabase.auth.signOut();
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }
}

// Run tests
runTests();