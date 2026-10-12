import React, { useState } from 'react';
import { 
  LockKeyhole, 
  Tv, 
  Download, 
  Search, 
  Play, 
  FileCode, 
  Server, 
  Wifi, 
  Terminal, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  Sparkles,
  Layers,
  Wrench,
  Compass,
  LayoutGrid,
  Brain,
  Plus,
  ChevronDown,
  ChevronUp,
  Target,
  Globe,
  Minus
} from 'lucide-react';
import { SERVICE_LAUNCHERS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigateToSettings: (serviceId: string) => void;
  activeTab: string;
  setActiveTab: (tab: 'setup' | 'browse' | 'watchlist' | 'networking' | 'alfred_study' | 'settings') => void;
  isFinalized: boolean;
  isDevMode: boolean;
  setIsDevMode: (val: boolean) => void;
}

export default function Sidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  onNavigateToSettings,
  activeTab,
  setActiveTab,
  isFinalized,
  isDevMode,
  setIsDevMode
}: SidebarProps) {
  const [isEditingArmory, setIsEditingArmory] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    watch: true,
    network: true,
    ai: true,
    batnet: true
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Brand SVG logos for each service
  const renderBrandLogo = (id: string, className = "h-4.5 w-4.5 shrink-0") => {
    switch (id) {
      case 'jellyseerr':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" className="stroke-rose-500" />
            <path d="m21 21-4.3-4.3" className="stroke-rose-500" />
            <circle cx="11" cy="11" r="3" className="fill-rose-500/20 stroke-none" />
          </svg>
        );
      case 'jellyfin':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" className="fill-purple-600/10 stroke-purple-500" strokeWidth="2" />
            <path d="M10 8.5v7l5.5-3.5-5.5-3.5Z" className="fill-purple-400" />
          </svg>
        );
      case 'qbittorrent':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="18" height="18" x="3" y="3" rx="4.5" className="fill-sky-600" />
            <path d="M8 12.5a4 4 0 0 1 8 0m-8 0a4 4 0 0 0 8 0" className="stroke-white" strokeWidth="2" />
            <circle cx="12" cy="12" r="2" className="fill-white" />
          </svg>
        );
      case 'prowlarr':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" className="stroke-amber-500" />
            <circle cx="12" cy="12" r="5" className="stroke-amber-500/40" />
            <path d="M12 3v9l4 4" className="stroke-amber-400" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'radarr':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" className="fill-rose-600/10 stroke-rose-500" strokeWidth="2" />
            <path d="M12 6v12M6 12h12" className="stroke-rose-400/70" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3.5" className="fill-rose-500 stroke-none" />
          </svg>
        );
      case 'sonarr':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="7" width="3" height="10" rx="1" className="fill-cyan-500" />
            <rect x="10.5" y="4" width="3" height="16" rx="1" className="fill-cyan-400" />
            <rect x="16" y="9" width="3" height="8" rx="1" className="fill-cyan-650" />
          </svg>
        );
      case 'bazarr':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="5" width="16" height="14" rx="2.5" className="stroke-yellow-500 fill-yellow-500/5" />
            <path d="M8 9h8M8 13h5" className="stroke-yellow-400" strokeLinecap="round" />
          </svg>
        );
      case 'aiostreams':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="18" height="18" x="3" y="3" rx="4" className="fill-violet-600" />
            <path d="M8.5 7.5L14.5 12L8.5 16.5V7.5Z" className="fill-white" />
          </svg>
        );
      case 'mediaflow':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12C8 7 11 17 16 12C21 7 23 12 23 12" stroke="currentColor" strokeWidth="2.5" className="stroke-indigo-400" strokeLinecap="round" />
            <circle cx="16" cy="12" r="2.5" className="fill-indigo-500 stroke-none" />
          </svg>
        );
      case 'firefox':
        return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8 2 5 5 5 9s3 6 4 8c0 0 3-4 6-2 0 0-4 1-5 4 0 0 5-2 9-5C22 9 16 2 12 2z" className="stroke-orange-500"/></svg>;
      case 'chrome':
        return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" className="stroke-blue-500"/><path d="M12 15L9 20M15 15L18 20M12 9L15 4M9 9L6 4" className="stroke-red-500"/></svg>;
      case 'github':
        return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.35-1.33-3.35-1.33-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.09.38-1.98 1.01-2.67-.1-.25-.44-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.54 1.37.2 2.39.1 2.64.63.69 1.01 1.58 1.01 2.67 0 3.82-2.33 4.67-4.55 4.92.36.31.69.93.69 1.86v2.77c0 .28.16.6.66.5C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z"/></svg>;
      case 'appflowly':
        return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></svg>;
      default:
        return <Terminal className={className} />;
    }
  };

  const findYourNextWatchSvc = SERVICE_LAUNCHERS.find(s => s.id === 'jellyseerr');
  const stremioServices = SERVICE_LAUNCHERS.filter(s => s.id === 'aiostreams' || s.id === 'mediaflow');
  const mediaTools = SERVICE_LAUNCHERS.filter(s => s.id === 'jellyfin' || s.id === 'qbittorrent' || s.id === 'prowlarr' || s.id === 'radarr' || s.id === 'sonarr' || s.id === 'bazarr');
  const networkTools = SERVICE_LAUNCHERS.filter(s => s.id.includes('vpn') || s.id.includes('tailscale') || s.id === 'wireguard' || s.id === 'gluetun' || s.id === 'docker');
  const aiTools = SERVICE_LAUNCHERS.filter(s => s.id.includes('ai') || s.id === 'alfred');
  const batnetTools = SERVICE_LAUNCHERS.filter(s => s.id === 'firefox' || s.id === 'chrome' || s.id === 'github' || s.id === 'appflowly');

  return (
    <aside 
      className={`bg-neutral-950/80 backdrop-blur-2xl border-r border-neutral-800/50 flex flex-col justify-between transition-all duration-300 relative shrink-0 z-20 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      
      {/* Top Header Row */}
      <div className="flex flex-col">
        <div className="p-5 border-b border-neutral-800/60 flex items-center justify-between bg-neutral-900/40">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="bg-indigo-950/50 p-1.5 rounded-lg border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              </div>
              <span className="text-sm font-bold uppercase tracking-widest font-display text-white">Armory</span>
              <button onClick={() => setIsEditingArmory(!isEditingArmory)} className={`ml-auto p-1 rounded-md ${isEditingArmory ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                <Wrench className="h-3 w-3" />
              </button>
            </div>
          )}
          <button 
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-zinc-400 hover:text-white transition-all mx-auto lg:mx-0 flex items-center justify-center cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-4">
        </div>

        {/* Services launcher lists */}
        <div className="px-4 py-2 space-y-4 overflow-y-auto font-sans select-none">
          
          {/* CATEGORY: CAVE CINEMA */}
          <div className="space-y-1">
            {!isCollapsed && (
              <button onClick={() => toggleCategory('watch')} className="w-full flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono hover:text-white px-2 py-1">
                <span className="flex items-center gap-1.5"><Tv className="h-3 w-3" /> Cave Cinema</span>
                {openCategories.watch ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
            <AnimatePresence>
              {(isCollapsed || openCategories.watch) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-0.5">
                   {[...(findYourNextWatchSvc ? [findYourNextWatchSvc] : []), ...mediaTools].map(svc => (
                      <div key={svc.id} className="group flex items-center gap-3 rounded-lg hover:bg-neutral-900/60 transition-all p-2 cursor-pointer border border-transparent hover:border-neutral-800/50" onClick={() => onNavigateToSettings(svc.id)}>
                        {renderBrandLogo(svc.id)}
                        {!isCollapsed && <h4 className="text-xs font-bold truncate text-zinc-400 group-hover:text-white">{svc.name}</h4>}
                      </div>
                   ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CATEGORY: GOTHAM GRID */}
          <div className="space-y-1">
            {!isCollapsed && (
              <button onClick={() => toggleCategory('network')} className="w-full flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono hover:text-white border-t border-neutral-800/40 pt-3 px-2 py-1">
                <span className="flex items-center gap-1.5"><Wifi className="h-3 w-3" /> Gotham Grid</span>
                {openCategories.network ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
            <AnimatePresence>
              {(isCollapsed || openCategories.network) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-0.5">
                   {[...networkTools, ...stremioServices].map(svc => (
                      <div key={svc.id} className="group flex items-center gap-3 rounded-lg hover:bg-neutral-900/60 transition-all p-2 cursor-pointer border border-transparent hover:border-neutral-800/50" onClick={() => onNavigateToSettings(svc.id)}>
                        {isEditingArmory && <button className="text-rose-500 hover:text-rose-400"><Minus className="h-3 w-3" /></button>}
                        {renderBrandLogo(svc.id)}
                        {!isCollapsed && <h4 className="text-xs font-bold truncate text-zinc-400 group-hover:text-white">{svc.name}</h4>}
                      </div>
                   ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CATEGORY: AI */}
          <div className="space-y-1">
            {!isCollapsed && (
              <button onClick={() => toggleCategory('ai')} className="w-full flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono hover:text-white border-t border-neutral-800/40 pt-3 px-2 py-1">
                <span className="flex items-center gap-1.5"><Brain className="h-3 w-3" /> Alfred A.I. Tools</span>
                {openCategories.ai ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
            <AnimatePresence>
              {(isCollapsed || openCategories.ai) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-0.5">
                   {aiTools.map(svc => (
                      <div key={svc.id} className="group flex items-center gap-3 rounded-lg hover:bg-neutral-900/60 transition-all p-2 cursor-pointer border border-transparent hover:border-neutral-800/50" onClick={() => onNavigateToSettings(svc.id)}>
                        {isEditingArmory && <button className="text-rose-500 hover:text-rose-400"><Minus className="h-3 w-3" /></button>}
                        {renderBrandLogo(svc.id)}
                        {!isCollapsed && <h4 className="text-xs font-bold truncate text-zinc-400 group-hover:text-white">{svc.name}</h4>}
                      </div>
                   ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CATEGORY: BATNET */}
          <div className="space-y-1">
            {!isCollapsed && (
              <button onClick={() => toggleCategory('batnet')} className="w-full flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono hover:text-white border-t border-neutral-800/40 pt-3 px-2 py-1">
                <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> Batnet</span>
                {openCategories.batnet ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
            <AnimatePresence>
              {(isCollapsed || openCategories.batnet) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-0.5">
                   {batnetTools.map(svc => (
                      <div key={svc.id} className="group flex items-center gap-3 rounded-lg hover:bg-neutral-900/60 transition-all p-2 cursor-pointer border border-transparent hover:border-neutral-800/50" onClick={() => onNavigateToSettings(svc.id)}>
                        {isEditingArmory && <button className="text-rose-500 hover:text-rose-400"><Minus className="h-3 w-3" /></button>}
                        {renderBrandLogo(svc.id)}
                        {!isCollapsed && <h4 className="text-xs font-bold truncate text-zinc-400 group-hover:text-white">{svc.name}</h4>}
                      </div>
                   ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ADD TOOL BUTTON */}
          <div className="pt-2 border-t border-neutral-800/40">
             <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-neutral-700 text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all text-xs font-bold uppercase tracking-wider">
               <Plus className="h-3 w-3" /> Add Tool
             </button>
          </div>
        </div>
      </div>
      
      {/* Dev Mode toggle (simplified to match Armory feel) */}
      <div className="p-4 border-t border-neutral-800/60 space-y-3 font-sans text-xs">
        
        {/* Dev Mode toggle button */}
        {!isCollapsed ? (
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase font-mono text-zinc-500 flex items-center gap-1">
                <Wrench className="h-3 w-3" /> Dev Mode
              </span>
              <span className={`h-1.5 w-1.5 rounded-full ${isDevMode ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-700'}`}></span>
            </div>
            
            <button 
              onClick={() => setIsDevMode(!isDevMode)}
              className={`w-full text-[10px] font-bold uppercase py-1 px-2 rounded-lg border font-mono transition-all text-center cursor-pointer ${
                isDevMode 
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' 
                  : 'bg-neutral-950 border-neutral-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {isDevMode ? 'Active' : 'Enable'}
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsDevMode(!isDevMode)}
            className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all mx-auto cursor-pointer ${
              isDevMode 
                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' 
                : 'bg-neutral-950 border-neutral-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title={`Toggle Developer Mode (${isDevMode ? 'ON' : 'OFF'})`}
          >
            <Wrench className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}