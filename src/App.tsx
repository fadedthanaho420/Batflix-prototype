import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Terminal, 
  Settings, 
  Download, 
  Check, 
  Search, 
  Plus, 
  Play, 
  ExternalLink, 
  Lock, 
  Server, 
  HelpCircle, 
  Send, 
  Activity, 
  Wifi, 
  Tv,
  ListVideo,
  LockKeyhole,
  Info,
  Copy,
  AlertTriangle,
  Sliders,
  Wrench,
  RefreshCw,
  Brain
} from 'lucide-react';

import { MediaRequest, CustomRule, ContainerStatus, SpeedTestData } from './types';
import AlfredStudy from './components/AlfredStudy';
import BrowseTab from './components/BrowseTab';
import Sidebar from './components/Sidebar';
import NetworkingTab from './components/NetworkingTab';
import SettingsTab from './components/SettingsTab';
import DownloadsSection from './components/DownloadsSection';
import BatSignal from './components/BatSignal';

export default function App() {
  // Finalized / Wizard State
  const [isFinalized, setIsFinalized] = useState<boolean>(() => {
    return localStorage.getItem('media_control_center_finalized') === 'true';
  });

  // Navigation / Tabs (Horizontally horizontally ordered)
  const [activeTab, setActiveTab] = useState<'setup' | 'browse' | 'watchlist' | 'networking' | 'alfred_study' | 'settings'>('alfred_study');

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Developer Mode State
  const [isDevMode, setIsDevMode] = useState(false);

  // Focused sub-settings block (triggered by sidebar cogs)
  const [focusedSection, setFocusedSection] = useState<string | null>(null);

  // Floating Chat / Coach Insights State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<string | null>(null);
  const [unreadInsightCount, setUnreadInsightCount] = useState(0);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>(() => {
    const saved = localStorage.getItem('alfred_chat_history');
    return saved ? JSON.parse(saved) : [
      { 
        role: 'assistant', 
        content: "Hello! I am your AI DevOps Coach. I can help you monitor ports, verify VPN keys, and secure your Crostini containers. Let me know if you run into any issues!" 
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('alfred_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Chaos Simulator states (Outages)
  const [vpnOutage, setVpnOutage] = useState(true);
  const [caddyOutage, setCaddyOutage] = useState(false);
  const [diskFullOutage, setDiskFullOutage] = useState(false);
  const [trackerTimeout, setTrackerTimeout] = useState(false);
  const [cpuSpikeActive, setCpuSpikeActive] = useState(false);

  // Dynamic system rotating loading messages & global boot notification
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState("Alfred is preparing the Batcomputer...");
  const [bootNotification, setBootNotification] = useState<string | null>(null);

  // Configuration Form State (populated with defaults)
  const [username, setUsername] = useState('chrome');
  const [localSubnet, setLocalSubnet] = useState('192.168.1.0/24');
  const [wgPrivateKey, setWgPrivateKey] = useState('eG9va2VlaG9vcGFobm9vdXNoZWg0b2g5b29nb29zZTk=');
  const [wgAddress, setWgAddress] = useState('10.0.0.2/32');
  const [timezone, setTimezone] = useState('America/New_York');
  
  // Passwords (generated automatically)
  const [qbPassword, setQbPassword] = useState('QB_Admin_Secret2026!');
  const [aiostreamsSecret, setAiostreamsSecret] = useState('AIO_Stream_Auth_Key_2026');
  const [mediaflowPassword, setMediaflowPassword] = useState('MediaFlow_Proxy_Pass2026');

  // Generated config states
  const [dockerCompose, setDockerCompose] = useState('');
  const [caddyfile, setCaddyfile] = useState('');
  const [desktopFile, setDesktopFile] = useState('');
  const [ufwScript, setUfwScript] = useState('');
  const [dirCreationCommand, setDirCreationCommand] = useState('');

  // Setup Wizard Steps
  const [wizardStep, setWizardStep] = useState(1);
  const [auditStatus, setAuditStatus] = useState({
    docker: 'checking',
    dockerCompose: 'checking',
    ufw: 'checking',
    tailscale: 'checking'
  });
  const [fixingAudit, setFixingAudit] = useState(false);
  const [deploymentRunning, setDeploymentRunning] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);

  // Firewall State
  const [firewallApplied, setFirewallApplied] = useState(false);
  const [firewallLogs, setFirewallLogs] = useState<string[]>([]);
  const [isApplyingFirewall, setIsApplyingFirewall] = useState(false);

  // Watchlist & Request Data State
  const [watchlist, setWatchlist] = useState<MediaRequest[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  // Custom Firewall Rules State
  const [customRules, setCustomRules] = useState<CustomRule[]>([
    { id: '1', port: '22', protocol: 'tcp', action: 'allow', source: '192.168.1.50', comment: 'Crostini SSH access from developer workstation' },
    { id: '2', port: '6767', protocol: 'tcp', action: 'allow', source: '192.168.1.0/24', comment: 'Bazarr Subtitles WebUI access' }
  ]);

  // Telemetry list (fluctuating stats)
  const [containers, setContainers] = useState<ContainerStatus[]>([
    { name: 'gluetun', image: 'qmcgaw/gluetun:latest', status: 'online', cpu: '0.4%', ram: '18 MB', uptime: '1d 4h', port: 'VPN Gateway' },
    { name: 'qbittorrent', image: 'cr.hotio.dev/hotio/qbittorrent', status: 'online', cpu: '1.2%', ram: '142 MB', uptime: '1d 4h', port: '8080' },
    { name: 'jellyseerr', image: 'fallenbagel/jellyseerr', status: 'online', cpu: '0.1%', ram: '94 MB', uptime: '1d 4h', port: '5055' },
    { name: 'jellyfin', image: 'jellyfin/jellyfin', status: 'online', cpu: '0.8%', ram: '280 MB', uptime: '1d 4h', port: '8096' },
    { name: 'caddy', image: 'caddy:latest', status: 'online', cpu: '0.1%', ram: '14 MB', uptime: '1d 4h', port: '80' },
    { name: 'radarr', image: 'cr.hotio.dev/radarr', status: 'online', cpu: '0.3%', ram: '110 MB', uptime: '1d 4h', port: '7878' },
    { name: 'sonarr', image: 'cr.hotio.dev/sonarr', status: 'online', cpu: '0.5%', ram: '130 MB', uptime: '1d 4h', port: '8989' },
    { name: 'aiostreams', image: 'viren070/aiostreams', status: 'online', cpu: '0.2%', ram: '45 MB', uptime: '1d 4h', port: '7000' },
    { name: 'mediaflow', image: 'mhdzumair/mediaflow-proxy-light', status: 'online', cpu: '0.1%', ram: '32 MB', uptime: '1d 4h', port: '8888' },
  ]);

  // Speed Test State
  const [speedTestRunning, setSpeedTestRunning] = useState(false);
  const [speedTestData, setSpeedTestData] = useState<SpeedTestData>({ ping: null, download: null, upload: null, step: 'idle' });

  // Live tail logs
  const [selectedLogContainer, setSelectedLogContainer] = useState('gluetun');
  const [logLines, setLogLines] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // App Level Sliding Toast Notifications State
  interface AppNotification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    timestamp: string;
  }
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const addNotification = (type: 'success' | 'warning' | 'info' | 'error', title: string, message: string) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 6000);
  };

  // Alfred Butler Voice State & Speech Synthesis Engine
  const [simulatedError, setSimulatedError] = useState<number | null>(null);

  // Helper to trigger floating DevOps insight speech bubble popups
  const triggerInsight = (text: string) => {
    setCurrentInsight(text);
    setUnreadInsightCount(prev => prev + 1);
  };



  // Fluctuating container CPU/RAM stats to simulate real daemon activity
  useEffect(() => {
    const interval = setInterval(() => {
      setContainers(prev => prev.map(c => {
        if (c.status !== 'online') return c;
        
        const isSpikeSvc = cpuSpikeActive && (c.name === 'qbittorrent' || c.name === 'jellyfin');
        const cpuVal = parseFloat(c.cpu);
        
        let fluctuatedCpu = "";
        if (isSpikeSvc) {
          // Fluctuates around 78% to 96%
          const nextCpu = Math.max(75.0, Math.min(97.5, cpuVal + (Math.random() - 0.5) * 3.5));
          fluctuatedCpu = nextCpu.toFixed(1) + '%';
        } else {
          // Standard low fluctuation, capped at 10.0% so only spiked/restarting states pulse
          const nextCpu = Math.max(0.1, Math.min(10.0, cpuVal + (Math.random() - 0.5) * 0.5));
          fluctuatedCpu = nextCpu.toFixed(1) + '%';
        }

        const ramVal = parseInt(c.ram);
        const fluctuatedRam = Math.max(10, Math.min(1000, ramVal + Math.floor((Math.random() - 0.5) * 5))) + ' MB';
        return { ...c, cpu: fluctuatedCpu, ram: fluctuatedRam };
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, [cpuSpikeActive]);

  // Fetch configs and watchlist
  useEffect(() => {
    fetchConfigs();
    fetchWatchlist();
  }, [username, localSubnet, wgPrivateKey, wgAddress, timezone, customRules]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateNewPasswords = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    const gen = (len: number) => Array.from({length: len}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setQbPassword(gen(12));
    setAiostreamsSecret(gen(16));
    setMediaflowPassword(gen(12));
    triggerInsight("Insight: Refreshed master credentials. Compose script updated safely.");
  };

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/generate-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username, localSubnet, wgPrivateKey, wgAddress, timezone, qbPassword, aiostreamsSecret, mediaflowPassword, customRules
        })
      });
      const data = await res.json();
      setDockerCompose(data.dockerCompose);
      setCaddyfile(data.caddyfile);
      setDesktopFile(data.desktopFile);
      setUfwScript(data.ufwScript);
      setDirCreationCommand(data.dirCreationCommand);
    } catch (err) {
      console.error("Failed to fetch stack configurations", err);
    }
  };

  const fetchWatchlist = async () => {
    setWatchlistLoading(true);
    try {
      const res = await fetch('/api/jellyseerr/requests');
      const data = await res.json();
      setWatchlist(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setWatchlistLoading(false);
    }
  };

  // API Call to request media
  const handleRequestMedia = async (media: { title: string; type: 'movie' | 'tv'; posterUrl: string }) => {
    try {
      const res = await fetch('/api/jellyseerr/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media)
      });
      const data = await res.json();
      if (data.success) {
        setWatchlist(prev => [data.request, ...prev]);
        triggerInsight(`Insight: Requested "${media.title}"! Automated torrent downloader synced safely inside your VPN namespace.`);
      }
    } catch (err) {
      console.error("Jellyseerr mock request failed", err);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const runSpeedTest = () => {
    setSpeedTestRunning(true);
    setSpeedTestData({ ping: null, download: null, upload: null, step: 'pinging' });
    
    setTimeout(() => {
      setSpeedTestData(p => ({ ...p, ping: Math.floor(Math.random() * 18) + 8, step: 'download' }));
      
      setTimeout(() => {
        setSpeedTestData(p => ({ ...p, download: Math.floor(Math.random() * 35) + 82, step: 'upload' }));
        
        setTimeout(() => {
          setSpeedTestData(p => ({ ...p, upload: Math.floor(Math.random() * 12) + 22, step: 'complete' }));
          setSpeedTestRunning(false);
          triggerInsight("Insight: VPN diagnostic completed. WireGuard Tunnel bandwidth has been validated at 80+ MB/s.");
        }, 1500);
      }, 1500);
    }, 1200);
  };

  // Send message to Gemini DevOps assistant
  const handleSendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          history: messages
        })
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble communicating with the server. Please verify your internet connection or check API keys." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Navigates to settings and highlights section
  const handleNavigateToSettings = (serviceId: string) => {
    setActiveTab('settings');
    setFocusedSection(serviceId);
  };

  // Triggers custom assistant suggestion on outage clicks
  const handleTriggerOutageInsight = (title: string, diagnostic: string, fix: string) => {
    setIsChatOpen(true);
    setCurrentInsight(null);
    setUnreadInsightCount(0);
    
    const formattedContent = `🚨 **OUTAGE DIAGNOSTIC REPORT: ${title.toUpperCase()}**\n\n**Incident Diagnostic:**\n${diagnostic}\n\n**Recommended Suggestions to Fix:**\n${fix}`;
    
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: formattedContent }
    ]);
  };

  // Simulate deployment logs
  const handleDeployStack = () => {
    setDeploymentRunning(true);
    setDeploymentLogs([]);
    const logs = [
      "Creating directory maps inside /home/" + username + "...",
      "Directories successfully mapped to internal SSD Storage.",
      "Writing docker-compose.yml to ~/.config/media-stack/ ...",
      "Writing Caddyfile to ~/.config/media-stack/caddy/Caddyfile ...",
      "Creating native system launcher zero-media.desktop ...",
      "Spawning Docker Stack: docker-compose up -d ...",
      "Starting gluetun (VPN Gateway) ... Started",
      "Starting qbittorrent (Namespaced VPN) ... Started",
      "Starting radarr ... Started",
      "Starting sonarr ... Started",
      "Starting jellyseerr ... Started",
      "Starting jellyfin ... Started",
      "Starting caddy ... Started",
      "Aleyna's Ultimate Flix stack deployed successfully!"
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setDeploymentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[currentLogIndex]}`]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setDeploymentRunning(false);
        triggerInsight("Insight: Docker stack successfully launched! Click 'Finalize & Lock Setup' to activate production mode.");
      }
    }, 600);
  };

  const handleFinalize = () => {
    setIsFinalized(true);
    localStorage.setItem('media_control_center_finalized', 'true');
    triggerInsight("Insight: System 100% Finalized! Production dashboard is now live and secured behind UFW.");
  };

  // Periodic Loading Message Rotation Effect
  useEffect(() => {
    const messages = [
      "Alfred is preparing the Batcomputer...",
      "Scanning Gotham...",
      "Consulting the Batcomputer...",
      "Contacting Oracle...",
      "Reviewing case files...",
      "Deploying field agents...",
      "Searching the Archives...",
      "Monitoring Gotham...",
      "Checking WayneTech systems...",
      "Running diagnostics...",
      "Preparing mission briefing..."
    ];
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setCurrentLoadingMessage(messages[randomIndex]);
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);

  // CPU/RAM Monitor
  const highUsageCounter = useRef(0);
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/system/metrics');
        if (!res.ok) {
            console.error("Metrics endpoint returned non-OK status:", res.status);
            return;
        }
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse metrics JSON. Response was:", text.substring(0, 100));
            return;
        }
        const { cpuLoad, ramUsage } = data;
        
        // Very rough approximation of 90% load/usage
        if (cpuLoad > 0.9 || ramUsage > 0.9) {
          highUsageCounter.current += 10;
          if (highUsageCounter.current >= 60) {
            addNotification('error', '⚠️ High Resource Usage', 'Container CPU/RAM usage exceeded 90% for over 1 minute!');
            highUsageCounter.current = 0;
          }
        } else {
          highUsageCounter.current = 0;
        }
      } catch (e) {
        console.error("Failed to fetch metrics", e);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Host security check simulator on startup
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuditStatus({
        docker: 'installed',
        dockerCompose: 'installed',
        ufw: 'missing',
        tailscale: 'installed'
      });
      // Trigger a direct, critical boot notification
      addNotification(
        'error',
        '⚠️ Security Alert: Port Exposure',
        'Crostini Firewall (UFW) is missing or inactive. Host ports are exposed to the local network.'
      );
      
      // Also set the global boot notification alert
      setBootNotification("🚨 Gluetun VPN Gateway is currently offline. WireGuard handshake is failing inside the container namespace.");
      
      triggerInsight("Identity could not be verified, Master Wayne. Our security scans indicate UFW is inactive and our VPN Gateway is currently offline. I highly recommend running our diagnostics immediately.");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 flex flex-col font-sans antialiased relative">
      <BatSignal isDegraded={vpnOutage} />
      
      {/* HEADER BAR */}
      <header className="bg-neutral-900 border-b border-neutral-800/80 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-sm relative z-30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-12 bg-neutral-950 border border-yellow-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.15)] shrink-0">
            <svg className="h-5 w-9 text-yellow-500 fill-current" viewBox="0 0 24 12">
              <path d="M12 1.5c.3 1.2 1 2.2 2 2.8.8.5 1.7.6 2.5.5.9-.1 1.8-.4 2.5-.9.4.6.6 1.3.6 2.1 0 2.2-2.2 4-5 4.5-.8.1-1.6.1-2.4-.1-1.1-.3-2-.9-2.5-1.7-.5.8-1.4 1.4-2.5 1.7-.8.2-1.6.2-2.4.1-2.8-.5-5-2.3-5-4.5 0-.8.2-1.5.6-2.1.7.5 1.6.8 2.5.9.8.1 1.7 0 2.5-.5 1-.6 1.7-1.6 2-2.8.2.8.5 1.5 1 2.1.5-.6.8-1.3 1-2.1z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Cave Cinema & Gotham Grid
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">Wayne Enterprises</span>
            </h1>
            <p className="text-xs text-zinc-400 font-medium">Powered by Alfred Intelligence (A.I.)</p>
          </div>
        </div>

        {/* Real-time Sub-Indicators and Alfred Voice controls */}
        <div className="flex items-center gap-4 text-xs font-mono flex-wrap">

          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <Activity className="h-3 w-3 text-zinc-400 animate-pulse" />
            <span className="text-zinc-500">Stack Status:</span>
            <span className="text-zinc-200 font-medium">{vpnOutage ? "Degraded" : "Active"}</span>
          </div>
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <Wifi className="h-3 w-3 text-zinc-400" />
            <span className="text-zinc-500">VPN:</span>
            <span className="text-zinc-200 font-medium">{vpnOutage ? "Disconnected" : "WireGuard Enforced"}</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* COLLAPSIBLE SIDEBAR */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNavigateToSettings={handleNavigateToSettings}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isFinalized={isFinalized}
          isDevMode={isDevMode}
          setIsDevMode={setIsDevMode}
        />

        {/* WORKSPACE AREA */}
        <main className="flex-1 flex flex-col min-w-0">
          
          {/* HORIZONTAL TABS AT THE TOP */}
          <div className="bg-neutral-900 border-b border-neutral-800/80 px-6 py-2.5 flex items-center justify-start gap-2 overflow-x-auto select-none shrink-0 relative z-10">
            
            {/* Tab 1: Setup Wizard (conditional) */}
            {!isFinalized && (
              <button 
                onClick={() => setActiveTab('setup')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all shrink-0 ${
                  activeTab === 'setup' 
                    ? 'bg-zinc-100 text-neutral-950 shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Interactive Setup</span>
              </button>
            )}

            {/* Tab 2: Browse (Wayne Library) */}
            <button 
              onClick={() => setActiveTab('browse')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all shrink-0 ${
                activeTab === 'browse' 
                  ? 'bg-zinc-100 text-neutral-950 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-yellow-500" />
              <span>Wayne Library</span>
            </button>

            {/* Tab 3: Watchlist */}
            <button 
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all shrink-0 ${
                activeTab === 'watchlist' 
                  ? 'bg-zinc-100 text-neutral-950 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ListVideo className="h-3.5 w-3.5" />
              <span>Watchlist Viewer</span>
            </button>

            {/* Tab 4: Networking (Gotham Grid) */}
            <button 
              onClick={() => setActiveTab('networking')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all shrink-0 ${
                activeTab === 'networking' 
                  ? 'bg-zinc-100 text-neutral-950 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Gotham Grid</span>
            </button>

            {/* Tab: Alfred's Study */}
            <button 
              onClick={() => setActiveTab('alfred_study')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-display transition-all shrink-0 ${
                activeTab === 'alfred_study' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Brain className="h-3.5 w-3.5" />
              <span>Alfred's Study</span>
            </button>

            {/* Tab 5: Master Settings */}
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all shrink-0 ${
                activeTab === 'settings' 
                  ? 'bg-zinc-100 text-neutral-950 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Master Settings Utility</span>
            </button>

          </div>

          {/* ACTIVE CONTENT WORKSPACE */}
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              
              {/* TAB: ALFRED'S STUDY */}
              {activeTab === 'alfred_study' && (
                <motion.div 
                  key="alfred_study"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  <AlfredStudy
                  />
                </motion.div>
              )}
              
              {/* TAB 1: INTERACTIVE SETUP */}
              {activeTab === 'setup' && !isFinalized && (
                <motion.div 
                  key="setup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 max-w-5xl"
                >
                  <div className="bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl flex justify-between items-center flex-wrap gap-4 shadow-sm">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">Interactive Setup Wizard</h2>
                      <p className="text-zinc-400 text-xs">Configure and provision the media stack step-by-step</p>
                    </div>
                    <div className="flex gap-1.5 font-mono text-[11px] bg-neutral-950 p-1 border border-neutral-800/80 rounded-xl">
                      {[1, 2, 3, 4].map(s => (
                        <button 
                          key={s}
                          onClick={() => setWizardStep(s)}
                          className={`h-7 px-3.5 rounded-lg flex items-center justify-center font-bold transition-all ${
                            wizardStep === s ? 'bg-zinc-100 text-neutral-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
                          }`}
                        >
                          Step {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-900/40 border border-neutral-800/80 p-6 rounded-2xl min-h-[400px]">
                    {wizardStep === 1 && (
                      <div className="space-y-6">
                        <div className="border-b border-neutral-800/60 pb-4">
                          <h3 className="text-base font-bold text-white">Step 1: Crostini Linux Host Security Audit</h3>
                          <p className="text-xs text-zinc-400">We must verify if essential tools are installed on your Chromebook's Linux sandbox.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-neutral-900/40 border border-neutral-800/80 p-4 rounded-xl flex items-center justify-between hover:border-neutral-700/50 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-lg bg-neutral-800 text-zinc-300 font-bold font-mono text-xs">DK</div>
                              <div>
                                <h4 className="text-sm font-semibold text-white">Docker Engine</h4>
                                <p className="text-[11px] text-zinc-400">Primary container daemon runtime</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-green-400 flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                              <Check className="h-3.5 w-3.5" /> Installed
                            </span>
                          </div>

                          <div className="bg-neutral-900/40 border border-neutral-800/80 p-4 rounded-xl flex items-center justify-between hover:border-neutral-700/50 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-lg bg-neutral-800 text-zinc-300 font-bold font-mono text-xs">DC</div>
                              <div>
                                <h4 className="text-sm font-semibold text-white">Docker Compose</h4>
                                <p className="text-[11px] text-zinc-400">Multi-container manager engine</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-green-400 flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                              <Check className="h-3.5 w-3.5" /> Installed
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <button 
                            onClick={() => setWizardStep(2)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-neutral-950 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                          >
                            Proceed to Variables
                          </button>
                        </div>
                      </div>
                    )}

                    {wizardStep === 2 && (
                      <div className="space-y-6">
                        <div className="border-b border-neutral-800/60 pb-4">
                          <h3 className="text-base font-bold text-white">Step 2: Configuration Variables</h3>
                          <p className="text-xs text-zinc-400">Customize hostnames, usernames, subnet coordinates and timezone settings.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wide font-mono text-zinc-400">Crostini Username</label>
                            <input 
                              type="text" 
                              value={username} 
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wide font-mono text-zinc-400">Local Subnet Range</label>
                            <input 
                              type="text" 
                              value={localSubnet} 
                              onChange={(e) => setLocalSubnet(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between pt-4">
                          <button 
                            onClick={() => setWizardStep(1)}
                            className="bg-neutral-900 border border-neutral-800 text-zinc-400 hover:bg-neutral-800 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                          >
                            Back
                          </button>
                          <button 
                            onClick={() => setWizardStep(3)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-neutral-950 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                          >
                            Proceed to Credentials
                          </button>
                        </div>
                      </div>
                    )}

                    {wizardStep === 3 && (
                      <div className="space-y-6">
                        <div className="border-b border-neutral-800/60 pb-4">
                          <h3 className="text-base font-bold text-white">Step 3: Secure VPN Credentials</h3>
                          <p className="text-xs text-zinc-400">Provide WireGuard configuration details to allow secure, encrypted container gateways.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wide font-mono text-zinc-400">WireGuard Private Key</label>
                            <input 
                              type="text" 
                              value={wgPrivateKey} 
                              onChange={(e) => setWgPrivateKey(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wide font-mono text-zinc-400">WireGuard IPv4 Address</label>
                            <input 
                              type="text" 
                              value={wgAddress} 
                              onChange={(e) => setWgAddress(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between pt-4">
                          <button 
                            onClick={() => setWizardStep(2)}
                            className="bg-neutral-900 border border-neutral-800 text-zinc-400 hover:bg-neutral-800 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                          >
                            Back
                          </button>
                          <button 
                            onClick={() => setWizardStep(4)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-neutral-950 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                          >
                            Proceed to Deployment
                          </button>
                        </div>
                      </div>
                    )}

                    {wizardStep === 4 && (
                      <div className="space-y-6">
                        <div className="border-b border-neutral-800/60 pb-4">
                          <h3 className="text-base font-bold text-white">Step 4: Stack Composition & Deployment</h3>
                          <p className="text-xs text-zinc-400">Compile container files, write Caddy reverse-proxy routers and initiate docker-compose routines.</p>
                        </div>

                        <div className="space-y-4">
                          <button 
                            onClick={handleDeployStack}
                            disabled={deploymentRunning}
                            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            {deploymentRunning ? "Deploying Stack..." : "Deploy 1-Click Stack"}
                          </button>

                          {deploymentLogs.length > 0 && (
                            <pre className="p-4 bg-neutral-950 border border-neutral-850 rounded-xl font-mono text-[11px] text-emerald-400 max-h-40 overflow-y-auto">
                              {deploymentLogs.map((log, idx) => <div key={idx}>{log}</div>)}
                            </pre>
                          )}
                        </div>

                        <div className="flex justify-between pt-4 border-t border-neutral-800/60">
                          <button 
                            onClick={() => setWizardStep(3)}
                            className="bg-neutral-900 border border-neutral-800 text-zinc-400 hover:bg-neutral-800 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                          >
                            Back
                          </button>
                          <button 
                            onClick={handleFinalize}
                            className="bg-zinc-100 hover:bg-zinc-200 text-neutral-950 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Finalize & Lock Setup
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: BROWSE CATALOG */}
              {activeTab === 'browse' && (
                <motion.div 
                  key="browse"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="animate-fadeIn"
                >
                  <BrowseTab 
                    watchlist={watchlist} 
                    onRequestMedia={handleRequestMedia}
                    isFinalized={isFinalized}
                  />
                </motion.div>
              )}

              {/* TAB 3: WATCHLIST VIEWER & DOWNLOADS */}
              {activeTab === 'watchlist' && (
                <motion.div 
                  key="watchlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 max-w-5xl animate-fadeIn"
                >
                  <div className="bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-sm">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                        <ListVideo className="text-zinc-400" />
                        Integrated Watchlist Viewer
                      </h2>
                      <p className="text-zinc-400 text-xs mt-1">
                        Track requested movies and TV series, synchronizing automatically from Jellyseerr.
                      </p>
                    </div>
                  </div>

                  <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                    {watchlistLoading ? (
                      <div className="py-8 text-center text-zinc-500 font-mono text-xs animate-pulse">
                        {currentLoadingMessage}
                      </div>
                    ) : watchlist.length === 0 ? (
                      <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                        The Archives are currently empty.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {watchlist.map((item) => (
                          <div key={item.id} className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl flex items-center gap-4 hover:border-neutral-700 transition-all">
                            <img src={item.posterUrl} alt={item.title} className="w-16 h-20 object-cover rounded-lg border border-neutral-800/40" />
                            <div className="flex-1 space-y-1.5 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate leading-none">{item.title}</h4>
                              <span className="text-[9px] font-mono uppercase bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-850 text-zinc-500">
                                {item.type === 'movie' ? '🎬 Movie' : '📺 TV Series'}
                              </span>

                              <div className="pt-2 space-y-1">
                                <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                                  <span>STATUS: {item.status.toUpperCase()}</span>
                                  <span>{item.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-850/40">
                                  <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Torrent Downloader Section */}
                  <DownloadsSection 
                    onAddNotification={addNotification} 
                    triggerInsight={triggerInsight} 
                  />
                </motion.div>
              )}

              {/* TAB 4: NETWORKING & UFW */}
              {activeTab === 'networking' && (
                <motion.div 
                  key="networking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="animate-fadeIn"
                >
                  <NetworkingTab 
                    containers={containers}
                    setContainers={setContainers}
                    logLines={logLines}
                    setLogLines={setLogLines}
                    selectedLogContainer={selectedLogContainer}
                    setSelectedLogContainer={setSelectedLogContainer}
                    speedTestData={speedTestData}
                    speedTestRunning={speedTestRunning}
                    runSpeedTest={runSpeedTest}
                    localSubnet={localSubnet}
                    customRules={customRules}
                    setCustomRules={setCustomRules}
                    ufwScript={ufwScript}
                    copiedText={copiedText}
                    handleCopy={handleCopy}
                    triggerInsight={triggerInsight}
                    isApplyingFirewall={isApplyingFirewall}
                    setIsApplyingFirewall={setIsApplyingFirewall}
                    firewallLogs={firewallLogs}
                    setFirewallLogs={setFirewallLogs}
                    firewallApplied={firewallApplied}
                    setFirewallApplied={setFirewallApplied}
                    vpnOutage={vpnOutage}
                    caddyOutage={caddyOutage}
                    diskFullOutage={diskFullOutage}
                    trackerTimeout={trackerTimeout}
                    onTriggerOutageInsight={handleTriggerOutageInsight}
                    cpuSpikeActive={cpuSpikeActive}
                    setCpuSpikeActive={setCpuSpikeActive}
                  />
                </motion.div>
              )}

              {/* TAB 5: MASTER SETTINGS UTILITY */}
              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="animate-fadeIn"
                >
                  <SettingsTab 
                    username={username}
                    setUsername={setUsername}
                    localSubnet={localSubnet}
                    setLocalSubnet={setLocalSubnet}
                    wgPrivateKey={wgPrivateKey}
                    setWgPrivateKey={setWgPrivateKey}
                    wgAddress={wgAddress}
                    setWgAddress={setWgAddress}
                    timezone={timezone}
                    setTimezone={setTimezone}
                    qbPassword={qbPassword}
                    aiostreamsSecret={aiostreamsSecret}
                    mediaflowPassword={mediaflowPassword}
                    generateNewPasswords={generateNewPasswords}
                    dirCreationCommand={dirCreationCommand}
                    copiedText={copiedText}
                    handleCopy={handleCopy}
                    isDevMode={isDevMode}
                    setIsDevMode={setIsDevMode}
                    dockerCompose={dockerCompose}
                    setDockerCompose={setDockerCompose}
                    caddyfile={caddyfile}
                    setCaddyfile={setCaddyfile}
                    ufwScript={ufwScript}
                    setUfwScript={setUfwScript}
                    vpnOutage={vpnOutage}
                    setVpnOutage={setVpnOutage}
                    caddyOutage={caddyOutage}
                    setCaddyOutage={setCaddyOutage}
                    diskFullOutage={diskFullOutage}
                    setDiskFullOutage={setDiskFullOutage}
                    trackerTimeout={trackerTimeout}
                    setTrackerTimeout={setTrackerTimeout}
                    triggerInsight={triggerInsight}
                    setLogLines={setLogLines}
                    focusedSection={focusedSection}
                    setFocusedSection={setFocusedSection}
                    simulatedError={simulatedError}
                    setSimulatedError={setSimulatedError}
                  />

                  {/* Unlock Setup wizard option */}
                  {isFinalized && (
                    <div className="mt-6 pt-6 border-t border-neutral-850 flex justify-end">
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to unlock the Setup Wizard? This will allow you to modify variables and redeploy the container stack.")) {
                            setIsFinalized(false);
                            localStorage.removeItem('media_control_center_finalized');
                            setActiveTab('setup');
                            triggerInsight("Insight: Setup unlocked! Adjust VM paths, VPN keys and re-trigger deployment routines.");
                          }
                        }}
                        className="text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-dashed border-neutral-800 hover:border-neutral-700 py-2 px-4 rounded-xl transition-all flex items-center gap-2"
                      >
                        <Lock className="h-3.5 w-3.5" /> Unlock Setup Wizard
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </main>
      </div>

      {/* FLOATING AI COACH CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
        
        {/* INSIGHT SPEECH BUBBLE */}
        <AnimatePresence>
          {currentInsight && !isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              onClick={() => {
                setIsChatOpen(true);
                setCurrentInsight(null);
                setUnreadInsightCount(0);
                setMessages(prev => [
                  ...prev,
                  { role: 'assistant', content: `💡 Master, I have formulated a DevOps Insight regarding your stack:\n\n${currentInsight}` }
                ]);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs p-4 rounded-xl shadow-2xl border border-indigo-500 max-w-xs cursor-pointer flex gap-3 relative"
              style={{ boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' }}
            >
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Info className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-200 block">Alfred's Insight</span>
                <p className="leading-snug text-slate-100">{currentInsight}</p>
                <span className="text-[9px] text-indigo-200 underline block font-medium">Click to discuss with Alfred</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentInsight(null);
                }}
                className="absolute top-2 right-2 text-indigo-300 hover:text-white cursor-pointer"
              >
                <span className="text-[12px] font-bold">×</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
 
        {/* CHAT WINDOW */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="w-96 h-[480px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
              style={{ boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              {/* Header */}
              <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-2">
                  {/* SVG Butler Collar Icon */}
                  <svg className="h-7 w-7 rounded-full border border-indigo-300 bg-slate-950 p-1 shrink-0 text-indigo-300 shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1" />
                    <path d="M12 14.5l-1.5-1v2.5l1.5-1.5zm0 0l1.5-1v2.5l-1.5-1.5z" fill="currentColor" strokeWidth="0" />
                    <path d="M9 13.5l3 2 3-2" strokeWidth="1" />
                  </svg>
                  <div>
                    <h4 className="text-xs font-bold leading-none">Alfred</h4>
                    <span className="text-[9px] text-indigo-200 font-mono">DevOps Butler Stack Expert</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speech synthesis en-GB toggle */}

                  <button 
                    onClick={() => setIsChatOpen(false)}
                    className="text-white hover:text-indigo-200 text-lg font-bold leading-none px-1.5 py-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>
 
              {/* Chat body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/85">
                {messages.map((m, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-lg p-3 text-[11px] leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white font-medium shadow-sm' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200 font-mono whitespace-pre-wrap shadow-sm'
                    }`}>
                      {m.role === 'assistant' && (
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-indigo-400">Alfred</span>
                        </div>
                      )}
                      {m.content}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 text-indigo-400 animate-spin" />
                      <span className="text-slate-400 font-mono">Alfred is preparing a suggestion...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
 
              {/* Suggestion tags (Enhanced based on Developer Mode context!) */}
              <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/60 overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0">
                <button 
                  onClick={() => setAiInput("How do I fix the WireGuard Gluetun TUN permission error on Chromebook?")}
                  className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 px-2.5 py-1 rounded border border-slate-800/80 transition-all inline-block cursor-pointer font-mono"
                >
                  TUN Permission?
                </button>
                <button 
                  onClick={() => setAiInput(isDevMode ? "Optimize my Docker Compose configurations for memory consumption." : "Show me the Docker compose block to add Bazarr subtitles automation.")}
                  className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 px-2.5 py-1 rounded border border-slate-800/80 transition-all inline-block cursor-pointer font-mono"
                >
                  {isDevMode ? "Optimize Compose?" : "Add Bazarr?"}
                </button>
                <button 
                  onClick={() => setAiInput(isDevMode ? "Review UFW rules config inside Debian secure-ufw-rules.sh script." : "My Tailscale IP is 100.64.0.1. How do I configure UFW rules for this specific interface?")}
                  className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 px-2.5 py-1 rounded border border-slate-800/80 transition-all inline-block cursor-pointer font-mono"
                >
                  {isDevMode ? "Review UFW script?" : "Tailscale UFW?"}
                </button>
              </div>
 
              {/* Input Form */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0">
                <input 
                  id="floating-ai-prompt"
                  type="text"
                  placeholder="Inquire Alfred regarding homelab, DevOps, networks..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white font-sans"
                />
                <button 
                  id="floating-btn-ai-send"
                  onClick={handleSendAiMessage}
                  disabled={isAiLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
 
        {/* CHAT TRIGGER BUTTON */}
        {!isChatOpen && (
          <button
            id="floating-chat-trigger"
            onClick={() => {
              setIsChatOpen(true);
              setUnreadInsightCount(0);
            }}
            className="h-14 w-14 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-white relative group border border-indigo-400"
            style={{ boxShadow: '0 10px 30px -5px rgba(79, 70, 229, 0.5)' }}
          >
            {unreadInsightCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-slate-950 animate-pulse">
                {unreadInsightCount}
              </span>
            )}
            <div className="relative">
              {/* Custom SVG Butler collar inside the launcher button! */}
              <svg className="h-7 w-7 text-white transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="7" r="4" />
                <path d="M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1" />
                <path d="M12 14.5l-1.5-1v2.5l1.5-1.5zm0 0l1.5-1v2.5l-1.5-1.5z" fill="currentColor" strokeWidth="0" />
                <path d="M9 13.5l3 2 3-2" strokeWidth="1" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* APP LEVEL SLIDING TOAST NOTIFICATIONS OVERLAY */}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.9 }}
              className="pointer-events-auto bg-neutral-900/95 backdrop-blur-md border rounded-xl p-3.5 shadow-2xl flex items-start gap-3 relative overflow-hidden"
              style={{ 
                borderColor: 
                  n.type === 'success' ? 'rgba(16, 185, 129, 0.35)' :
                  n.type === 'warning' ? 'rgba(245, 158, 11, 0.35)' :
                  n.type === 'error' ? 'rgba(239, 68, 68, 0.35)' :
                  'rgba(99, 102, 241, 0.35)',
                boxShadow: '0 12px 30px -8px rgba(0,0,0,0.5)'
              }}
            >
              {/* Background Glow */}
              <div className={`absolute -top-10 -right-10 h-20 w-20 rounded-full filter blur-xl opacity-10 ${
                n.type === 'success' ? 'bg-emerald-500' :
                n.type === 'warning' ? 'bg-amber-500' :
                n.type === 'error' ? 'bg-rose-500' :
                'bg-indigo-500'
              }`} />

              {/* Icon */}
              <div className={`p-1.5 rounded-lg shrink-0 ${
                n.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' :
                n.type === 'warning' ? 'bg-amber-500/15 text-amber-400' :
                n.type === 'error' ? 'bg-rose-500/15 text-rose-400' :
                'bg-indigo-500/15 text-indigo-400'
              }`}>
                {n.type === 'success' && <Check className="h-4 w-4" />}
                {n.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                {n.type === 'error' && <AlertTriangle className="h-4 w-4 text-rose-400" />}
                {n.type === 'info' && <Info className="h-4 w-4" />}
              </div>

              {/* Text details */}
              <div className="space-y-0.5 min-w-0">
                <h5 className="text-[10px] font-bold text-white font-mono uppercase tracking-wider leading-none">{n.title}</h5>
                <p className="text-[10px] text-zinc-400 leading-normal font-sans pr-1">{n.message}</p>
                <span className="text-[8px] font-mono text-zinc-600 block pt-0.5">{n.timestamp}</span>
              </div>

              {/* Close button */}
              <button 
                onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                className="text-zinc-500 hover:text-white transition-colors shrink-0 text-sm cursor-pointer"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* GLOBAL BOOT-TIME ATTENTION-NEEDED NOTIFICATION */}
      <AnimatePresence>
        {bootNotification && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[99] bg-neutral-900 border border-red-500/40 px-5 py-3 rounded-xl flex items-center gap-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] max-w-xl text-xs"
          >
            <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse shrink-0" />
            <div className="text-left font-sans">
              <span className="font-mono font-bold text-red-400 block uppercase text-[10px] tracking-wider">Immediate Attention Required</span>
              <p className="text-zinc-300 font-medium leading-relaxed mt-0.5">{bootNotification}</p>
            </div>
            <button
              onClick={() => setBootNotification(null)}
              className="text-zinc-500 hover:text-white font-mono font-bold ml-2 text-sm cursor-pointer hover:bg-neutral-800 h-6 w-6 rounded flex items-center justify-center transition-colors"
              title="Acknowledge & close"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BATCOMPUTER ERROR OVERLAY */}
      <AnimatePresence>
        {simulatedError !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950 z-[1000] flex flex-col items-center justify-center p-6 text-zinc-100 font-mono select-none overflow-hidden"
            style={{ backgroundImage: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.1) 0%, rgba(10, 10, 10, 1) 100%)' }}
          >
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none animate-pulse" />

            <div className="max-w-2xl w-full border border-red-500/30 bg-neutral-900/85 backdrop-blur-md p-8 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] flex flex-col items-center text-center space-y-6 relative">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] text-red-500/50">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span>CRITICAL OUTAGE</span>
              </div>

              {/* Glowing Batman Symbol inside a warning circle */}
              <div className="h-16 w-16 bg-red-950/40 border border-red-500/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <svg className="h-8 w-14 text-red-500 fill-current" viewBox="0 0 24 12">
                  <path d="M12 1.5c.3 1.2 1 2.2 2 2.8.8.5 1.7.6 2.5.5.9-.1 1.8-.4 2.5-.9.4.6.6 1.3.6 2.1 0 2.2-2.2 4-5 4.5-.8.1-1.6.1-2.4-.1-1.1-.3-2-.9-2.5-1.7-.5.8-1.4 1.4-2.5 1.7-.8.2-1.6.2-2.4.1-2.8-.5-5-2.3-5-4.5 0-.8.2-1.5.6-2.1.7.5 1.6.8 2.5.9.8.1 1.7 0 2.5-.5 1-.6 1.7-1.6 2-2.8.2.8.5 1.5 1 2.1.5-.6.8-1.3 1-2.1z" />
                </svg>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-red-500 uppercase">
                  System Error {simulatedError}
                </h2>
                <div className="h-0.5 w-32 bg-red-500/30 mx-auto" />
              </div>

              <p className="text-lg font-medium text-white max-w-md leading-relaxed px-4 py-2 border-l-2 border-red-500/40 bg-red-950/10">
                "{
                  simulatedError === 404 ? "The Riddler hid this page." :
                  simulatedError === 403 ? "Alfred cannot authorize that request." :
                  simulatedError === 401 ? "Identity could not be verified, Master Wayne." :
                  simulatedError === 429 ? "Even Batman has limits." :
                  simulatedError === 500 ? "The Batcomputer encountered an unexpected anomaly." :
                  simulatedError === 502 ? "Oracle isn't responding." :
                  simulatedError === 503 ? "WayneTech systems are undergoing maintenance." :
                  simulatedError === 504 ? "Communications with Gotham have timed out." :
                  simulatedError === 418 ? "Alfred refuses to brew tea in the server room." :
                  "A critical anomaly has disrupted the Batcomputer."
                }"
              </p>

              <div className="text-[11px] text-zinc-500 font-mono space-y-1 text-left w-full bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
                <div>&gt; LOCATION: BATCAVE_SERVER_ROOM_A</div>
                <div>&gt; COMPILER: TAILORED BRUSH-CLEAN DEBIAN DAEMON</div>
                <div>&gt; SYSTEM_INTEGRITY: DEGRADED</div>
                <div>&gt; CONNECTION_STATE: ENCRYPTED_TUNNEL_BLOCKED</div>
                <div>&gt; AUDITING_UTILITY: ALFRED_BUTLER_AGENT_v1.0.4</div>
              </div>

              <button
                onClick={() => setSimulatedError(null)}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-sans transition-all shadow-md shadow-red-900/30 cursor-pointer active:scale-95"
              >
                Acknowledge & Restore Batcomputer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
