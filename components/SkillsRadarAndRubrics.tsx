import React from "react";
import { IdentifiedSkillData } from "../types";
import SkillsRadarChart from "./SkillsRadarChart";

interface SkillsRadarAndRubricsProps {
  skills: IdentifiedSkillData[];
  radarData: any[]; // Replace 'any' with the correct type if available
  chartDataForRecharts: any[];
  theme: "light" | "dark"; // Make this required and explicitly typed to match SkillsRadarChart
}

const rubricLevels = [
  { key: "foundational", label: "Foundational" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
  { key: "expert", label: "Expert" },
];

const SkillsRadarAndRubrics: React.FC<SkillsRadarAndRubricsProps> = ({
  skills,
  radarData,
  theme,
  chartDataForRecharts,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-5xl mx-auto print:bg-white print:shadow-none print:p-4 print-container">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200 print:text-black print-title">
        Skills Radar & Rubrics
      </h2>
      <p className="text-gray-700 dark:text-gray-300 print:text-black mb-6">
        This section is for you to be able to print your skills radar and others
        to fill it out
      </p>
      <div className="mb-10 flex justify-center print-radar-container">
        <div className="print-skill-radar print:flex w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded print:bg-white print:border print:border-gray-300">
          <SkillsRadarChart
            chartDataForRecharts={chartDataForRecharts}
            seriesInfoForChart={radarData}
            theme={theme} // Now properly passed with the correct type
          />
        </div>
      </div>
      <div className="print-rubrics-container">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 print:text-black">
          Skill Rubrics
        </h3>
        <div className="space-y-8 print-rubrics-list">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="print-skill-wrapper block border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow print:shadow-none print:border-gray-400"
            >
              <h4 className="text-lg font-bold mb-4 text-primary-700 dark:text-primary-400 print:text-black">
                {skill.name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rubricLevels.map((level, idx) => (
                  <div
                    key={level.key}
                    className="print-skill-rubric flex items-start gap-4 mb-2"
                  >
                    <span
                      className={`w-[24px] h-[24px] text-gray-400 mt-1`}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 42 42"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="40"
                          height="40"
                          rx="3"
                          stroke="currentColor"
                          fill="none"
                          stroke-width="2"
                        />
                      </svg>
                    </span>
                    <div className="print-skill-detials block">
                      <span className="font-semibold text-gray-600 dark:text-gray-300 print:text-black">
                        {level.label}:
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 print:text-black mb-0">
                        {skill.rubric[level.key as keyof typeof skill.rubric]}
                      </p>
                    </div>
                  </div>
                ))}

              </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-600 dark:text-gray-300 print:text-black">
                    Additional Notes:
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 print:text-black mb-0 w-full h-[200px] border border-gray-300 dark:border-gray-600 rounded p-2 overflow-y-auto"></p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsRadarAndRubrics;
