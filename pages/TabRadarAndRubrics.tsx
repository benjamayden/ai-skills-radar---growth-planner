import React from "react";
import SkillsRadarAndRubrics from "../components/SkillsRadarAndRubrics";
import { IdentifiedSkillData, RadarDisplaySeries } from "../types";

interface TabRadarAndRubricsProps {
  skills: IdentifiedSkillData[];
  radarData: RadarDisplaySeries[];
  chartDataForRecharts: any[];
  theme: "light" | "dark"; // Add theme prop with correct type
}

const TabRadarAndRubrics: React.FC<TabRadarAndRubricsProps> = ({ skills, radarData, chartDataForRecharts, theme }) => (
  <SkillsRadarAndRubrics
    skills={skills}
    radarData={radarData}
    chartDataForRecharts={chartDataForRecharts}
    theme={theme} // Pass theme to the component
  />
);

export default TabRadarAndRubrics;
