
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Shield, Terminal, Zap, BookOpen, Search, Command, Settings, Monitor, ZapOff, Download, Upload, Home, Wrench } from 'lucide-react';
import CommandPalette from './CommandPalette';
import LiveTicker from './LiveTicker';
import { useSettings } from '../lib/settings';
import { exportUserData, importUserData } from '../lib/core';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw || ''; // Handle potential null
  
  const isDashboard = pathname === '/';
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { reducedMotion, setReducedMotion, showScanlines, setShowScanlines, highContrast, mounted } = useSettings();

  // Global Key Listener for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importUserData(file);
        alert("Data restored successfully.");
        window.location.reload();
      } catch (err) {
        alert("Failed to import data. Invalid file format.");
      }
    }
  };

  const NavItem = ({ to, icon: Icon, label, active }: any) => (
    <Link 
      href={to} 
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? 'text-primary-400' : 'text-zinc-400 hover:text-zinc-300'}`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={20} aria-hidden="true" />
      <span className="text-[10px] font-mono uppercase tracking-wide">{label}</span>
    </Link>
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans relative overflow-hidden bg-background ${highContrast ? 'contrast-125' : ''}`}>
      
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />

      {/* Accessibility Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-primary-500 text-black font-bold clip-corner-sm"
      >
        Skip to Main Content
      </a>
      
      {/* Global VFX - Render only when mounted to match client state */}
      {mounted && showScanlines && <div className="scanlines print:hidden" aria-hidden="true"></div>}
      <div className="vignette print:hidden" aria-hidden="true"></div>
      
      {mounted && !reducedMotion && (
        <>
          <div className="fixed inset-0 bg-grid z-0 pointer-events-none print:hidden" aria-hidden="true" />
          <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none z-0 print:hidden" aria-hidden="true" />
        </>
      )}

      {/* Technical Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/90 backdrop-blur-md print:hidden" role="banner">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" aria-label="MyHumanStats Home">
            {/* Logo Container */}
            <div className="relative flex items-center justify-center w-10 h-10 bg-surface border border-white/10 clip-corner-sm overflow-hidden group-hover:border-primary-500/50 transition-all" aria-hidden="true">
              <Activity className="text-primary-400 w-5 h-5 z-10" />
              {mounted && !reducedMotion && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-400/20 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out" />
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white leading-none font-mono">
                MHS<span className="text-primary-500">_ORG</span>
              </span>
              <span className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mt-0.5">Quantify Yourself</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-1 bg-surface/50 p-1 border border-white/5 rounded-none clip-corner-sm" role="navigation">
              <Link 
                href="/" 
                className={`px-4 py-1.5 text-xs font-mono transition-all clip-corner-sm ${isDashboard ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                aria-current={isDashboard ? 'page' : undefined}
              >
                [DASHBOARD]
              </Link>
              <Link 
                href="/tools" 
                className={`px-4 py-1.5 text-xs font-mono transition-all clip-corner-sm ${pathname.startsWith('/tools') ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                aria-current={pathname.startsWith('/tools') ? 'page' : undefined}
              >
                [TOOLS]
              </Link>
              <Link 
                href="/blog" 
                className={`px-4 py-1.5 text-xs font-mono transition-all clip-corner-sm ${pathname.startsWith('/blog') ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                aria-current={pathname.startsWith('/blog') ? 'page' : undefined}
              >
                [BLOG]
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setIsPaletteOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-all group"
                  aria-label="Open Command Palette (Search)"
               >
                  <Search size={12} aria-hidden="true" />
                  <span className="hidden lg:inline">Search...</span>
                  <div className="hidden lg:flex items-center gap-0.5 ml-2 px-1 bg-zinc-800 rounded border border-zinc-700 text-[10px] font-mono group-hover:bg-zinc-700" aria-hidden="true">
                     <Command size={8} /> K
                  </div>
               </button>

                <div className="relative">
                    <button 
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`p-2 rounded hover:bg-zinc-800 transition-colors ${isSettingsOpen ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
                        aria-label="Open Settings"
                        aria-expanded={isSettingsOpen}
                    >
                        <Settings size={16} aria-hidden="true" />
                    </button>
                    
                    {isSettingsOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-black border border-zinc-700 shadow-2xl rounded-lg p-3 z-50 animate-in fade-in zoom-in-95" role="dialog" aria-label="Settings Menu">
                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 pb-2 border-b border-zinc-800">
                                Visual & Accessibility
                            </div>
                            <div className="space-y-2 mb-4">
                                <button 
                                    onClick={() => setReducedMotion(!reducedMotion)}
                                    className="w-full flex items-center justify-between text-left p-2 hover:bg-zinc-900 rounded text-xs text-zinc-300"
                                    role="switch"
                                    aria-checked={reducedMotion}
                                >
                                    <div className="flex items-center gap-2"><ZapOff size={14} /> Reduced Motion</div>
                                    <div className={`w-2 h-2 rounded-full ${reducedMotion ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                                </button>
                                <button 
                                    onClick={() => setShowScanlines(!showScanlines)}
                                    className="w-full flex items-center justify-between text-left p-2 hover:bg-zinc-900 rounded text-xs text-zinc-300"
                                    role="switch"
                                    aria-checked={showScanlines}
                                >
                                    <div className="flex items-center gap-2"><Monitor size={14} /> Scanlines</div>
                                    <div className={`w-2 h-2 rounded-full ${showScanlines ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                                </button>
                            </div>

                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 pb-2 border-b border-zinc-800">
                                Data Management
                            </div>
                            <div className="space-y-2">
                                <button 
                                    onClick={exportUserData}
                                    className="w-full flex items-center gap-2 p-2 hover:bg-zinc-900 rounded text-xs text-zinc-300"
                                >
                                    <Download size={14} /> Backup Data (JSON)
                                </button>
                                <button 
                                    onClick={handleImportClick}
                                    className="w-full flex items-center gap-2 p-2 hover:bg-zinc-900 rounded text-xs text-zinc-300"
                                >
                                    <Upload size={14} /> Restore Data
                                </button>
                                <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  accept=".json" 
                                  onChange={handleFileChange}
                                  aria-hidden="true"
                                />
                            </div>
                        </div>
                    )}
                </div>

               <div className="hidden md:flex flex-col items-end" aria-hidden="true">
                  <div className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                     <span className="text-[10px] text-zinc-400 font-mono tracking-widest">ONLINE</span>
                  </div>
                  <span className="text-[9px] text-zinc-600 font-mono">V.2.2.1</span>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-24 md:pb-16 z-20 relative outline-none" tabIndex={-1} role="main">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-lg border-t border-zinc-800 z-50 md:hidden flex justify-around items-center px-2" role="navigation" aria-label="Mobile Navigation">
        <NavItem to="/" icon={Home} label="Home" active={pathname === '/'} />
        <NavItem to="/tools" icon={Wrench} label="Tools" active={pathname.startsWith('/tools')} />
        <NavItem to="/blog" icon={BookOpen} label="Blog" active={pathname.startsWith('/blog')} />
        <button 
          onClick={() => setIsPaletteOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-zinc-400 hover:text-zinc-300"
          aria-label="Search"
        >
          <Search size={20} aria-hidden="true" />
          <span className="text-[10px] font-mono uppercase tracking-wide">Search</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="hidden md:block border-t border-white/5 bg-black z-20 mt-auto pt-12 pb-12 print:hidden" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
             
             {/* Col 1: Brand */}
             <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                   <Activity size={16} className="text-primary-500" aria-hidden="true" />
                   <span className="text-sm font-bold text-white">MyHumanStats</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                   Scientific benchmarking tools for the digital age. Local-first privacy architecture.
                </p>
                <div className="flex flex-col gap-2" aria-hidden="true">
                   <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-mono uppercase tracking-wider">
                      <Terminal size={10} />
                      <span>System Status: Optimal</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono uppercase">
                      <Shield size={10} />
                      <span>Local_Storage_Only</span>
                   </div>
                </div>
             </div>

             {/* Col 2: Categories */}
             <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Categories</h4>
                <ul className="space-y-2 text-xs text-zinc-400">
                   <li><Link href="/category/auditory" className="hover:text-primary-400 transition-colors">Auditory Tests</Link></li>
                   <li><Link href="/category/visual" className="hover:text-primary-400 transition-colors">Visual Tests</Link></li>
                   <li><Link href="/category/cognitive" className="hover:text-primary-400 transition-colors">Cognitive Tests</Link></li>
                   <li><Link href="/category/personality" className="hover:text-primary-400 transition-colors">Personality Tests</Link></li>
                </ul>
             </div>

             {/* Col 3: Research */}
             <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Knowledge Base</h4>
                <ul className="space-y-2 text-xs text-zinc-400">
                   <li><Link href="/statistics" className="hover:text-primary-400 transition-colors">Global Benchmarks</Link></li>
                   <li><Link href="/tools" className="hover:text-primary-400 transition-colors">Utilities & Tools</Link></li>
                   <li><Link href="/blog" className="hover:text-primary-400 transition-colors">Research Log</Link></li>
                   <li><Link href="/glossary" className="hover:text-primary-400 transition-colors">System Codex</Link></li>
                </ul>
             </div>

             {/* Col 4: Legal */}
             <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Legal</h4>
                <ul className="space-y-2 text-xs text-zinc-400">
                   <li><Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                   <li><Link href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                   <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Contact Support</Link></li>
                </ul>
             </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
               © 2026 MyHumanStats. All systems nominal.
             </div>
             <div className="flex gap-4">
                <Link href="/tools/tone-generator" className="text-zinc-600 hover:text-white transition-colors" aria-label="Tone Generator"><Zap size={14} /></Link>
                <Link href="/tools/bpm-counter" className="text-zinc-600 hover:text-white transition-colors" aria-label="BPM Counter"><Activity size={14} /></Link>
                <Link href="/glossary" className="text-zinc-600 hover:text-white transition-colors" aria-label="Glossary"><BookOpen size={14} /></Link>
             </div>
          </div>
        </div>
      </footer>
      
      {mounted && !reducedMotion && <LiveTicker />}
    </div>
  );
};

export default Layout;
