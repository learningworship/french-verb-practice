/**
 * Cloud Storage Service
 * 
 * Handles all data operations with Supabase cloud database.
 * Replaces local AsyncStorage for synced data.
 */

import { supabase } from './supabase';

// =====================================================
// USER VERBS (Cloud Storage)
// =====================================================

/**
 * Initialize user's verbs from default verbs
 * Called when a new user signs up or first opens the app
 */
export const initializeUserVerbs = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in, skipping verb initialization');
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user already has verbs
    const { count, error: countError } = await supabase
      .from('user_verbs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) throw countError;

    // If user already has verbs, skip initialization
    if (count > 0) {
      console.log(`User already has ${count} verbs, skipping initialization`);
      return { success: true, message: 'Verbs already initialized', count };
    }

    // Get all default verbs
    const { data: defaultVerbs, error: defaultError } = await supabase
      .from('default_verbs')
      .select('verb, translation');

    if (defaultError) throw defaultError;

    // Create user verbs from defaults
    const userVerbs = defaultVerbs.map(v => ({
      user_id: user.id,
      verb: v.verb,
      translation: v.translation,
      is_default: true,
      practice_count: 0,
    }));

    // Insert all verbs for the user
    const { error: insertError } = await supabase
      .from('user_verbs')
      .insert(userVerbs);

    if (insertError) throw insertError;

    console.log(`Initialized ${userVerbs.length} verbs for user`);
    return { success: true, count: userVerbs.length };

  } catch (err) {
    console.error('Error initializing user verbs:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get all verbs for the current user
 */
export const getUserVerbs = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', verbs: [] };
    }

    const { data, error } = await supabase
      .from('user_verbs')
      .select('*')
      .eq('user_id', user.id)
      .order('verb', { ascending: true });

    if (error) throw error;

    return { success: true, verbs: data || [] };

  } catch (err) {
    console.error('Error getting user verbs:', err);
    return { success: false, error: err.message, verbs: [] };
  }
};

/**
 * Get a random verb for practice
 */
export const getRandomVerb = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get count of user's verbs
    const { count, error: countError } = await supabase
      .from('user_verbs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) throw countError;
    if (!count || count === 0) {
      return { success: false, error: 'No verbs available' };
    }

    // Get a random offset
    const randomOffset = Math.floor(Math.random() * count);

    // Fetch one random verb
    const { data, error } = await supabase
      .from('user_verbs')
      .select('*')
      .eq('user_id', user.id)
      .range(randomOffset, randomOffset)
      .single();

    if (error) throw error;

    return { success: true, verb: data };

  } catch (err) {
    console.error('Error getting random verb:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Add a custom verb for the current user
 */
export const addUserVerb = async (verb, translation) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if verb already exists for this user
    const { data: existing } = await supabase
      .from('user_verbs')
      .select('id')
      .eq('user_id', user.id)
      .eq('verb', verb.trim().toLowerCase())
      .single();

    if (existing) {
      return { success: false, error: 'This verb already exists in your list' };
    }

    // Insert new verb
    const { data, error } = await supabase
      .from('user_verbs')
      .insert([{
        user_id: user.id,
        verb: verb.trim().toLowerCase(),
        translation: translation.trim(),
        is_default: false,
        practice_count: 0,
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, verb: data };

  } catch (err) {
    console.error('Error adding verb:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Delete a verb for the current user
 */
export const deleteUserVerb = async (verbId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('user_verbs')
      .delete()
      .eq('id', verbId)
      .eq('user_id', user.id); // Extra safety: only delete own verbs

    if (error) throw error;

    return { success: true };

  } catch (err) {
    console.error('Error deleting verb:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Increment practice count for a verb
 */
export const incrementVerbPracticeCount = async (verbId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get current count
    const { data: current, error: getError } = await supabase
      .from('user_verbs')
      .select('practice_count')
      .eq('id', verbId)
      .eq('user_id', user.id)
      .single();

    if (getError) throw getError;

    // Increment
    const { error: updateError } = await supabase
      .from('user_verbs')
      .update({ practice_count: (current.practice_count || 0) + 1 })
      .eq('id', verbId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    return { success: true };

  } catch (err) {
    console.error('Error incrementing practice count:', err);
    return { success: false, error: err.message };
  }
};

// =====================================================
// PRACTICE SESSIONS (Cloud Storage)
// =====================================================

/**
 * Save a practice session to the cloud
 */
export const savePracticeSession = async (session) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('practice_sessions')
      .insert([{
        user_id: user.id,
        verb_id: session.verbId,
        verb_text: session.verbText,  // Required field: the verb being practiced
        tense: session.tense,
        user_sentence: session.userSentence,
        is_correct: session.isCorrect,
        ai_feedback: session.aiFeedback,
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, session: data };

  } catch (err) {
    console.error('Error saving practice session:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get practice history for the current user
 */
export const getPracticeHistory = async (limit = 50) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', sessions: [] };
    }

    const { data, error } = await supabase
      .from('practice_sessions')
      .select(`
        *,
        user_verbs (verb, translation)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, sessions: data || [] };

  } catch (err) {
    console.error('Error getting practice history:', err);
    return { success: false, error: err.message, sessions: [] };
  }
};

/**
 * Get practice statistics for the current user
 */
export const getPracticeStats = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get total sessions
    const { count: totalSessions, error: totalError } = await supabase
      .from('practice_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (totalError) throw totalError;

    // Get correct sessions
    const { count: correctSessions, error: correctError } = await supabase
      .from('practice_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_correct', true);

    if (correctError) throw correctError;

    // Get total verbs
    const { count: totalVerbs, error: verbsError } = await supabase
      .from('user_verbs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (verbsError) throw verbsError;

    // Get custom verbs
    const { count: customVerbs, error: customError } = await supabase
      .from('user_verbs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_default', false);

    if (customError) throw customError;

    // Calculate accuracy
    const accuracy = totalSessions > 0 
      ? Math.round((correctSessions / totalSessions) * 100) 
      : 0;

    return {
      success: true,
      stats: {
        totalSessions: totalSessions || 0,
        correctSessions: correctSessions || 0,
        accuracy,
        totalVerbs: totalVerbs || 0,
        customVerbs: customVerbs || 0,
      }
    };

  } catch (err) {
    console.error('Error getting practice stats:', err);
    return { success: false, error: err.message };
  }
};

// =====================================================
// USER SETTINGS (Cloud Storage)
// =====================================================

/**
 * Get user settings from cloud
 */
export const getUserSettings = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error;
    }

    return { success: true, settings: data || null };

  } catch (err) {
    console.error('Error getting user settings:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Save user settings to cloud
 */
export const saveUserSettings = async (settings) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Upsert settings (insert or update)
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, settings: data };

  } catch (err) {
    console.error('Error saving user settings:', err);
    return { success: false, error: err.message };
  }
};

