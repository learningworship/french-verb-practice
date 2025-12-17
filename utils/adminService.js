/**
 * Admin Service
 * 
 * Provides admin-only functions for managing users and verbs.
 * All functions check admin status via RLS policies.
 */

import { supabase } from './supabase';

// =====================================================
// USER MANAGEMENT
// =====================================================

/**
 * Get all users with their statistics (admin only)
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        role,
        is_banned,
        banned_at,
        banned_reason,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message };
    }

    return { success: true, users: data };
  } catch (err) {
    console.error('Exception fetching users:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get user statistics for admin dashboard
 */
export const getUserStats = async () => {
  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get banned users count
    const { count: bannedUsers, error: bannedError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true);

    if (bannedError) throw bannedError;

    // Get admin users count
    const { count: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (adminError) throw adminError;

    // Get total default verbs
    const { count: totalVerbs, error: verbsError } = await supabase
      .from('default_verbs')
      .select('*', { count: 'exact', head: true });

    if (verbsError) throw verbsError;

    return {
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        bannedUsers: bannedUsers || 0,
        adminUsers: adminUsers || 0,
        regularUsers: (totalUsers || 0) - (adminUsers || 0),
        totalVerbs: totalVerbs || 0,
      }
    };
  } catch (err) {
    console.error('Exception fetching stats:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Ban a user (admin only)
 */
export const banUser = async (userId, reason = '') => {
  try {
    const { error } = await supabase.rpc('ban_user', {
      target_user_id: userId,
      reason: reason || null
    });

    if (error) {
      console.error('Error banning user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception banning user:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Unban a user (admin only)
 */
export const unbanUser = async (userId) => {
  try {
    const { error } = await supabase.rpc('unban_user', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error unbanning user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception unbanning user:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Promote a user to admin (admin only)
 */
export const promoteToAdmin = async (userId) => {
  try {
    const { error } = await supabase.rpc('promote_to_admin', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error promoting user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception promoting user:', err);
    return { success: false, error: err.message };
  }
};

// =====================================================
// VERB MANAGEMENT
// =====================================================

/**
 * Get all default verbs (admin can see all)
 */
export const getDefaultVerbs = async () => {
  try {
    const { data, error } = await supabase
      .from('default_verbs')
      .select('*')
      .order('verb', { ascending: true });

    if (error) {
      console.error('Error fetching verbs:', error);
      return { success: false, error: error.message };
    }

    return { success: true, verbs: data };
  } catch (err) {
    console.error('Exception fetching verbs:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Add a new default verb (admin only)
 */
export const addDefaultVerb = async (verb, translation) => {
  try {
    const { data, error } = await supabase
      .from('default_verbs')
      .insert([{ 
        verb: verb.trim().toLowerCase(), 
        translation: translation.trim() 
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding verb:', error);
      // Handle duplicate verb error
      if (error.code === '23505') {
        return { success: false, error: 'This verb already exists' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, verb: data };
  } catch (err) {
    console.error('Exception adding verb:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Update a default verb (admin only)
 */
export const updateDefaultVerb = async (verbId, verb, translation) => {
  try {
    const { data, error } = await supabase
      .from('default_verbs')
      .update({ 
        verb: verb.trim().toLowerCase(), 
        translation: translation.trim() 
      })
      .eq('id', verbId)
      .select()
      .single();

    if (error) {
      console.error('Error updating verb:', error);
      return { success: false, error: error.message };
    }

    return { success: true, verb: data };
  } catch (err) {
    console.error('Exception updating verb:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Delete a default verb (admin only)
 */
export const deleteDefaultVerb = async (verbId) => {
  try {
    const { error } = await supabase
      .from('default_verbs')
      .delete()
      .eq('id', verbId);

    if (error) {
      console.error('Error deleting verb:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception deleting verb:', err);
    return { success: false, error: err.message };
  }
};

// =====================================================
// ROLE CHECKING
// =====================================================

/**
 * Check if current user is an admin
 */
export const checkIsAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) return false;

    return data.role === 'admin';
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
};

/**
 * Get current user's role
 */
export const getCurrentUserRole = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;

    return data;
  } catch (err) {
    console.error('Error getting user role:', err);
    return null;
  }
};

