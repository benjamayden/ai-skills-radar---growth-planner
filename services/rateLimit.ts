// Track API usage to provide warnings before hitting rate limits
interface RateLimitTracker {
  todayCount: number;
  lastReset: string; // ISO date string
}

// Get the current date in PT (Pacific Time) since Gemini quotas reset at midnight PT
const getCurrentDatePT = (): string => {
  const date = new Date();
  // Convert to PT (UTC-7 or UTC-8 depending on daylight saving)
  const ptDate = new Date(date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  return ptDate.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Initialize or get rate limit tracker from localStorage
export const getRateLimitTracker = (): RateLimitTracker => {
  const stored = localStorage.getItem('geminiRateLimitTracker');
  if (stored) {
    const tracker = JSON.parse(stored) as RateLimitTracker;
    
    // If we have a new day in PT, reset the counter
    const currentDatePT = getCurrentDatePT();
    if (tracker.lastReset !== currentDatePT) {
      const newTracker: RateLimitTracker = {
        todayCount: 0,
        lastReset: currentDatePT
      };
      localStorage.setItem('geminiRateLimitTracker', JSON.stringify(newTracker));
      return newTracker;
    }
    
    return tracker;
  }
  
  // Initialize a new tracker
  const newTracker: RateLimitTracker = {
    todayCount: 0,
    lastReset: getCurrentDatePT()
  };
  localStorage.setItem('geminiRateLimitTracker', JSON.stringify(newTracker));
  return newTracker;
};

const RATE_LIMIT_KEY = 'gemini_api_calls';
const DAILY_LIMIT = 500;

export function incrementRateLimitCounter(calls: number = 1): void {
  // Implementation here
}

export function getRateLimitInfo(): { count: number; limit: number; remaining: number } {
  return { count: 0, limit: 500, remaining: 500 };
}

// Reset the counter (useful for testing)
export const resetRateLimitCounter = (): void => {
  const newTracker: RateLimitTracker = {
    todayCount: 0,
    lastReset: getCurrentDatePT()
  };
  localStorage.setItem('geminiRateLimitTracker', JSON.stringify(newTracker));
};
