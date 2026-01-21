import { TestCategory, UserStats, CategoryScore, TestDefinition } from '../types';
import { TESTS } from './data'; // Import types or data if needed for calculations, but here we just need to re-export or use it for calc.
// Ideally, getStats shouldn't depend on TESTS data structure to keep it light, but calculateCategoryScores needs it.
// We will import it here, but since this file is small, it's fine. The key is that `CommandPalette` DOES NOT import this file anymore if it can avoid it.
// Actually, `CommandPalette` imported `TESTS` from here. Now it uses `searchIndex`.
// Client components that need `getStats` will import this. 
// If this imports `data.ts`, then `getStats` brings in `data.ts`.
// So we must move `TESTS` import ONLY to `calculateCategoryScores`.

// --- Helper for High DPI Canvas Rendering ---
export const setupHiDPICanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
  const dpr = window.devicePixelRatio || 1;
  
  // Set the internal resolution matches screen density
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  
  // Set the CSS size to match the layout
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  // Scale the context so drawing operations happen in logical pixels
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  return ctx;
};

// Re-export TESTS from data so existing imports don't break immediately, 
// BUT we should update imports to point to data.ts where possible for clarity.
// For now, let's keep it here but we know we moved the definition to data.ts
export { TESTS } from './data'; 

const STORAGE_KEY = 'mhs_user_stats';
const HISTORY_KEY = 'mhs_history';

export const getStats = (): UserStats => {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to load stats", e);
    return {};
  }
};

export interface HistoryEntry {
  timestamp: number;
  score: number; // 0-100 normalized
  raw?: number;  // The actual raw value (e.g. 215ms, 17000Hz)
}

export const getHistory = (testId: string): HistoryEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    const allHistory = data ? JSON.parse(data) : {};
    return allHistory[testId] || [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveStat = (testId: string, score: number, rawValue?: number) => {
  if (typeof window === 'undefined') return;
  try {
    // 1. Update Current Score
    const current = getStats();
    const updated = { ...current, [testId]: score };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 2. Push to History
    const historyData = localStorage.getItem(HISTORY_KEY);
    const allHistory = historyData ? JSON.parse(historyData) : {};
    const testHistory = allHistory[testId] || [];
    
    // Create new entry, including raw value if provided
    const newEntry: HistoryEntry = { 
        timestamp: Date.now(), 
        score 
    };
    if (rawValue !== undefined) {
        newEntry.raw = rawValue;
    }

    // Limit history to last 50 entries to avoid bloat
    const newHistory = [...testHistory, newEntry].slice(-50);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify({ ...allHistory, [testId]: newHistory }));

    window.dispatchEvent(new Event('storage-update'));
  } catch (e) {
    console.error("Failed to save stat", e);
  }
};

export const calculateCategoryScores = (stats: UserStats): CategoryScore[] => {
  // We need TESTS here to categorize.
  // Dynamically require to avoid top-level bundle impact if possible? 
  // No, imports are static. We must import TESTS.
  // Ideally this function should be run on Server? No, stats are in LocalStorage.
  // So the Client Bundle MUST contain the categorization logic.
  // We can optimize by importing a lightweight "Test Categories Map" instead of full TESTS.
  // But for now, importing TESTS from data.ts is the way.
  // const { TESTS } = require('./data'); // CommonJS require inside function? Or just import top level.
  // Let's stick to standard import at top, assuming data.ts is now separate.
  
  const categories = Object.values(TestCategory);
  
  return categories.map(cat => {
    const testsInCat = (TESTS as TestDefinition[]).filter(t => t.category === cat);
    if (testsInCat.length === 0) return { category: cat, score: 0, completed: 0, total: 0 };

    let totalScore = 0;
    let completedCount = 0;

    testsInCat.forEach(test => {
      if (stats[test.id] !== undefined) {
        totalScore += stats[test.id];
        completedCount++;
      }
    });

    const average = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

    return {
      category: cat,
      score: average,
      completed: completedCount,
      total: testsInCat.length
    };
  });
};

export const exportUserData = () => {
  try {
    const stats = localStorage.getItem(STORAGE_KEY);
    const history = localStorage.getItem(HISTORY_KEY);
    const data = {
      stats: stats ? JSON.parse(stats) : {},
      history: history ? JSON.parse(history) : {},
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mhs-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Export failed", e);
    alert("Failed to export data.");
  }
};

export const importUserData = (file: File) => {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.stats) localStorage.setItem(STORAGE_KEY, JSON.stringify(json.stats));
        if (json.history) localStorage.setItem(HISTORY_KEY, JSON.stringify(json.history));
        window.dispatchEvent(new Event('storage-update'));
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};