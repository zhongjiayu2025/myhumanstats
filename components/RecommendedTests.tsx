
import React from 'react';
import Link from 'next/link';
import { GitBranch, Clock, Circle } from 'lucide-react';
import { getRelatedTests } from '@/lib/seoGrowth';
import { iconMap } from '@/lib/iconMap';

interface RecommendedTestsProps {
  currentTestId: string;
  category: string;
}

const RecommendedTests: React.FC<RecommendedTestsProps> = ({ currentTestId, category }) => {
  const recommendations = getRelatedTests(currentTestId, category);
  return (
    <div className="border-t border-zinc-800 pt-12 mt-12">
      <div className="flex items-center gap-2 mb-6">
         <GitBranch className="text-primary-500" size={20} />
         <h3 className="text-xl font-bold text-white uppercase tracking-widest">Related Tests to Try Next</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map(test => {
          const IconComponent = iconMap[test.iconName] || Circle;
          
          return (
            <Link 
              key={test.id} 
              href={`/test/${test.id}`}
              className="group block bg-zinc-900/30 border border-zinc-800 p-4 hover:bg-zinc-900 hover:border-primary-500/30 transition-all clip-corner-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-black border border-zinc-700 rounded-sm text-zinc-400 group-hover:text-primary-400 group-hover:border-primary-500/50 transition-colors">
                    <IconComponent size={18} />
                 </div>
                 <span className="text-[10px] font-mono text-zinc-600 uppercase group-hover:text-primary-500/70">{test.category}</span>
              </div>
              
              <h4 className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors mb-1 truncate">
                 {test.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                 <Clock size={10} />
                 <span>{test.estimatedTime}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedTests;
