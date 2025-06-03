import React from "react";
import SkillsRadarAndRubrics from "../components/SkillsRadarAndRubrics";
import { IdentifiedSkillData, RadarDisplaySeries } from "../types";

interface TabRadarAndRubricsProps {
  skills: IdentifiedSkillData[];
  radarData: RadarDisplaySeries[];
  chartDataForRecharts: any[];
}

const TabRadarAndRubrics: React.FC<TabRadarAndRubricsProps> = ({ skills, radarData, chartDataForRecharts }) => (
  <SkillsRadarAndRubrics
    skills={skills}
    radarData={radarData}
    chartDataForRecharts={chartDataForRecharts}
  />
);

export default TabRadarAndRubrics;
