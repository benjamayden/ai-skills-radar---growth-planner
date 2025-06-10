import React from "react";
import { SkillStatus } from "../types";

interface SkillMasteryIndicatorProps {
  skillId: string;
  skillStatuses: Record<string, SkillStatus>;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SkillMasteryIndicator: React.FC<SkillMasteryIndicatorProps> = ({
  skillId,
  skillStatuses,
  size = "sm",
  className = "",
}) => {
  const status = skillStatuses[skillId];
  
  if (status !== SkillStatus.MASTERED) {
    return null;
  }

  const sizeClasses = {
    sm: "w-3 h-3 text-xs",
    md: "w-4 h-4 text-sm", 
    lg: "w-5 h-5 text-base"
  };

  return (
    <div 
      className={`${sizeClasses[size]} inline-flex items-center justify-center 
                  bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 
                  rounded-full border border-green-300 dark:border-green-600 
                  font-bold ${className}`}
      title="Mastered Skill"
    >
      ✓
    </div>
  );
};

export default SkillMasteryIndicator;
