
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { IdentifiedSkillData, RubricLevel, RUBRIC_LEVEL_MAP, MAX_RUBRIC_LEVEL_VALUE } from '../types';
import { RADAR_CHART_COLORS } from '../constants';

interface SkillsRadarChartProps {
  skills: IdentifiedSkillData[];
  ratingsData: Record<string, number>; 
  raterName?: string;
  theme: 'light' | 'dark';
  onSkillLabelClick?: (skillId: string) => void; // New prop
}

// Custom tick component for clickable skill labels
const CustomAngleTick: React.FC<any> = (props) => {
  const { x, y, payload, onSkillLabelClick, theme } = props;
  const skillId = payload.skillId; // skillId is now part of the payload
  const axisColor = theme === 'dark' ? '#a0aec0' : '#374151';

  const handleClick = () => {
    if (onSkillLabelClick && skillId) {
      onSkillLabelClick(skillId);
    }
  };

  // Adjust textAnchor based on angle, or provide default to avoid error
  const getAnchor = (angle: number) => {
    if (angle > 15 && angle < 165) return 'start';
    if (angle > 195 && angle < 345) return 'end';
    return 'middle';
  };
  const textAnchor = payload.coordinate && payload.angle ? getAnchor(payload.angle) : 'middle';


  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={payload.index === 0 ? -4 : (payload.index === Math.floor(props.visibleTicksCount / 2) ? 4 : 0)} // Basic vertical adjustment
        textAnchor={textAnchor}
        fill={axisColor}
        fontSize={10}
        onClick={handleClick}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        className="hover:fill-primary-500 dark:hover:fill-primary-400 transition-colors"
      >
        {payload.value}
      </text>
    </g>
  );
};


const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({ skills, ratingsData, raterName, theme, onSkillLabelClick }) => {
  if (!skills || skills.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No skills data available to display chart.</p>;
  }
  
  const chartData = skills.map(skill => ({
    subject: skill.name,
    skillId: skill.id, // Added skillId here
    ratingValue: ratingsData[skill.id] ?? 0,
    fullMark: MAX_RUBRIC_LEVEL_VALUE,
  }));

  const tickFormatter = (value: number) => {
    const level = Object.keys(RUBRIC_LEVEL_MAP).find(key => RUBRIC_LEVEL_MAP[key as RubricLevel] === value);
    return level ? (level as string).substring(0,3) + '.' : (value === 0 ? 'N/R' : ''); 
  };

  const legendName = raterName ? `${raterName}'s Rating` : "Current Rating";
  const axisColor = theme === 'dark' ? '#a0aec0' : '#374151'; 
  const gridColor = theme === 'dark' ? '#4a5568' : '#e2e8f0'; 
  const tooltipBgColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)'; 
  const tooltipTextColor = theme === 'dark' ? '#e2e8f0' : '#334155'; 


  return (
    <div 
      className="w-full h-[400px] md:h-[500px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke={gridColor} />
          {/* Used CustomAngleTick component */}
          <PolarAngleAxis 
            dataKey="subject" 
            tick={<CustomAngleTick onSkillLabelClick={onSkillLabelClick} theme={theme} />} 
            axisLine={{ stroke: axisColor }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, MAX_RUBRIC_LEVEL_VALUE]} 
            tickCount={MAX_RUBRIC_LEVEL_VALUE + 1} 
            tickFormatter={tickFormatter}
            tick={{ fill: axisColor, fontSize: 10 }}
            axisLine={{ stroke: axisColor }}
          />
          <Radar name={legendName} dataKey="ratingValue" stroke={RADAR_CHART_COLORS.user} fill={RADAR_CHART_COLORS.user} fillOpacity={0.6} />
          <Legend wrapperStyle={{paddingTop: '20px', color: axisColor}} />
          <Tooltip 
            contentStyle={{ backgroundColor: tooltipBgColor, borderColor: gridColor, color: tooltipTextColor, borderRadius: '0.375rem' }}
            labelStyle={{ color: tooltipTextColor, fontWeight: 'bold' }}
            formatter={(value: number, name: string, props: any) => {
              const levelName = Object.entries(RUBRIC_LEVEL_MAP).find(([_, val]) => val === value)?.[0];
              const subject = props.payload.subject;
              return [
                <span style={{ color: tooltipTextColor }}>{`${levelName || (value === 0 ? 'Not Rated' : value)} (${value})`}</span>,
                subject
              ];
          }}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsRadarChart;
