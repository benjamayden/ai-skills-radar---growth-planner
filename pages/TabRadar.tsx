import React, { useCallback } from "react";
import RaterManager from "../components/RaterManager";
import SkillsRadarChart from "../components/SkillsRadarChart";
import SkillRubricCard from "../components/SkillRubricCard";
import LoadingIndicator from "../components/LoadingIndicator";
import SkillMasteryManager from "../components/SkillMasteryManager";
import {
  Rater,
  IdentifiedSkillData,
  RubricLevel,
  RadarDisplaySeries,
  SkillStatus,
  SkillMasteryCheck,
} from "../types";

interface TabRadarProps {
  raters: Rater[];
  activeRaterId: string;
  onAddRater: (name: string) => void;
  onSelectRater: (id: string) => void;
  comparisonRaterIds: string[];
  onToggleComparisonRater: (id: string) => void;
  showAverageOnRadar: boolean;
  onToggleShowAverage: () => void;
  chartDataForRecharts: any[];
  seriesInfoForChart: RadarDisplaySeries[];
  theme: "light" | "dark";
  onSkillLabelClick: (skillId: string) => void;
  identifiedSkills: IdentifiedSkillData[];
  getRatingForSkillCard: (skillId: string) => RubricLevel | undefined;
  handleRateSkill: (skillId: string, rating: RubricLevel) => void;
  getAllRatingsSummaryForSkill: (skillId: string) => string;
  isProcessingSkills: boolean;
  loadingMessage: string;
  rubricCardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  // Skill Mastery Props
  skillStatuses?: Record<string, SkillStatus>;
  onMarkSkillAsMastered?: (skillId: string) => void;
  onToggleMasteredSkill?: (skillId: string) => void;
  onSwapSkill?: (removeSkillId: string, addSkillId: string) => void;
  checkSkillMastery?: (skillId: string) => SkillMasteryCheck;
  getAvailableSkillsForSwap?: () => IdentifiedSkillData[];
  allSkills?: IdentifiedSkillData[];
}

const TabRadar: React.FC<TabRadarProps> = ({
  raters,
  activeRaterId,
  onAddRater,
  onSelectRater,
  comparisonRaterIds,
  onToggleComparisonRater,
  showAverageOnRadar,
  onToggleShowAverage,
  chartDataForRecharts,
  seriesInfoForChart,
  theme,
  onSkillLabelClick,
  identifiedSkills,
  getRatingForSkillCard,
  handleRateSkill,
  getAllRatingsSummaryForSkill,
  isProcessingSkills,
  loadingMessage,
  rubricCardRefs,
  // Skill Mastery Props
  skillStatuses = {},
  onMarkSkillAsMastered,
  onToggleMasteredSkill,
  onSwapSkill,
  checkSkillMastery,
  getAvailableSkillsForSwap,
  allSkills = [],
}) => {
  const activeRaterForRubricDisplay =
    raters.find((r) => r.id === activeRaterId) || raters[0]; // Local function to handle clicking on skills in the radar chart
  const handleLocalSkillClick = useCallback(
    (skillId: string) => {
      if (!skillId) {
        console.log("TabRadar: No skillId provided for click handler");
        return;
      }

      // Try to scroll directly to the rubric card
      const skillCardElement = rubricCardRefs.current[skillId];
      if (skillCardElement) {
        console.log(`TabRadar: Scrolling to skill ${skillId}`);
        skillCardElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        console.log(
          `TabRadar: Element not found for skill ${skillId}, falling back to parent handler`
        );
        // Fall back to parent handler
        onSkillLabelClick(skillId);
      }
    },
    [rubricCardRefs, onSkillLabelClick]
  );

  return (
    <div className="space-y-6">
      {/* Skill Mastery Manager - only show if all required props are provided */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
        <div className="lg:col-span-2 space-y-6 radar-column-print">
          <RaterManager
            raters={raters}
            activeRaterId={activeRaterId}
            onAddRater={onAddRater}
            onSelectRater={onSelectRater}
            comparisonRaterIds={comparisonRaterIds}
            onToggleComparisonRater={onToggleComparisonRater}
            showAverageOnRadar={showAverageOnRadar}
            onToggleShowAverage={onToggleShowAverage}
            className="print-hide"
          />
          <SkillsRadarChart
            chartDataForRecharts={chartDataForRecharts}
            seriesInfoForChart={seriesInfoForChart}
            theme={theme}
            onSkillLabelClick={handleLocalSkillClick}
          />
          <div className="print-skills-list hidden print:block space-y-1 mt-4">
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Skills Overview ({activeRaterForRubricDisplay.name}):
            </h4>
            {identifiedSkills.map((skill) => {
              const rating = getRatingForSkillCard(skill.id);
              return (
                <div
                  key={skill.id}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  <strong>{skill.name}:</strong> {rating || "Not Rated"}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => window.print()}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md shadow-md print-hide"
          >
            Print Rubrics & Active Rater Overview
          </button>
          {onMarkSkillAsMastered &&
            onToggleMasteredSkill &&
            onSwapSkill &&
            checkSkillMastery &&
            getAvailableSkillsForSwap && (
              <SkillMasteryManager
                skills={allSkills}
                skillStatuses={skillStatuses}
                onMarkSkillAsMastered={onMarkSkillAsMastered}
                onToggleMasteredSkill={onToggleMasteredSkill}
                onSwapSkill={onSwapSkill}
                checkSkillMastery={checkSkillMastery}
                getAvailableSkillsForSwap={getAvailableSkillsForSwap}
                theme={theme}
              />
            )}
        </div>
        <div className="lg:col-span-2 space-y-4 rubrics-column-print">
          <div className="hidden print:block print-only-header">
            <p className="text-sm">
              <strong>Rater for Rubrics:</strong>{" "}
              {activeRaterForRubricDisplay.name}
            </p>
          </div>
          {isProcessingSkills ? (
            <LoadingIndicator message={loadingMessage} />
          ) : identifiedSkills.length > 0 ? (
            identifiedSkills.map((skill) => (
              <div
                key={skill.id}
                className="skill-rubric-card-print-wrapper"
                ref={(el) => {
                  rubricCardRefs.current[skill.id] = el;
                }}
              >
                <SkillRubricCard
                  skillData={skill}
                  currentRatingForActiveRater={getRatingForSkillCard(skill.id)}
                  onRateSkill={handleRateSkill}
                  allRatingsSummary={getAllRatingsSummaryForSkill(skill.id)}
                  skillStatus={skillStatuses[skill.id]}
                  masteryCheck={
                    checkSkillMastery ? checkSkillMastery(skill.id) : undefined
                  }
                  onSwapSkill={onSwapSkill}
                  getAvailableSkillsForSwap={getAvailableSkillsForSwap}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">
              No skills identified yet. Go to "My Details" to generate skills.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabRadar;
