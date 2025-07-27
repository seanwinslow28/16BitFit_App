import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Create context
const SupabaseContext = createContext({});

// Provider component
export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [characterStats, setCharacterStats] = useState({
    health: 100,
    strength: 50,
    stamina: 50,
    speed: 50,
    experience: 0,
    level: 1,
  });

  useEffect(() => {
    // Check for existing session
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadCharacterStats(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadCharacterStats(session.user.id);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCharacterStats = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setCharacterStats({
          health: data.health || 100,
          strength: data.strength || 50,
          stamina: data.stamina || 50,
          speed: data.speed || 50,
          experience: data.experience || 0,
          level: data.level || 1,
        });
      }
    } catch (error) {
      console.error('Error loading character stats:', error);
    }
  };

  const updateCharacterStats = async (updates) => {
    if (!user) return;

    try {
      // Update local state immediately for responsiveness
      setCharacterStats(prev => ({
        ...prev,
        ...updates,
      }));

      // Update in database
      const { error } = await supabase
        .from('characters')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating character stats:', error);
      // Revert local state on error
      loadCharacterStats(user.id);
    }
  };

  const logActivity = async (activityData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          ...activityData,
          logged_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update character stats based on activity
      if (activityData.stat_gains) {
        const newStats = {
          strength: characterStats.strength + (activityData.stat_gains.strength || 0),
          stamina: characterStats.stamina + (activityData.stat_gains.stamina || 0),
          health: Math.min(100, characterStats.health + (activityData.stat_gains.health || 0)),
        };
        
        await updateCharacterStats(newStats);
      }

      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });
      
      if (error) throw error;

      // Create initial character
      if (data.user) {
        await supabase.from('characters').insert({
          user_id: data.user.id,
          name: username || 'Fighter',
          archetype: 'balanced',
          level: 1,
          experience: 0,
          strength: 50,
          stamina: 50,
          speed: 50,
          health: 100,
          power: 10,
        });
      }

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setCharacterStats({
        health: 100,
        strength: 50,
        stamina: 50,
        speed: 50,
        experience: 0,
        level: 1,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    supabase,
    user,
    loading,
    characterStats,
    updateCharacterStats,
    logActivity,
    signIn,
    signUp,
    signOut,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Hook to use Supabase context
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};