/**
 * Supabase Service
 * Re-exports from the new provider and maintains legacy compatibility
 */

// Re-export from the new provider file
export { SupabaseProvider, useSupabase } from './SupabaseProvider';

// Import URL polyfill for React Native compatibility
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using environment variables for Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Legacy service class for backward compatibility
class SupabaseService {
  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    
    this.isInitialized = false;
    this.currentUser = null;
  }

  async initialize() {
    try {
      // Check for existing session
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        this.currentUser = session.user;
      }
      
      // Set up auth state listener
      this.supabase.auth.onAuthStateChange((event, session) => {
        this.currentUser = session?.user || null;
      });
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async signUp(email, password, username) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, username);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  async createUserProfile(userId, username) {
    try {
      // Create character profile
      const { data: character, error: charError } = await this.supabase
        .from('characters')
        .insert({
          user_id: userId,
          name: username || 'Fighter',
          archetype: 'balanced',
          level: 1,
          experience: 0,
          strength: 50,
          endurance: 50,
          speed: 50,
          health: 100,
          power: 10,
        })
        .select()
        .single();

      if (charError) throw charError;

      return { data: character, error: null };
    } catch (error) {
      console.error('Create profile error:', error);
      return { data: null, error };
    }
  }

  async getCharacterStats(userId) {
    try {
      const { data, error } = await this.supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get character stats error:', error);
      return { data: null, error };
    }
  }

  async updateCharacterStats(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('characters')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update character stats error:', error);
      return { data: null, error };
    }
  }

  async logActivity(userId, activityData) {
    try {
      const { data, error } = await this.supabase
        .from('activities')
        .insert({
          user_id: userId,
          ...activityData,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Log activity error:', error);
      return { data: null, error };
    }
  }

  async getActivities(userId, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get activities error:', error);
      return { data: null, error };
    }
  }

  async createBattleRecord(userId, battleData) {
    try {
      const { data, error } = await this.supabase
        .from('battles')
        .insert({
          user_id: userId,
          ...battleData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create battle record error:', error);
      return { data: null, error };
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}

// Export singleton instance for legacy compatibility
export default new SupabaseService();