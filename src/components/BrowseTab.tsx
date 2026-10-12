import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Film, 
  Tv, 
  Plus, 
  Check, 
  Play, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  History, 
  HelpCircle,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BROWSE_CATALOG } from '../data';
import { MediaRequest, CatalogItem } from '../types';

interface BrowseTabProps {
  watchlist: MediaRequest[];
  onRequestMedia: (media: { title: string; type: 'movie' | 'tv'; posterUrl: string }) => void;
  isFinalized: boolean;
}

interface WatchedHistoryItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  director?: string;
  genres: string[];
  posterUrl: string;
  feedback?: 'up' | 'down';
  watchedAt: string;
}

const ALFRED_RECS_ANNOTATIONS: Record<string, string> = {
  m1: "Blade Runner 2049 is an absolute visual and philosophical masterpiece, Master Wayne. Denis Villeneuve explores what makes a soul. I find the quiet, rain-slicked atmosphere highly reminiscent of your evening patrols.",
  m2: "A grim affair, sir. Se7en is David Fincher's gritty testament to criminal minds. I recommend keeping a light on; Gotham has quite enough shadow as it is.",
  m3: "Prisoners is a tense study of despair and justice, Master Wayne. Hugh Jackman's desperation is visceral. It does raise the question of how far one should go to protect their family.",
  m4: "Inception is Nolan at his absolute peak of cerebral clockwork. An extraordinary heist within the mind, sir. Though, if I may, keeping track of dream layers feels quite similar to managing your multiple secret bank accounts.",
  m5: "The Batman, sir. A rather uncanny resemblance to your own nocturnal activities. The director captured the rain and neon of Gotham beautifully. I do hope you don't find it too narcissistic to watch a film about yourself.",
  m6: "Memento is a fascinating puzzle, Master Wayne. A man who cannot make new memories searching for his wife's killer. Nolan's reverse-chronological structure is quite brilliant, though it may remind you of how you organize your physical case files.",
  m7: "Zodiac is a meticulous, absorbing pursuit of an enigma, Master Wayne. Fincher's dedication to the real investigation files is quite remarkable. It is the gold standard of detective work, next to yours, of course.",
  m8: "A chilling look at late-night sensationalism, sir. Nightcrawler features a scavenger of human tragedy. It is a cautionary tale about what lurks in the city's underbelly after dark.",
  t1: "True Detective Season 1 is a gothic, cosmic-noir absolute masterpiece, Master Wayne. Matthew McConaughey's Rust Cohle is exceptionally philosophical. I must say, his pessimistic monologues remind me of your mood on particularly cold mornings.",
  t2: "Mindhunter is an exceptional exploration of behavioral science, sir. David Fincher traces the birth of serial killer profiling. I believe the FBI's methods could prove highly useful for fine-tuning our own Batcomputer threat tracking protocols.",
  t3: "Severance is a stunning, slow-burn corporate thriller, sir. Work-life balance taken to its literal, dystopian extreme. I do hope you don't get any ideas about severing my personal memories of your childhood, Master Wayne.",
  t4: "Fargo is a delightful, snow-covered dark comedy, Master Wayne. Bizarre crimes and polite Midwesterners. It serves as a pleasant reminder that crime can be delightfully foolish compared to the theatrical villains you encounter in Gotham."
};

const ALL_GENRES = ["Neo-Noir", "Cyberpunk", "Sci-Fi", "Gritty Crime", "Psychological Thriller", "Mystery", "Drama", "Action", "Suspense", "Thriller", "Comedy", "Adventure", "Fantasy", "Documentary", "Horror", "Biography", "History"];
const ALL_SERVICES = ["Netflix", "HBO Max", "Prime Video", "Apple TV+", "Hulu"];

export default function BrowseTab({ watchlist, onRequestMedia, isFinalized }: BrowseTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Advanced search filters / Detective Mode
  const [isDetectiveMode, setIsDetectiveMode] = useState(false);
  const [checkedGenres, setCheckedGenres] = useState<string[]>([]);
  const [checkedServices, setCheckedServices] = useState<string[]>([]);
  const [checkedTypes, setCheckedTypes] = useState<string[]>([]);

  // Alfred's Picks selection
  const [alfredPicks, setAlfredPicks] = useState<CatalogItem[]>([]);
  const [activePickId, setActivePickId] = useState<string | null>(null);
  const [refreshingPicks, setRefreshingPicks] = useState(false);

  // Initializing Alfred's Picks
  useEffect(() => {
    handleRefreshPicks(true);
  }, []);

  const handleRefreshPicks = (silent = false) => {
    setRefreshingPicks(true);
    setTimeout(() => {
      const shuffled = [...BROWSE_CATALOG].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      setAlfredPicks(selected);
      setActivePickId(selected[0]?.id || null);
      setRefreshingPicks(false);
      
      if (!silent) {
        setAlfredResponse("I have prepared a fresh rotation of curations for your consideration, Master Wayne.");
      }
    }, 500);
  };

  // Watch History State - Initialized with rich, self-hosted watched records
  const [watchHistory, setWatchHistory] = useState<WatchedHistoryItem[]>([
    {
      id: 'h1',
      title: "Dune: Part Two",
      type: "movie",
      director: "Denis Villeneuve",
      genres: ["Sci-Fi", "Adventure", "Action"],
      posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=300",
      watchedAt: "Yesterday, 9:30 PM"
    },
    {
      id: 'h2',
      title: "Oppenheimer",
      type: "movie",
      director: "Christopher Nolan",
      genres: ["Biography", "Drama", "History"],
      posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=300",
      feedback: 'up',
      watchedAt: "3 days ago"
    },
    {
      id: 'h3',
      title: "The Last of Us (Season 1)",
      type: "tv",
      genres: ["Drama", "Sci-Fi", "Thriller"],
      posterUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=300",
      watchedAt: "Last week"
    }
  ]);

  // Toast notification message from Alfred when user clicks thumbs up/down
  const [alfredResponse, setAlfredResponse] = useState<string | null>(
    "I have updated your cinema preference profiles, Master Wayne. Our recommended feeds are fine-tuning."
  );

  // Filter Catalog Items based on Standard or Detective mode rules
  const filteredCatalog = BROWSE_CATALOG.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.genre.toLowerCase().includes(searchQuery.toLowerCase());
    
    console.log("Filtering:", item.title, "Matches:", matchesSearch);
    if (!matchesSearch) return false;

    if (isDetectiveMode) {
      // Check multiple checkbox conditions (AND filters)
      if (checkedTypes.length > 0 && !checkedTypes.includes(item.type)) {
        return false;
      }
      if (checkedServices.length > 0 && !checkedServices.includes(item.service)) {
        return false;
      }
      if (checkedGenres.length > 0) {
        const itemGenres = item.genre.split(', ').map(g => g.trim());
        const hasMatchingGenre = checkedGenres.some(g => itemGenres.includes(g));
        if (!hasMatchingGenre) return false;
      }
      return true;
    } else {
      // Standard Category mode
      if (selectedCategory === 'All') return true;
      
      if (selectedCategory === 'Cerebral Realities') {
        return item.genre.includes('Sci-Fi') || item.genre.includes('Psychological Thriller') || item.genre.includes('Cyberpunk');
      }
      if (selectedCategory === 'Midnight Grime') {
        return item.genre.includes('Neo-Noir') || item.genre.includes('Gritty Crime') || item.genre.includes('Mystery');
      }
      if (selectedCategory === 'Nolan') {
        return item.genre.includes('Heist') || item.title === 'Memento' || item.title === 'Inception';
      }
      if (selectedCategory === 'Oracle') {
        return item.genre.includes('Mystery') || item.genre.includes('Suspense') || item.title === 'Severance' || item.title === 'Zodiac';
      }
      
      return true;
    }
  });

  const getWatchlistItemStatus = (title: string) => {
    return watchlist.find(item => item.title.toLowerCase() === title.toLowerCase());
  };

  // Handle watch history thumbs up / thumbs down
  const handleFeedback = (id: string, feedbackType: 'up' | 'down') => {
    setWatchHistory(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, feedback: item.feedback === feedbackType ? undefined : feedbackType };
      }
      return item;
    }));

    const clickedItem = watchHistory.find(item => item.id === id);
    if (!clickedItem) return;

    if (feedbackType === 'up') {
      if (clickedItem.title.includes("Dune") || clickedItem.director === "Denis Villeneuve") {
        setAlfredResponse("Superb choice, Master Wayne. I have instructed the indexers to prioritize Denis Villeneuve's high-contrast atmospheric cinematic masterpieces.");
      } else if (clickedItem.title.includes("Oppenheimer") || clickedItem.director === "Christopher Nolan") {
        setAlfredResponse("Indeed, Sir. Christopher Nolan's non-linear cerebral narrative style is highly fitting for your evening watches. Recommending Inception and Memento.");
      } else {
        setAlfredResponse(`Understood, Master. I have noted your thumbs up for "${clickedItem.title}" and will optimize our automated lists accordingly.`);
      }
    } else {
      setAlfredResponse(`Very good, Master. I shall demote similar topics from your dashboard recommendation profile immediately.`);
    }

    // Auto-dim response banner after a few seconds
    setTimeout(() => {
      setAlfredResponse(null);
    }, 6000);
  };

  const activePick = alfredPicks.find(p => p.id === activePickId);

  // Checkbox toggle helpers
  const toggleGenre = (genre: string) => {
    setCheckedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const toggleService = (service: string) => {
    setCheckedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const toggleType = (type: string) => {
    setCheckedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearAllFilters = () => {
    setCheckedGenres([]);
    setCheckedServices([]);
    setCheckedTypes([]);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/40 border border-neutral-800 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider font-mono">
            <Sparkles className="h-3 w-3" /> Special Curations for Master Wayne
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-none font-sans">
            Wayne Library. <span className="text-yellow-500 font-medium font-serif italic">Seamlessly secured.</span>
          </h2>
          <p className="text-zinc-400 text-xs font-sans leading-relaxed">
            Welcome to your secure media library catalog, Master Wayne. Use our curations or activate Detective Mode for multi-filter scanning, then authorize Alfred to fetch media secure behind your Gluetun VPN.
          </p>
        </div>
        <div className="hidden lg:block shrink-0 relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 opacity-20 blur-lg" />
          <div className="h-24 w-24 rounded-full border border-neutral-750 bg-neutral-900 flex items-center justify-center relative overflow-hidden shadow-lg">
            {/* Batman Logo Badge */}
            <svg className="h-10 w-16 text-yellow-500 fill-current" viewBox="0 0 24 12">
              <path d="M12 1.5c.3 1.2 1 2.2 2 2.8.8.5 1.7.6 2.5.5.9-.1 1.8-.4 2.5-.9.4.6.6 1.3.6 2.1 0 2.2-2.2 4-5 4.5-.8.1-1.6.1-2.4-.1-1.1-.3-2-.9-2.5-1.7-.5.8-1.4 1.4-2.5 1.7-.8.2-1.6.2-2.4.1-2.8-.5-5-2.3-5-4.5 0-.8.2-1.5.6-2.1.7.5 1.6.8 2.5.9.8.1 1.7 0 2.5-.5 1-.6 1.7-1.6 2-2.8.2.8.5 1.5 1 2.1.5-.6.8-1.3 1-2.1z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Alfred Butler Recommendation Banner */}
      {alfredResponse && (
        <div className="bg-neutral-900 border-l-4 border-yellow-500 p-4 rounded-xl flex items-start gap-3.5 shadow-md">
          <div className="h-9 w-9 rounded-full bg-neutral-950 flex items-center justify-center border border-neutral-800 shrink-0 text-yellow-400 font-bold text-xs font-mono">
            🎩
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 font-mono">Alfred's Personal Desk</span>
            <p className="text-zinc-300 text-xs italic leading-relaxed font-sans">"{alfredResponse}"</p>
          </div>
        </div>
      )}

      {/* ALFRED'S PICKS SECTION */}
      <div className="bg-neutral-900/55 border border-yellow-500/20 p-6 rounded-3xl shadow-sm space-y-4 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-yellow-500/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-yellow-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-2">
              Alfred's Picks <span className="text-[9px] font-sans font-normal px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Special Butler Curation</span>
            </h3>
          </div>
          <button
            onClick={() => handleRefreshPicks()}
            disabled={refreshingPicks}
            className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 bg-neutral-950 hover:bg-neutral-900 text-zinc-300 rounded-xl border border-neutral-800 transition-all hover:text-white cursor-pointer select-none active:scale-95"
          >
            <RefreshCw className={`h-3 w-3 text-yellow-500 ${refreshingPicks ? 'animate-spin' : ''}`} />
            <span>Refresh Curations</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 grid grid-cols-3 gap-3">
            {alfredPicks.map(movie => {
              const isActive = movie.id === activePickId;
              return (
                <div 
                  key={movie.id}
                  onClick={() => setActivePickId(movie.id)}
                  className={`bg-neutral-950 border p-2.5 rounded-xl flex flex-col justify-between cursor-pointer transition-all ${
                    isActive 
                      ? 'border-yellow-500 bg-neutral-900/50 shadow-md shadow-yellow-500/5 scale-[1.02]' 
                      : 'border-neutral-850 hover:border-neutral-700/80 hover:bg-neutral-900/40'
                  }`}
                >
                  <div className="aspect-[16/21] w-full overflow-hidden bg-neutral-900 rounded-lg relative">
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 text-[8px] font-mono font-bold bg-neutral-950/90 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/10">
                      ★ {movie.rating}
                    </span>
                  </div>
                  <h4 className="text-[10px] font-bold text-white truncate text-center mt-2 font-mono">{movie.title}</h4>
                </div>
              );
            })}
          </div>

          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4.5 flex flex-col justify-between space-y-4">
            {activePick ? (
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-mono font-bold text-yellow-400 block">Alfred's Review Note</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 italic font-sans leading-relaxed">
                    "{ALFRED_RECS_ANNOTATIONS[activePick.id] || "An exceptional selection, Master Wayne. Fully integrated and ready for deployment."}"
                  </p>
                </div>
                
                <div className="pt-2 border-t border-neutral-850 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h5 className="text-[10px] font-bold text-white truncate">{activePick.title}</h5>
                    <span className="text-[8px] text-zinc-500 uppercase font-mono">{activePick.service}</span>
                  </div>
                  {getWatchlistItemStatus(activePick.title) ? (
                    <span className="p-1 rounded-full bg-yellow-500/15 text-yellow-400 shrink-0"><Check className="h-3.5 w-3.5" /></span>
                  ) : (
                    <button
                      onClick={() => onRequestMedia({ title: activePick.title, type: activePick.type, posterUrl: activePick.posterUrl })}
                      className="px-2.5 py-1 text-[9px] bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-extrabold rounded-lg transition-all cursor-pointer shadow-sm shadow-yellow-500/10 shrink-0"
                    >
                      Request
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 font-mono text-[10px]">
                Select a pick to view Alfred's briefing.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH BAR & FILTER MECHANISM */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search Wayne Library indexes by movie, TV show, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-neutral-700 font-sans"
            />
          </div>
          <button
            onClick={() => {
              setIsDetectiveMode(!isDetectiveMode);
              setSelectedCategory('All');
            }}
            className={`flex items-center gap-1.5 px-4 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer select-none ${
              isDetectiveMode 
                ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400' 
                : 'bg-neutral-900 border-neutral-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>🕵️‍♂️ Detective Mode</span>
          </button>
        </div>

        {/* DETECTIVE MODE SIDEBAR / CHECKBOXES (Visible when Detective Mode is toggled) */}
        {isDetectiveMode && (
          <div className="bg-neutral-900/60 border border-yellow-500/15 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-5 animate-fadeIn">
            {/* Filter 1: Media Types */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-yellow-400 flex items-center gap-1">
                <Film className="h-3.5 w-3.5" /> Media Type
              </h4>
              <div className="flex flex-col gap-1.5 text-xs text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={checkedTypes.includes('movie')}
                    onChange={() => toggleType('movie')}
                    className="accent-yellow-500 rounded bg-neutral-950 border-neutral-800" 
                  />
                  <span>Feature Film</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={checkedTypes.includes('tv')}
                    onChange={() => toggleType('tv')}
                    className="accent-yellow-500 rounded bg-neutral-950 border-neutral-800" 
                  />
                  <span>TV Series</span>
                </label>
              </div>
            </div>

            {/* Filter 2: Streaming Services */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-yellow-400 flex items-center gap-1">
                <Tv className="h-3.5 w-3.5" /> Service Provider
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-zinc-300">
                {ALL_SERVICES.map(srv => (
                  <label key={srv} className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={checkedServices.includes(srv)}
                      onChange={() => toggleService(srv)}
                      className="accent-yellow-500 rounded bg-neutral-950 border-neutral-800" 
                    />
                    <span>{srv}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 3: Genres */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-yellow-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Noir & Mystery Genres
              </h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-zinc-300">
                {ALL_GENRES.map(gnr => (
                  <label key={gnr} className="flex items-center gap-1.5 cursor-pointer select-none truncate" title={gnr}>
                    <input 
                      type="checkbox" 
                      checked={checkedGenres.includes(gnr)}
                      onChange={() => toggleGenre(gnr)}
                      className="accent-yellow-500 rounded bg-neutral-950 border-neutral-800" 
                    />
                    <span className="truncate">{gnr}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bottom Actions inside Detective Mode */}
            <div className="md:col-span-3 pt-3 border-t border-neutral-800/60 flex justify-between items-center text-[10px] text-zinc-500">
              <span>Scanning combined filters recursively using Batcomputer index files.</span>
              <button 
                onClick={clearAllFilters}
                className="px-3 py-1 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 rounded-lg text-zinc-400 hover:text-white cursor-pointer transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Standard Categories Selection Row (Hidden when Detective Mode is active) */}
        {!isDetectiveMode && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { label: 'All Curations', id: 'All' },
              { label: '🌌 Cerebral Realities', id: 'Cerebral Realities' },
              { label: '🕵️‍♂️ Midnight Grime', id: 'Midnight Grime' },
              { label: '🎬 Nolan\'s Playground', id: 'Nolan' },
              { label: '👁️ Oracle\'s Vault', id: 'Oracle' }
            ].map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl font-mono text-[11px] whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-yellow-500 text-neutral-950 font-bold border-yellow-500 shadow-lg'
                    : 'bg-neutral-900 border-neutral-800/80 text-zinc-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of movies */}
      {filteredCatalog.length === 0 ? (
        <div className="p-16 border border-dashed border-neutral-800 text-center rounded-2xl font-mono text-xs text-zinc-500">
          No matches found, Master Wayne. Adjust the Detective Mode scanning grids.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
          {filteredCatalog.map((movie) => {
            const watchlistStatus = getWatchlistItemStatus(movie.title);

            return (
              <div 
                key={movie.id} 
                className="group bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 hover:bg-neutral-900/60 transition-all duration-200 shadow-sm relative"
              >
                <div className="relative aspect-[16/22] w-full overflow-hidden bg-neutral-950">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                    <span className="text-[9px] font-mono bg-neutral-950/80 text-zinc-200 px-2 py-0.5 rounded backdrop-blur-sm border border-neutral-800/40">
                      {movie.year}
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded backdrop-blur-sm border border-emerald-800/40">
                      ✓ SECURE
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded backdrop-blur-sm border border-indigo-800/40">
                      {movie.service}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded backdrop-blur-sm">
                      ★ {movie.rating}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-neutral-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-[11px] font-sans text-zinc-300 space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Noir Genre</span>
                    <p className="leading-tight text-white font-medium">{movie.genre}</p>
                  </div>
                </div>

                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between bg-neutral-900/40">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase text-zinc-500 block">
                      {movie.type === 'movie' ? '🎬 Feature' : '📺 TV Series'}
                    </span>
                    <h3 className="text-xs font-bold text-white leading-tight font-sans tracking-tight line-clamp-1 group-hover:text-yellow-500 transition-colors" title={movie.title}>
                      {movie.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-neutral-850">
                    {watchlistStatus ? (
                      watchlistStatus.status === 'available' ? (
                        <a
                          href="http://localhost:8096"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all"
                        >
                          <Play className="h-3 w-3" /> Stream Now
                        </a>
                      ) : (
                        <div className="w-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                          {watchlistStatus.status === 'downloading' ? `Downloading (${watchlistStatus.progress}%)` : 'Syncing via VPN'}
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => onRequestMedia({ title: movie.title, type: movie.type, posterUrl: movie.posterUrl })}
                        className="w-full bg-neutral-950 border border-neutral-850 hover:border-zinc-700/80 hover:bg-neutral-900 text-zinc-200 text-[10px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all group-hover:border-yellow-500/30 group-hover:text-white cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Request Content
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* WATCH HISTORY SECTION */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-neutral-800/60 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-yellow-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Your Watch History & Butler Tuning</h3>
          </div>
          <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-mono px-2 py-0.5 rounded">
            Feedback influences Recommended algorithms
          </span>
        </div>

        <div className="divide-y divide-neutral-850">
          {watchHistory.map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img src={item.posterUrl} alt={item.title} className="w-10 h-12 object-cover rounded-md border border-neutral-800 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white leading-none">{item.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    Watched: {item.watchedAt} • <span className="font-mono text-[9px] uppercase bg-neutral-950 px-1 rounded border border-neutral-850">{item.genres.join(', ')}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => handleFeedback(item.id, 'up')}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    item.feedback === 'up' 
                      ? 'bg-green-500/15 border-green-500/30 text-green-400 shadow-md' 
                      : 'bg-neutral-950 border-neutral-850 text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Improve recommendations (Thumbs Up)"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => handleFeedback(item.id, 'down')}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    item.feedback === 'down' 
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-md' 
                      : 'bg-neutral-950 border-neutral-850 text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Demote recommendations (Thumbs Down)"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
