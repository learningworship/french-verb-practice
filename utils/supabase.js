/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for use throughout the app.
 * The client handles:
 * - Database operations (CRUD)
 * - Authentication (login, register, logout)
 * - Real-time subscriptions
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase project credentials
// Note: The anon key is safe for client-side use (protected by RLS)
const SUPABASE_URL = 'https://exbanqyzrczwdorgnpkb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YmFucXl6cmN6d2RvcmducGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDg0NzUsImV4cCI6MjA4MTQyNDQ3NX0.U2G_radfOcJFfSCIqyIceQtc6gOJXQPSccN8iaMRaMs';

/**
 * Create Supabase client with custom storage for React Native
 * 
 * Why custom storage?
 * - Web browsers use localStorage
 * - React Native doesn't have localStorage
 * - We use AsyncStorage instead to persist auth tokens
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Use AsyncStorage to persist the session
    storage: AsyncStorage,
    // Automatically refresh the token before it expires
    autoRefreshToken: true,
    // Persist the session across app restarts
    persistSession: true,
    // Don't detect session from URL (not applicable for mobile)
    detectSessionInUrl: false,
  },
});

/**
 * Helper function to get the current user
 * Returns null if not logged in
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

/**
 * Helper function to get the current session
 * Returns null if not logged in
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

/**
 * Helper function to check if user is authenticated
 */
export const isAuthenticated = async () => {
  const session = await getCurrentSession();
  return session !== null;
};

// Export the URL for reference (useful for debugging)
export const supabaseUrl = SUPABASE_URL;

