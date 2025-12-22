/**
 * Date Helper Functions
 * 
 * Utility functions for date comparisons and formatting.
 * Used primarily for grouping practice history by date.
 */

/**
 * Check if two dates are the same day
 * Compares year, month, and day only (ignores time)
 * 
 * @param {Date} date1 - First date to compare
 * @param {Date} date2 - Second date to compare
 * @returns {boolean} True if same day
 */
export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get the category key for a date
 * Returns 'Today', 'Yesterday', or 'Older'
 * 
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} 'Today', 'Yesterday', or 'Older'
 */
export function getDateKey(dateInput) {
  const sessionDate = new Date(dateInput);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(sessionDate, today)) {
    return 'Today';
  } else if (isSameDay(sessionDate, yesterday)) {
    return 'Yesterday';
  } else {
    return 'Older';
  }
}

/**
 * Group an array of items by date category
 * Items must have a 'created_at' field
 * 
 * @param {Array} items - Array of objects with created_at field
 * @returns {Object} { Today: [], Yesterday: [], Older: [] }
 */
export function groupByDate(items) {
  const grouped = {
    'Today': [],
    'Yesterday': [],
    'Older': [],
  };

  for (const item of items) {
    const key = getDateKey(item.created_at);
    grouped[key].push(item);
  }

  return grouped;
}

/**
 * Format a date for display
 * Shows time for today/yesterday, full date for older
 * 
 * @param {string|Date} dateInput - Date to format
 * @returns {string} Formatted date string
 */
export function formatSessionDate(dateInput) {
  const date = new Date(dateInput);
  const key = getDateKey(dateInput);

  if (key === 'Today' || key === 'Yesterday') {
    // Show time only: "10:30 AM"
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } else {
    // Show date: "Dec 15, 2025"
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

/**
 * Get a friendly date label for a group
 * 
 * @param {string} key - 'Today', 'Yesterday', or 'Older'
 * @param {Array} items - Items in this group (to get date for 'Older')
 * @returns {string} Display label
 */
export function getGroupLabel(key, items) {
  if (key === 'Today') return '📅 Today';
  if (key === 'Yesterday') return '📅 Yesterday';
  return '📅 Earlier';
}

