
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RUBRIC_LEVEL_MAP, MAX_RUBRIC_LEVEL_VALUE, RubricLevel, RadarDisplaySeries } from '../types';

interface SkillsRadarChartProps {
  // chartDataForRecharts is an array of objects, where each object represents a skill
  // and contains keys for each series (e.g., rater_self: 3, rater_peer1: 4, average: 3.5)
  chartDataForRecharts: any[]; 
  seriesInfoForChart: RadarDisplaySeries[]; // Describes each series (key, name, color)
  theme: 'light' | 'dark';
  onSkillLabelClick?: (skillId: string) => void;
}

const CustomAngleTick: React.FC<any> = (props) => {
  const { x, y, payload, onSkillLabelClick, theme } = props;
  const skillId = payload.skillId; 
  const axisColor = theme === 'dark' ? '#a0aec0' : '#374151';

  const handleClick = () => {
    if (onSkillLabelClick && skillId) {
      onSkillLabelClick(skillId);
    }
  };

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
        dy={payload.index === 0 ? -4 : (payload.index === Math.floor(props.visibleTicksCount / 2) ? 4 : 0)}
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


const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({ chartDataForRecharts, seriesInfoForChart, theme, onSkillLabelClick }) => {
  if (!chartDataForRecharts || chartDataForRecharts.length === 0 || !seriesInfoForChart || seriesInfoForChart.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No skills data available to display chart, or no raters selected for comparison.</p>;
  }
  
  const tickFormatter = (value: number) => {
    const level = Object.keys(RUBRIC_LEVEL_MAP).find(key => RUBRIC_LEVEL_MAP[key as RubricLevel] === value);
    return level ? (level as string).substring(0,3) + '.' : (value === 0 ? 'N/R' : ''); 
  };

  const axisColor = theme === 'dark' ? '#a0aec0' : '#374151'; 
  const gridColor = theme === 'dark' ? '#4a5568' : '#e2e8f0'; 
  const tooltipBgColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)'; 
  const tooltipTextColor = theme === 'dark' ? '#e2e8f0' : '#334155'; 

  return (
    <div 
      className="w-full h-[400px] md:h-[500px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartDataForRecharts}>
          <PolarGrid stroke={gridColor} />
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
          {seriesInfoForChart.map((series) => (
            <Radar
              key={series.key}
              name={series.name}
              dataKey={series.key}
              stroke={series.color}
              fill={series.color}
              fillOpacity={series.isAverage ? 0.25 : 0.5} // Slightly different opacity for average
              strokeWidth={series.isAverage ? 2.5 : 1.5}
              dot={{ stroke: series.color, strokeWidth: 1, r: 2 }}
              activeDot={{ stroke: series.color, strokeWidth: 2, r: 4 }}
            />
          ))}
          <Legend wrapperStyle={{paddingTop: '20px', color: axisColor}} />
          <Tooltip 
            contentStyle={{ backgroundColor: tooltipBgColor, borderColor: gridColor, color: tooltipTextColor, borderRadius: '0.375rem' }}
            labelStyle={{ color: tooltipTextColor, fontWeight: 'bold' }}
            formatter={(value: number, name: string, props: any) => {
              // name is the dataKey of the radar series (e.g., rater_self, rater_peer123, average)
              const currentSeriesInfo = seriesInfoForChart.find(s => s.key === name);
              const seriesDisplayName = currentSeriesInfo ? currentSeriesInfo.name : name;
              const levelName = Object.entries(RUBRIC_LEVEL_MAP).find(([_, val]) => val === value)?.[0];
              
              return [
                <span style={{ color: currentSeriesInfo?.color || tooltipTextColor }}>
                  {`${levelName || (value === 0 ? 'Not Rated' : value.toFixed(1))} (${value.toFixed(1)})`}
                </span>,
                seriesDisplayName // Use the proper display name from seriesInfoForChart
              ];
            }}
            labelFormatter={(label, payload) => {
                 // label is the skill name (subject)
                if (payload && payload.length > 0 && payload[0].payload && payload[0].payload.subject) {
                    return payload[0].payload.subject;
                }
                return label;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsRadarChart;
