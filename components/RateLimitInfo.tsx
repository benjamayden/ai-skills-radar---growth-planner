import React, { useEffect, useState } from 'react';
import { getRateLimitInfo } from '../services/rateLimit';

interface RateLimitInfoProps {
  theme: 'light' | 'dark';
  className?: string;
}

const RateLimitInfo: React.FC<RateLimitInfoProps> = ({ theme, className = '' }) => {
  const [rateLimitInfo, setRateLimitInfo] = useState({
    isApproachingLimit: false,
    isLikelyAtLimit: false,
    usagePercent: 0,
    remainingCalls: 500,
  });

  useEffect(() => {
    // Get initial status
    updateRateLimitInfo();

    // Update every minute
    const intervalId = setInterval(updateRateLimitInfo, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const updateRateLimitInfo = () => {
    const status = checkRateLimitStatus();
    setRateLimitInfo(status);
  };

  if (!rateLimitInfo.isApproachingLimit) {
    return null; // Don't show anything if not approaching limit
  }

  const getRemainingColor = () => {
    if (rateLimitInfo.isLikelyAtLimit) {
      return theme === 'light' ? 'text-red-700' : 'text-red-400';
    }
    return theme === 'light' ? 'text-amber-700' : 'text-amber-400';
  };

  const { count, limit, remaining } = getRateLimitInfo();
  const percentage = (count / limit) * 100;
  
  const getColorClass = () => {
    if (percentage < 50) return 'text-green-600 dark:text-green-400';
    if (percentage < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={`text-sm font-medium ${getRemainingColor()} ${className}`}>
      <div className="flex items-center">
        {rateLimitInfo.isLikelyAtLimit ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span>
          API Quota: {rateLimitInfo.remainingCalls} calls remaining
          {rateLimitInfo.isLikelyAtLimit ? " (critical)" : ""}
        </span>
      </div>
      <div className={`text-xs ${getColorClass()}`}>
        API Calls Today: {count}/{limit} ({remaining} remaining)
      </div>
    </div>
  );
};

export default RateLimitInfo;
function checkRateLimitStatus() {
  const { count, limit, remaining } = getRateLimitInfo();
  const usagePercent = (count / limit) * 100;
  const isApproachingLimit = usagePercent >= 80;
  const isLikelyAtLimit = usagePercent >= 95 || remaining <= 10;
  return {
    isApproachingLimit,
    isLikelyAtLimit,
    usagePercent,
    remainingCalls: remaining,
  };
}

