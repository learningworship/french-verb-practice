/**
 * Statistics Service
 * 
 * Calculates various statistics from practice sessions and user data.
 * All calculations are done server-side via Supabase queries for efficiency.
 */

import { supabase } from './supabase';

/**
 * Get the start and end of the current calendar week (Monday-Sunday)
 * @returns {Object} { start: Date, end: Date }
 */
function getCurrentWeekRange() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate Monday (if today is Sunday, go back 6 days; otherwise go back to Monday)
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0); // Start of Monday (00:00:00)
  
  // Calculate Sunday (6 days after Monday)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999); // End of Sunday (23:59:59)
  
  return { start: monday, end: sunday };
}

/**
 * Calculate practice streak from practice sessions
 * Streak = consecutive days with at least one practice session
 * @param {Array} sessions - Array of practice sessions with created_at
 * @returns {Object} { current: number, best: number }
 */
function calculateStreak(sessions) {
  if (sessions.length === 0) {
    return { current: 0, best: 0 };
  }

  // Get unique practice dates (just the date, not time)
  const practiceDates = new Set();
  sessions.forEach(session => {
    const date = new Date(session.created_at);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    practiceDates.add(dateKey);
  });

  // Convert to sorted array of Date objects
  const sortedDates = Array.from(practiceDates)
    .map(dateKey => {
      const [year, month, day] = dateKey.split('-').map(Number);
      return new Date(year, month, day);
    })
    .sort((a, b) => b - a); // Most recent first

  // Calculate current streak (from today backwards)
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let checkDate = new Date(today);
  for (let i = 0; i < sortedDates.length; i++) {
    const practiceDate = new Date(sortedDates[i]);
    practiceDate.setHours(0, 0, 0, 0);
    
    // Check if this date matches our expected date
    const daysDiff = Math.floor((checkDate - practiceDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Practiced on this day
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1); // Check previous day
    } else if (daysDiff > 0) {
      // Gap found, streak broken
      break;
    } else {
      // This date is in the future (shouldn't happen, but handle it)
      continue;
    }
  }

  // Calculate best streak (longest consecutive sequence)
  let bestStreak = 0;
  let tempStreak = 0;
  let lastDate = null;

  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const currentDate = new Date(sortedDates[i]);
    currentDate.setHours(0, 0, 0, 0);

    if (lastDate === null) {
      tempStreak = 1;
    } else {
      const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        // Consecutive day
        tempStreak++;
      } else {
        // Gap found, reset streak
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    lastDate = currentDate;
  }
  bestStreak = Math.max(bestStreak, tempStreak);

  return { current: currentStreak, best: bestStreak };
}

/**
 * Get comprehensive statistics for the current user
 * @returns {Promise<Object>} Statistics object
 */
export async function getStatistics() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get all practice sessions for the user
    const { data: allSessions, error: sessionsError } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (sessionsError) throw sessionsError;

    // Calculate overall stats
    const totalSessions = allSessions?.length || 0;
    const correctSessions = allSessions?.filter(s => s.is_correct === true).length || 0;
    const overallAccuracy = totalSessions > 0 
      ? Math.round((correctSessions / totalSessions) * 100) 
      : 0;

    // Calculate this week's stats
    const weekRange = getCurrentWeekRange();
    const weekSessions = allSessions?.filter(s => {
      const sessionDate = new Date(s.created_at);
      return sessionDate >= weekRange.start && sessionDate <= weekRange.end;
    }) || [];
    
    const weekTotal = weekSessions.length;
    const weekCorrect = weekSessions.filter(s => s.is_correct === true).length;
    const weekAccuracy = weekTotal > 0 
      ? Math.round((weekCorrect / weekTotal) * 100) 
      : 0;

    // Calculate days practiced this week
    const weekDays = new Set();
    weekSessions.forEach(s => {
      const date = new Date(s.created_at);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      weekDays.add(dateKey);
    });
    const daysPracticedThisWeek = weekDays.size;

    // Get most practiced verbs (from practice_sessions)
    const verbCounts = {};
    allSessions?.forEach(session => {
      const verb = session.verb_text;
      verbCounts[verb] = (verbCounts[verb] || 0) + 1;
    });

    const mostPracticedVerbs = Object.entries(verbCounts)
      .map(([verb, count]) => ({ verb, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    // Calculate practice streak
    const streak = calculateStreak(allSessions || []);

    // Get total verbs count
    const { count: totalVerbs, error: verbsError } = await supabase
      .from('user_verbs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (verbsError) throw verbsError;

    return {
      success: true,
      stats: {
        // Overall stats
        totalSessions,
        overallAccuracy,
        totalVerbs: totalVerbs || 0,
        
        // This week stats
        weekSessions: weekTotal,
        weekAccuracy,
        daysPracticedThisWeek,
        
        // Most practiced verbs
        mostPracticedVerbs,
        
        // Streak
        currentStreak: streak.current,
        bestStreak: streak.best,
      }
    };

  } catch (err) {
    console.error('Error getting statistics:', err);
    return { success: false, error: err.message };
  }
}

