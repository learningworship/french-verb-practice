/**
 * Authentication Service
 * 
 * Handles all authentication operations using Supabase Auth.
 * Provides simple functions for the UI to call.
 */

import { supabase } from './supabase';

/**
 * Register a new user
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password (min 6 characters)
 * @param {string} displayName - User's display name (optional)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const register = async (email, password, displayName = '') => {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Register with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return { 
        success: true, 
        user: data.user,
        message: 'Please check your email to confirm your account',
        requiresConfirmation: true,
      };
    }

    console.log('Registration successful:', data.user?.email);
    return { success: true, user: data.user, session: data.session };

  } catch (err) {
    console.error('Registration exception:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Log in an existing user
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const login = async (email, password) => {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (error) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Invalid email or password' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Please confirm your email before logging in' };
      }
      
      return { success: false, error: error.message };
    }

    console.log('Login successful:', data.user?.email);
    return { success: true, user: data.user, session: data.session };

  } catch (err) {
    console.error('Login exception:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Log out the current user
 * 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }

    console.log('Logout successful');
    return { success: true };

  } catch (err) {
    console.error('Logout exception:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Get the current logged-in user
 * 
 * @returns {Promise<object|null>} User object or null if not logged in
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (err) {
    console.error('Get current user error:', err);
    return null;
  }
};

/**
 * Get the current session
 * 
 * @returns {Promise<object|null>} Session object or null if not logged in
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }
    
    return session;
  } catch (err) {
    console.error('Get session error:', err);
    return null;
  }
};

/**
 * Check if user is currently authenticated
 * 
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  const session = await getSession();
  return session !== null;
};

/**
 * Send password reset email
 * 
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const resetPassword = async (email) => {
  try {
    if (!email) {
      return { success: false, error: 'Email is required' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: 'frenchverbpractice://reset-password',
      }
    );

    if (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Password reset email sent' };

  } catch (err) {
    console.error('Password reset exception:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Subscribe to auth state changes
 * Useful for updating UI when user logs in/out
 * 
 * @param {function} callback - Function to call when auth state changes
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('Auth state changed:', event);
      callback(event, session);
    }
  );

  // Return unsubscribe function
  return () => subscription.unsubscribe();
};

