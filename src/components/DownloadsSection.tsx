import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info,
  ChevronDown,
  Volume2,
  TrendingDown,
  Activity,
  ArrowDownCircle,
  Sparkles
} from 'lucide-react';

interface TorrentItem {
  id: string;
  name: string;
  size: string;
  progress: number;
  speed: string;
  eta: string;
  peers: number;
  status: 'scanning' | 'downloading' | 'paused' | 'completed' | 'failed';
  category: 'movie' | 'tv';
}

interface DownloadHistoryItem {
  id: string;
  name: string;
  size: string;
  status: 'completed' | 'failed';
  time: string;
  errorReason?: string;
}

interface DownloadsSectionProps {
  onAddNotification: (type: 'success' | 'warning' | 'info' | 'error', title: string, message: string) => void;
  triggerInsight: (text: string) => void;
}

const ACHIEVEMENT_MESSAGES = [
  "🦇 Another criminal... or container... brought to justice.",
  "🦇 Gotham grows safer with every completed mission.",
  "🦇 Justice has been served to the download queue.",
  "🦇 The Batcomputer is operating at peak efficiency.",
  "🦇 Another case closed."
];

export default function DownloadsSection({ onAddNotification, triggerInsight }: DownloadsSectionProps) {
  const [torrents, setTorrents] = useState<TorrentItem[]>([
    {
      id: 'tor-1',
      name: 'The Last of Us - S02E01.2160p.HEVC.x265.HDR-ZeroTrust',
      size: '14.2 GB',
      progress: 45,
      speed: '12.4 MB/s',
      eta: '11m 45s',
      peers: 64,
      status: 'downloading',
      category: 'tv'
    },
    {
      id: 'tor-2',
      name: 'Gladiator.II.2024.1080p.BluRay.DDP5.1.Atmos.x264',
      size: '22.8 GB',
      progress: 100,
      speed: '0 KB/s',
      eta: 'Done',
      peers: 112,
      status: 'completed',
      category: 'movie'
    },
    {
      id: 'tor-3',
      name: 'Nightcrawler.2014.REMASTERED.1080p.BluRay.x265-ZeroTrust',
      size: '8.4 GB',
      progress: 68,
      speed: '0 KB/s',
      eta: 'Suspended',
      peers: 0,
      status: 'failed',
      category: 'movie'
    }
  ]);

  const [history, setHistory] = useState<DownloadHistoryItem[]>([
    {
      id: 'hist-1',
      name: 'Dune: Part Two (2024) [4K UltraHD Remux HDR]',
      size: '45.3 GB',
      status: 'completed',
      time: '1 hour ago'
    },
    {
      id: 'hist-2',
      name: 'Interstellar (2014) [IMAX Edition x265]',
      size: '18.1 GB',
      status: 'failed',
      time: '2 hours ago',
      errorReason: 'VPN killswitch engaged (gluetun connection dropped)'
    }
  ]);

  const [enableSound, setEnableSound] = useState(true);

  // Fluctuating download speed effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTorrents(prev => prev.map(t => {
        if (t.status === 'scanning' && Math.random() > 0.7) {
          return { ...t, status: 'downloading', speed: '5.0 MB/s', eta: '5m 00s' };
        }
        if (t.status !== 'downloading') return t;
        const speedVal = parseFloat(t.speed);
        const nextSpeed = Math.max(1.5, Math.min(45, speedVal + (Math.random() - 0.5) * 4)).toFixed(1) + ' MB/s';
        const nextProgress = Math.min(99.9, t.progress + Math.random() * 0.4);
        
        // Calculate dynamic ETA based on speed
        const minsLeft = Math.ceil((100 - nextProgress) * 0.25);
        const nextEta = minsLeft > 0 ? `${minsLeft}m ${Math.floor(Math.random() * 59)}s` : '10s';

        return { ...t, speed: nextSpeed, progress: parseFloat(nextProgress.toFixed(1)), eta: nextEta };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const playChime = (type: 'success' | 'error') => {
    if (!enableSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else {
        osc.frequency.setValueAtTime(349.23, audioCtx.currentTime); // F4
        osc.frequency.setValueAtTime(220.00, audioCtx.currentTime + 0.2); // A3
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.65);
      }
    } catch (e) {
      console.warn("Audio Context blocked by browser auto-play policy.");
    }
  };

  // Toggle Pause/Resume
  const handleToggleStatus = (id: string) => {
    setTorrents(prev => prev.map(t => {
      if (t.id !== id) return t;
      const isPaused = t.status === 'paused';
      const nextStatus = isPaused ? 'downloading' : 'paused';
      
      onAddNotification(
        isPaused ? 'info' : 'warning',
        isPaused ? 'Torrent Resumed' : 'Torrent Paused',
        `"${t.name.substring(0, 30)}..." has been ${isPaused ? 'resumed' : 'suspended'} by user.`
      );

      return {
        ...t,
        status: nextStatus,
        speed: isPaused ? '8.5 MB/s' : '0 KB/s',
        eta: isPaused ? 'Calculating...' : 'Paused'
      };
    }));
  };

  // Delete Torrent
  const handleDelete = (id: string, name: string) => {
    setTorrents(prev => prev.filter(t => t.id !== id));
    onAddNotification('error', 'Torrent Removed', `"${name.substring(0, 35)}..." deleted from active queue.`);
  };

  // Retry Failed Torrent
  const handleRetryHistory = (id: string, name: string) => {
    // Remove from history
    setHistory(prev => prev.filter(h => h.id !== id));
    
    // Add to active torrents
    const newTor: TorrentItem = {
      id: `tor-${Date.now()}`,
      name: name,
      size: '18.1 GB',
      progress: 0,
      speed: 'Initializing...',
      eta: 'Connecting...',
      peers: 24,
      status: 'scanning', // CHANGED FROM 'downloading'
      category: 'movie'
    };
    
    setTorrents(prev => [newTor, ...prev]);
    onAddNotification('success', 'Download Restarted', `Re-indexed torrent "${name.substring(0, 30)}..." - checking VPN trackers.`);
    triggerInsight(`Insight: Download re-established. Nightcrawler is querying Jackett tracker bridges through NordVPN gateway tunnels.`);
  };

  // Simulate Torrent Completed Event
  const simulateComplete = () => {
    const downloading = torrents.find(t => t.status === 'downloading');
    if (!downloading) {
      onAddNotification('info', 'No Active Downloads', 'Please start or resume a torrent to simulate a download finished event.');
      return;
    }

    // Set complete
    setTorrents(prev => prev.filter(t => t.id !== downloading.id));
    
    // Add to history
    const histItem: DownloadHistoryItem = {
      id: `hist-${Date.now()}`,
      name: downloading.name,
      size: downloading.size,
      status: 'completed',
      time: 'Just now'
    };
    setHistory(prev => [histItem, ...prev]);

    // Choose random Batman theme achievement
    const achievement = ACHIEVEMENT_MESSAGES[Math.floor(Math.random() * ACHIEVEMENT_MESSAGES.length)];

    // Notification and Voice trigger
    onAddNotification(
      'success',
      'Download Completed! 🎉',
      `${achievement}\n"${downloading.name.substring(0, 40)}..." has finished downloading and auto-imported successfully.`
    );
    playChime('success');
    triggerInsight(`Finished: Master Wayne, "${downloading.name.substring(0, 32)}..." has fully arrived. ${achievement}`);
  };

  // Simulate Torrent Failed Event
  const simulateFail = () => {
    const downloading = torrents.find(t => t.status === 'downloading');
    if (!downloading) {
      onAddNotification('info', 'No Active Downloads', 'Please start or resume a torrent to simulate a download failed event.');
      return;
    }

    // Set failed
    setTorrents(prev => prev.map(t => {
      if (t.id === downloading.id) {
        return { ...t, status: 'failed', speed: '0 KB/s', eta: 'Error' };
      }
      return t;
    }));

    // Add to history
    const histItem: DownloadHistoryItem = {
      id: `hist-${Date.now()}`,
      name: downloading.name,
      size: downloading.size,
      status: 'failed',
      time: 'Just now',
      errorReason: 'Prowlarr tracker handshake timeout (UFW blocks incoming port)'
    };
    setHistory(prev => [histItem, ...prev]);

    // Notification and Voice trigger
    onAddNotification(
      'error',
      'Download Failed! ⚠️',
      `"${downloading.name.substring(0, 35)}..." has encountered a fatal tracking error. VPN handshake timed out.`
    );
    playChime('error');
    triggerInsight(`Alert: Master Wayne, I must inform you that the download queue has stalled. The tracker connection failed. This indicates our Zero-Trust firewall blocks the incoming peer handshake port.`);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-sm space-y-6">
      
      {/* Visual Subheader */}
      <div className="flex justify-between items-center border-b border-neutral-800/60 pb-4 flex-wrap gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Download className="text-indigo-400 h-4.5 w-4.5 animate-pulse" />
            Downloader Section & Active Torrent Queue
          </h3>
          <p className="text-zinc-500 text-xs font-sans">
            Oversee active BitTorrent transfers locked inside Caddy/Gluetun namespaces.
          </p>
        </div>

        {/* Chime & Simulated Buttons controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button 
            onClick={() => setEnableSound(!enableSound)}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              enableSound 
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                : 'bg-neutral-950 border-neutral-850 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            {enableSound ? 'Chime ON' : 'Chime Muted'}
          </button>
          
          <div className="h-4 w-px bg-neutral-800 mx-1 hidden sm:block" />
          
          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase mr-1 hidden sm:inline">Simulators:</span>
          
          <button 
            onClick={simulateComplete}
            className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            title="Simulate successful download completion and import"
          >
            Simulate Finish
          </button>

          <button 
            onClick={simulateFail}
            className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            title="Simulate tracker failure and VPN block"
          >
            Simulate Fail
          </button>
        </div>
      </div>

      {/* Active Torrents Table/Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Activity className="h-4 w-4 text-zinc-500" />
          <span>Active Transfers Queue ({torrents.filter(t => t.status === 'downloading').length} active)</span>
        </div>

        {torrents.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-850/80 p-8 rounded-xl text-center text-zinc-500 font-mono text-xs">
            No active missions, Master Wayne.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {torrents.map((t) => {
              const isScanning = t.status === 'scanning';
              const isDownloading = t.status === 'downloading';
              const isCompleted = t.status === 'completed';
              const isFailed = t.status === 'failed';

              return (
                <div 
                  key={t.id} 
                  className={`bg-neutral-950 border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                    isFailed 
                      ? 'border-rose-950 bg-rose-950/5' 
                      : isCompleted 
                        ? 'border-emerald-950 bg-emerald-950/5' 
                        : 'border-neutral-850 hover:border-zinc-700'
                  }`}
                >
                  {/* Icon + Title Block */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                        t.category === 'movie' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-pink-500/10 text-pink-400'
                      }`}>
                        {t.category.toUpperCase()}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate leading-snug font-sans">{t.name}</h4>
                    </div>

                    <div className="flex gap-4 text-[10px] font-mono text-zinc-500">
                      <span>Size: <strong className="text-zinc-300">{t.size}</strong></span>
                      <span>Peers: <strong className="text-zinc-300">{t.peers}</strong></span>
                      {isDownloading && (
                        <>
                          <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                            <ArrowDownCircle className="h-3 w-3" /> {t.speed}
                          </span>
                          <span>ETA: <strong className="text-zinc-300">{t.eta}</strong></span>
                        </>
                      )}
                      {isScanning && <span className="text-yellow-400 font-bold animate-pulse">SCANNING PAYLOADS...</span>}
                      {t.status === 'paused' && <span className="text-amber-400 font-bold">PAUSED</span>}
                      {isFailed && <span className="text-rose-500 font-bold animate-pulse">FAILED (TUNNEL ERROR)</span>}
                      {isCompleted && <span className="text-emerald-400 font-bold">COMPLETED (IMPORTED)</span>}
                    </div>

                    {/* Progress slider layout */}
                    {!isCompleted && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                          <span>Progress: <strong className="text-zinc-300">{t.progress}%</strong></span>
                          <span>VPN-Bounded Route (tun0)</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFailed ? 'bg-rose-500' : 'bg-indigo-500'
                            }`} 
                            style={{ width: `${t.progress}%` }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {!isCompleted && !isFailed && (
                      <button 
                        onClick={() => handleToggleStatus(t.id)}
                        className="bg-neutral-900 hover:bg-neutral-850 p-2 rounded-lg border border-neutral-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title={isDownloading ? 'Pause Download' : 'Resume Download'}
                      >
                        {isDownloading ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                    )}

                    <button 
                      onClick={() => handleDelete(t.id, t.name)}
                      className="bg-neutral-900 hover:bg-neutral-850 p-2 rounded-lg border border-neutral-800 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer"
                      title="Delete Torrent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Downloader logs & completed history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-neutral-800/50">
        
        {/* Completed History List */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Completed Imports & Event Logs</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 space-y-3 max-h-56 overflow-y-auto">
            {history.map((h) => {
              const isComp = h.status === 'completed';

              return (
                <div key={h.id} className="border-b border-neutral-900 pb-2.5 last:border-0 last:pb-0 text-xs space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-white truncate max-w-[280px]" title={h.name}>
                      {h.name}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold shrink-0 ${
                      isComp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {isComp ? 'FINISHED' : 'STALLED'}
                    </span>
                  </div>
                  
                  {h.errorReason && (
                    <p className="text-[10px] text-rose-400/90 font-mono bg-rose-950/25 p-1.5 rounded border border-rose-500/10 leading-relaxed">
                      Error: {h.errorReason}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-0.5">
                    <span>Size: {h.size} • {h.time}</span>
                    {!isComp && (
                      <button 
                        onClick={() => handleRetryHistory(h.id, h.name)}
                        className="text-indigo-400 hover:text-white font-bold flex items-center gap-0.5 underline transition-all cursor-pointer uppercase text-[9px]"
                      >
                        <RefreshCw className="h-2.5 w-2.5" /> Re-index & Retry
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 flex flex-col justify-between space-y-3 text-xs text-zinc-400 font-sans">
          <div className="space-y-2">
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Automated Downloader Sandbox (P2P Isolation)
            </span>
            <p className="leading-relaxed">
              Your container stack enforces <strong>absolute isolation</strong>. When a show is requested on Jellyseerr or a torrent magnet is processed:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500 leading-normal pl-1.5">
              <li>Prowlarr crawls and scrapes top indexers through Gluetun VPN.</li>
              <li>Handshakes are checked via proxy interface constraints.</li>
              <li>Downloaded assets are safely moved into the Crostini directory share.</li>
              <li>Caddy triggers a metadata refresh inside Jellyfin.</li>
            </ul>
          </div>
          
          <div className="bg-neutral-900/60 p-2 rounded-lg border border-neutral-850/60 text-[10px] text-zinc-500 flex items-center gap-2 font-mono">
            <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>Hardened VPN sandbox routing is currently bound to port 58812.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
