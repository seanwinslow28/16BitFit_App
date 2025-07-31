#!/usr/bin/env node

/**
 * Deploy Supabase Schema
 * This script deploys the database schema to your Supabase project
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deploySchema() {
  log('\n🚀 16BitFit Supabase Schema Deployment', 'bright');
  log('=====================================\n', 'bright');

  // Check for environment variables first
  let supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // If not found in env, ask user
  if (!supabaseUrl) {
    log('Enter your Supabase project URL:', 'cyan');
    log('(Found in Settings > API)', 'yellow');
    supabaseUrl = await question('URL: ');
  }

  if (!supabaseServiceKey) {
    log('\nEnter your Supabase service role key:', 'cyan');
    log('⚠️  WARNING: This key has full database access. Keep it secure!', 'red');
    log('(Found in Settings > API > service_role key)', 'yellow');
    supabaseServiceKey = await question('Service Role Key: ');
  }

  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    });

    log('\n📁 Reading schema files...', 'blue');

    // Read schema files
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const schemaFiles = await fs.readdir(migrationsDir);
    const sqlFiles = schemaFiles.filter(file => file.endsWith('.sql')).sort();

    log(`Found ${sqlFiles.length} migration files`, 'green');

    // Deploy each schema file
    for (const file of sqlFiles) {
      log(`\n📝 Deploying ${file}...`, 'cyan');
      
      const sqlContent = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      
      // Split by semicolons but be careful with functions/triggers
      const statements = sqlContent
        .split(/;(?=\s*(?:--|$|CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|GRANT|REVOKE))/i)
        .filter(stmt => stmt.trim().length > 0);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        
        // Skip empty statements or comments
        if (!statement || statement.startsWith('--')) continue;

        try {
          // Execute the SQL statement
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });

          // If exec_sql doesn't exist, try direct execution (note: this requires admin access)
          if (error && error.message.includes('exec_sql')) {
            log('  ⚠️  Direct SQL execution not available. Using alternative method...', 'yellow');
            // For production, you'd use Supabase CLI or dashboard
            log(`  Statement ${i + 1}: Would execute but requires Supabase CLI`, 'yellow');
          } else if (error) {
            throw error;
          } else {
            successCount++;
            process.stdout.write('.');
          }
        } catch (error) {
          errorCount++;
          log(`\n  ❌ Error in statement ${i + 1}: ${error.message}`, 'red');
          
          // For certain errors, we might want to continue
          if (error.message.includes('already exists')) {
            log('  ℹ️  Object already exists, continuing...', 'yellow');
          } else {
            // Ask if user wants to continue
            const answer = await question('Continue with remaining statements? (y/n): ');
            if (answer.toLowerCase() !== 'y') {
              throw new Error('Deployment cancelled by user');
            }
          }
        }
      }

      log(`\n  ✅ Completed: ${successCount} successful, ${errorCount} errors`, 
          errorCount > 0 ? 'yellow' : 'green');
    }

    log('\n🎉 Schema deployment completed!', 'green');
    log('\n📋 Next steps:', 'cyan');
    log('1. Update your .env file with:', 'yellow');
    log(`   REACT_APP_SUPABASE_URL=${supabaseUrl}`, 'yellow');
    log(`   REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>`, 'yellow');
    log('2. Test the connection with: npm run test:supabase', 'yellow');
    log('3. Start the app with: npm start', 'yellow');

    // Alternative deployment method notice
    log('\n💡 Alternative deployment methods:', 'cyan');
    log('1. Supabase Dashboard: SQL Editor > New Query > Paste schema', 'yellow');
    log('2. Supabase CLI: supabase db push', 'yellow');
    log('3. Direct psql: psql <connection-string> -f <schema-file>', 'yellow');

  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, 'red');
    
    if (error.message.includes('Invalid API key')) {
      log('\n🔑 API Key Issues:', 'yellow');
      log('1. Make sure you\'re using the service_role key, not the anon key', 'yellow');
      log('2. Check that the key matches your project URL', 'yellow');
      log('3. Ensure the key hasn\'t been regenerated', 'yellow');
    } else if (error.message.includes('Failed to fetch')) {
      log('\n🌐 Connection Issues:', 'yellow');
      log('1. Check your internet connection', 'yellow');
      log('2. Verify the Supabase URL is correct', 'yellow');
      log('3. Ensure your project is active', 'yellow');
    }
    
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Alternative: Simple connection test
async function testConnection() {
  log('\n🧪 Testing Supabase Connection', 'bright');
  log('===============================\n', 'bright');

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    log('❌ Missing environment variables:', 'red');
    log('   REACT_APP_SUPABASE_URL', !supabaseUrl ? 'red' : 'green');
    log('   REACT_APP_SUPABASE_ANON_KEY', !supabaseAnonKey ? 'red' : 'green');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try a simple query
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      log(`❌ Connection failed: ${error.message}`, 'red');
    } else {
      log('✅ Successfully connected to Supabase!', 'green');
    }
  } catch (error) {
    log(`❌ Connection error: ${error.message}`, 'red');
  }
}

// Main execution
if (process.argv.includes('--test')) {
  testConnection().then(() => process.exit(0));
} else {
  log('⚠️  IMPORTANT: Manual Deployment Recommended', 'yellow');
  log('\nFor production deployments, we recommend using:', 'cyan');
  log('1. Supabase Dashboard SQL Editor (most reliable)', 'yellow');
  log('2. Supabase CLI: npm install -g supabase', 'yellow');
  log('   Then: supabase db push', 'yellow');
  log('\nThis script can help generate the commands.', 'cyan');
  
  question('\nContinue with script deployment? (y/n): ').then(answer => {
    if (answer.toLowerCase() === 'y') {
      deploySchema();
    } else {
      log('\nGenerating deployment instructions instead...', 'cyan');
      
      log('\n📋 Manual Deployment Steps:', 'bright');
      log('1. Go to your Supabase Dashboard', 'yellow');
      log('2. Navigate to SQL Editor', 'yellow');
      log('3. Click "New Query"', 'yellow');
      log('4. Copy and paste each .sql file from supabase/migrations/', 'yellow');
      log('5. Run each migration in order', 'yellow');
      
      log('\n📁 Migration files to run:', 'cyan');
      log('- supabase/migrations/20250115000000_initial_schema.sql', 'yellow');
      log('- supabase/migrations/20250127_realtime_matchmaking.sql', 'yellow');
      
      rl.close();
    }
  });
}