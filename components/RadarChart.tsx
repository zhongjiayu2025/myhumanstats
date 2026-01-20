import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryScore } from '../types';

interface StatsRadarProps {
  data: CategoryScore[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/90 border border-primary-500/30 p-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="font-mono text-xs text-primary-400 uppercase tracking-wider">{data.category}</span>
          <span className="font-mono text-xs font-bold text-white">{payload[0].value}</span>
        </div>
        <div className="w-full bg-zinc-800 h-0.5 mt-1">
          <div className="bg-primary-500 h-0.5" style={{ width: `${payload[0].value}%` }}></div>
        </div>
      </div>
    );
  }
  return null;
};

const StatsRadar: React.FC<StatsRadarProps> = ({ data }) => {
  const hasData = data.some(d => d.score > 0);
  const ghostData = data.map(d => ({ ...d, score: 100 }));

  return (
    <div className="w-full h-[350px] md:h-[450px] relative select-none">
      {/* Decorative HUD Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-primary-500/20"></div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[1px] w-full bg-primary-500/20"></div>
        </div>
        {/* Outer Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border border-dashed border-zinc-800 rounded-full opacity-50"></div>
      </div>

      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur border border-zinc-800 p-4 text-center">
            <p className="text-primary-500 font-mono text-xs tracking-widest animate-pulse">AWAITING_INPUT</p>
          </div>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#27272a" strokeWidth={1} />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: '#52525b', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 500 } as any} 
            tickLine={false}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar
            name="Max"
            data={ghostData}
            dataKey="score"
            stroke="#27272a"
            strokeWidth={1}
            fill="transparent"
          />

          <Radar
            name="My Stats"
            dataKey="score"
            stroke="#06b6d4" // primary-500
            strokeWidth={2}
            fill="#06b6d4"
            fillOpacity={0.2}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsRadar;