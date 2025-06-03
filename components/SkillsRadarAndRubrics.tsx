import React from "react";
import { IdentifiedSkillData, RadarDisplaySeries } from "../types";
import SkillsRadarChart from "./SkillsRadarChart";

interface SkillsRadarAndRubricsProps {
  skills: IdentifiedSkillData[];
  radarData: RadarDisplaySeries[];
  chartDataForRecharts: any[];
}

const rubricLevels = [
  { key: "foundational", label: "Foundational" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
  { key: "expert", label: "Expert" },
];

const levelColors = [
  "bg-gray-200", // Foundational
  "bg-blue-200", // Intermediate
  "bg-yellow-200", // Advanced
  "bg-green-200", // Expert
];

const SkillsRadarAndRubrics: React.FC<SkillsRadarAndRubricsProps> = ({
  skills,
  radarData,
  chartDataForRecharts,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto print:bg-white print:shadow-none print:p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 print:text-black">
        Skills Radar & Rubrics
      </h2>
      <div className="mb-10 flex justify-center">
        <div className="w-full flex items-center justify-center bg-gray-100 rounded print:bg-white print:border print:border-gray-300">
          <SkillsRadarChart
            chartDataForRecharts={chartDataForRecharts}
            seriesInfoForChart={radarData}
            theme="light" // or pass as a prop if you want to support dark mode
          />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-700 print:text-black">
          Skill Rubrics
        </h3>
        <div className="space-y-8">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="border border-gray-200 rounded-lg p-6 bg-white shadow print:shadow-none print:border-gray-400"
            >
              <h4 className="text-lg font-bold mb-4 text-primary-700 print:text-black">
                {skill.name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rubricLevels.map((level, idx) => (
                  <div
                    key={level.key}
                    className="flex items-start gap-4 mb-2"
                  >
                    <span
                      className={`inline-block w-6 h-6 rounded border border-gray-400 mt-1 ${levelColors[idx]}`}
                    ></span>
                    <div>
                      <span className="font-semibold text-gray-600 print:text-black">
                        {level.label}:
                      </span>
                      <p className="text-gray-700 print:text-black mb-0">
                        {
                          skill.rubric[level.key as keyof typeof skill.rubric]
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsRadarAndRubrics;