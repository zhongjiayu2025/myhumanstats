
import React from 'react';
import Link from 'next/link';
import { GitBranch, Clock, Circle } from 'lucide-react';
import { TESTS } from '@/lib/data'; // Use new data source
import { iconMap } from '@/lib/iconMap';

interface RecommendedTestsProps {
  currentTestId: string;
  category: string;
}

const RecommendedTests: React.FC<RecommendedTestsProps> = ({ currentTestId, category }) => {
  // Logic: 
  // 1. Get tests from same category
  // 2. Exclude current
  // 3. Limit to 3
  // 4. If less than 3, fill with random tests from other categories
  
  const sameCategory = TESTS.filter(t => t.category === category && t.id !== currentTestId);
  const others = TESTS.filter(t => t.category !== category && t.id !== currentTestId);
  
  // Shuffle logic roughly
  const recommendations = [...sameCategory].slice(0, 3);
  
  if (recommendations.length < 3) {
    const needed = 3 - recommendations.length;
    recommendations.push(...others.slice(0, needed));
  }

  return (
    <div className="border-t border-zinc-800 pt-12 mt-12">
      <div className="flex items-center gap-2 mb-6">
         <GitBranch className="text-primary-500" size={20} />
         <h3 className="text-xl font-bold text-white uppercase tracking-widest">Recommended Modules</h3>
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
