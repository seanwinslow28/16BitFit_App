/**
 * Supabase Client Configuration
 * Handles connection to Supabase backend
 */

// Import URL polyfill for React Native compatibility
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
// Using production Supabase instance
const supabaseUrl = process.env.SUPABASE_URL || 'https://noxwzelpibuytttlgztq.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veHd6ZWxwaWJ1eXR0dGxnenRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Njc2ODQsImV4cCI6MjA2ODE0MzY4NH0.wLBAe5q8t8GImd7YGzW_AYwGAzs5xmkg1kFlqUGweLY';

// Create Supabase client with React Native storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for common operations
export const supabaseAuth = {
  // Sign in with email
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign up new user
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Get session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};

export default supabase;