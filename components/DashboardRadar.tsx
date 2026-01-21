
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getStats, calculateCategoryScores } from '@/lib/core';
import { UserStats, CategoryScore } from '@/types';
import RadarSkeleton from './RadarSkeleton';

// Dynamically import the heavy Recharts component
const StatsRadar = dynamic(() => import('@/components/RadarChart'), { 
  ssr: false,
  loading: () => <RadarSkeleton />
});

const DashboardRadar = () => {
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = () => {
        const s = getStats();
        setCategoryScores(calculateCategoryScores(s));
        setIsLoaded(true);
    };
    
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  if (!isLoaded) return <RadarSkeleton />;

  return <StatsRadar data={categoryScores} />;
};

export default DashboardRadar;
