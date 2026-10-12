import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  RefreshCw, 
  FolderCheck, 
  Terminal, 
  Wrench, 
  AlertTriangle, 
  Zap, 
  Cpu, 
  HelpCircle,
  Copy,
  Check,
  Flame,
  FileCode,
  Database,
  Search
} from 'lucide-react';

interface SettingsTabProps {
  username: string;
  setUsername: (val: string) => void;
  localSubnet: string;
  setLocalSubnet: (val: string) => void;
  wgPrivateKey: string;
  setWgPrivateKey: (val: string) => void;
  wgAddress: string;
  setWgAddress: (val: string) => void;
  timezone: string;
  setTimezone: (val: string) => void;
  qbPassword: string;
  aiostreamsSecret: string;
  mediaflowPassword: string;
  generateNewPasswords: () => void;
  dirCreationCommand: string;
  copiedText: string | null;
  handleCopy: (text: string, label: string) => void;
  isDevMode: boolean;
  setIsDevMode: (val: boolean) => void;
  
  // Advanced configuration editors
  dockerCompose: string;
  setDockerCompose: (val: string) => void;
  caddyfile: string;
  setCaddyfile: (val: string) => void;
  ufwScript: string;
  setUfwScript: (val: string) => void;
  
  // Outage / Chaos Simulator
  vpnOutage: boolean;
  setVpnOutage: (val: boolean) => void;
  caddyOutage: boolean;
  setCaddyOutage: (val: boolean) => void;
  diskFullOutage: boolean;
  setDiskFullOutage: (val: boolean) => void;
  trackerTimeout: boolean;
  setTrackerTimeout: (val: boolean) => void;
  triggerInsight: (text: string) => void;
  
  // Logs stream output
  setLogLines: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Focused section from sidebar settings cog click
  focusedSection: string | null;
  setFocusedSection: (val: string | null) => void;
  simulatedError: number | null;
  setSimulatedError: (val: number | null) => void;
}

export default function SettingsTab({
  username,
  setUsername,
  localSubnet,
  setLocalSubnet,
  wgPrivateKey,
  setWgPrivateKey,
  wgAddress,
  setWgAddress,
  timezone,
  setTimezone,
  qbPassword,
  aiostreamsSecret,
  mediaflowPassword,
  generateNewPasswords,
  dirCreationCommand,
  copiedText,
  handleCopy,
  isDevMode,
  setIsDevMode,
  dockerCompose,
  setDockerCompose,
  caddyfile,
  setCaddyfile,
  ufwScript,
  setUfwScript,
  vpnOutage,
  setVpnOutage,
  caddyOutage,
  setCaddyOutage,
  diskFullOutage,
  setDiskFullOutage,
  trackerTimeout,
  setTrackerTimeout,
  triggerInsight,
  setLogLines,
  focusedSection,
  setFocusedSection,
  simulatedError,
  setSimulatedError
}: SettingsTabProps) {

  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [activeSubSection, setActiveSubSection] = useState<'basics' | 'directories' | 'developer'>('basics');

  // Trigger scroll and focus flash if focusedSection is updated
  useEffect(() => {
    if (focusedSection) {
      setActiveSubSection('basics');
      const element = document.getElementById(`section-${focusedSection}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('animate-pulse', 'border-indigo-500');
        setTimeout(() => {
          element.classList.remove('animate-pulse', 'border-indigo-500');
          setFocusedSection(null);
        }, 3000);
      }
    }
  }, [focusedSection]);

  const handleRunTerminalCommand = () => {
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalOutput(prev => [...prev, `$ ${cmd}`]);
    setTerminalInput('');

    setTimeout(() => {
      let response = "Command executed successfully.";
      if (cmd.startsWith("sudo ufw")) {
        response = "Status: active\n\nTo                         Action      From\n--                         ------      ----\n8096/tcp (Jellyfin)        ALLOW       192.168.1.0/24\n7000/tcp                   ALLOW       192.168.1.0/24\nAnywhere on tailscale0     ALLOW       Anywhere";
      } else if (cmd.includes("docker") || cmd.includes("compose")) {
        response = "gluetun        Up 1d 4h      10.0.0.2\nqbittorrent    Up 1d 4h      10.80.80.1\njellyseerr     Up 1d 4h      80/tcp\njellyfin       Up 1d 4h      8096/tcp\ncaddy          Up 1d 4h      80/tcp";
      } else if (cmd.includes("df") || cmd.includes("free")) {
        response = "Filesystem      Size  Used Avail Use% Mounted on\n/dev/vdb         28G   18G  9.1G  67% /";
      } else {
        response = `bash: command executed securely inside Debian Crostini sandbox:\n[info] host mapping evaluated successfully.`;
      }
      setTerminalOutput(prev => [...prev, response]);
      
      const timeStr = new Date().toLocaleTimeString();
      setLogLines(prev => [...prev, `[${timeStr}] DEV_SHELL: executed "${cmd}" successfully.`]);
    }, 400);
  };

  const handleToggleVpnOutage = () => {
    const newVal = !vpnOutage;
    setVpnOutage(newVal);
    if (newVal) {
      triggerInsight("🚨 VPN Gateway connection collapsed! gluetun has engaged VPN killswitch. All downloader microservices are currently isolated.");
    } else {
      triggerInsight("💡 VPN tunnel established. Handshake re-validated with custom WireGuard endpoint.");
    }
  };

  const handleToggleCaddyOutage = () => {
    const newVal = !caddyOutage;
    setCaddyOutage(newVal);
    if (newVal) {
      triggerInsight("🚨 Reverse Proxy bind socket error! Caddy container failed to secure port 80. Browser dashboard routes offline.");
    } else {
      triggerInsight("💡 Caddy successfully listening on localhost:80 proxying browser requests.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header card */}
      <div className="bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Settings className="text-zinc-400" />
            Master Settings Utility
          </h2>
          <p className="text-zinc-400 text-xs mt-1">Configure WireGuard networks, passwords, username parameters, directory maps, and toggle active Developer mode.</p>
        </div>
        
        {/* Toggleable Settings subsections and Search */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search settings, tools, or configurations..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-1.5 font-mono text-[11px] bg-neutral-950 p-1 border border-neutral-800/80 rounded-xl">
            <button 
              onClick={() => setActiveSubSection('basics')}
              className={`h-7 px-3.5 rounded-lg flex items-center justify-center font-bold transition-all ${
                activeSubSection === 'basics' ? 'bg-zinc-100 text-neutral-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Core Configuration
            </button>
            <button 
              onClick={() => setActiveSubSection('directories')}
              className={`h-7 px-3.5 rounded-lg flex items-center justify-center font-bold transition-all ${
                activeSubSection === 'directories' ? 'bg-zinc-100 text-neutral-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Directories & Host
            </button>
            <button 
              onClick={() => setActiveSubSection('developer')}
              className={`h-7 px-3.5 rounded-lg flex items-center justify-center font-bold transition-all ${
                activeSubSection === 'developer' ? 'bg-zinc-100 text-neutral-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Developer Panel
            </button>
          </div>
        </div>
      </div>

      {/* Subsection switcher */}
      {activeSubSection === 'basics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Main settings variables */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="border-b border-neutral-800/60 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Parameters & Secrets Configuration</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Adjust paths, credentials and keys generated by the interactive wizard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div id="section-gluetun" className="bg-neutral-950/40 border border-neutral-850 p-4 rounded-xl space-y-3 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-400 flex items-center gap-1">
                  <Key className="h-3 w-3 text-indigo-400" /> Gluetun VPN / WireGuard
                </span>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">WG Private Key</label>
                    <input 
                      type="text" 
                      value={wgPrivateKey} 
                      onChange={(e) => setWgPrivateKey(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">WG Address / CIDR</label>
                    <input 
                      type="text" 
                      value={wgAddress} 
                      onChange={(e) => setWgAddress(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div id="section-jellyseerr" className="bg-neutral-950/40 border border-neutral-850 p-4 rounded-xl space-y-3 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-400 flex items-center gap-1">
                  <Settings className="h-3 w-3 text-indigo-400" /> Host & Networking
                </span>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">ChromeOS Subnet</label>
                    <input 
                      type="text" 
                      value={localSubnet} 
                      onChange={(e) => setLocalSubnet(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">Linux Username</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div id="section-jellyfin" className="bg-neutral-950/40 border border-neutral-850 p-4 rounded-xl space-y-3 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-400 flex items-center gap-1">
                  <Database className="h-3 w-3 text-indigo-400" /> Jellyfin Metadata
                </span>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">Timezone Location</label>
                    <input 
                      type="text" 
                      value={timezone} 
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div id="section-qbittorrent" className="bg-neutral-950/40 border border-neutral-850 p-4 rounded-xl space-y-3 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-400 flex items-center gap-1">
                  <Wrench className="h-3 w-3 text-indigo-400" /> Automated passwords
                </span>

                <div className="space-y-1.5 text-[11px] text-zinc-400 font-mono">
                  <div className="flex justify-between border-b border-neutral-850 pb-1">
                    <span>qBittorrent:</span>
                    <span className="text-white font-semibold">{qbPassword}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-850 pb-1">
                    <span>AIOStreams:</span>
                    <span className="text-white font-semibold">{aiostreamsSecret}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mediaflow:</span>
                    <span className="text-white font-semibold">{mediaflowPassword}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-800/60">
              <div className="text-xs text-zinc-500 font-sans">
                Secure encryption generated using standard 256-bit hash.
              </div>
              <button 
                onClick={generateNewPasswords}
                className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-zinc-700 text-zinc-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-generate Passwords
              </button>
            </div>
          </div>

          {/* Quick specs sidebar */}
          <div className="bg-neutral-900/40 border border-neutral-800/80 p-5 rounded-2xl space-y-4 text-xs font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-500">Security Parameters Summary</h3>
            <p className="text-zinc-400 leading-normal">
              These values represent coordinates required for the Docker Stack. Standard directories are mapped relative to your Chromebook user account <code className="text-white bg-neutral-950 px-1 py-0.5 rounded font-mono font-bold">/home/{username}</code>.
            </p>
            <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl space-y-2 text-[11px] font-mono leading-relaxed text-zinc-400">
              <div className="flex justify-between">
                <span>LOCAL_USER:</span>
                <span className="text-zinc-200">{username}</span>
              </div>
              <div className="flex justify-between">
                <span>SUBNET_RANGE:</span>
                <span className="text-zinc-200">{localSubnet}</span>
              </div>
              <div className="flex justify-between">
                <span>TIMEZONE:</span>
                <span className="text-zinc-200">{timezone}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeSubSection === 'directories' && (
        <div className="bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
          
          <div className="border-b border-neutral-800/60 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FolderCheck className="text-indigo-400 h-4 w-4" /> Crostini Directory mapping schema
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Run this command once on your Chromebook shell to configure container storage mappings.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-neutral-950 border border-neutral-850 rounded-xl overflow-hidden">
              <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-850 flex justify-between items-center">
                <span className="text-xs font-mono text-zinc-400 font-bold">host_directories_bootstrap.sh</span>
                <button 
                  onClick={() => handleCopy(dirCreationCommand, 'directories')}
                  className="text-[10px] bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-zinc-700 text-zinc-200 px-3 py-1 rounded-lg transition-all flex items-center gap-1 font-mono font-bold"
                >
                  {copiedText === 'directories' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed select-text whitespace-pre-wrap">
                {dirCreationCommand}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-zinc-400">
              <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-850">
                <span className="font-bold text-white block mb-1">Downloads / Torrents</span>
                <span className="text-[11px] leading-relaxed">Stored securely in <code className="text-indigo-300 font-mono font-bold">~/media-data/torrents/</code> inside your fast local partition.</span>
              </div>
              <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-850">
                <span className="font-bold text-white block mb-1">Media Files Library</span>
                <span className="text-[11px] leading-relaxed">Mapped securely inside <code className="text-indigo-300 font-mono font-bold">~/media-data/media/</code> to stream seamlessly with Jellyfin.</span>
              </div>
              <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-850">
                <span className="font-bold text-white block mb-1">Configs & Databases</span>
                <span className="text-[11px] leading-relaxed">Maintained relative to <code className="text-indigo-300 font-mono font-bold">~/.config/media-stack/</code> backing up automatically.</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeSubSection === 'developer' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main developer panel */}
          <div className="bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-800/60 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-indigo-400" /> Crostini VM Developer Playground
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Access direct system variables, write raw configuration scripts, or execute shell statements.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Developer Mode:</span>
                <button 
                  onClick={() => setIsDevMode(!isDevMode)}
                  className={`text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded border transition-all ${
                    isDevMode ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 'bg-neutral-950 border-neutral-850 text-zinc-500'
                  }`}
                >
                  {isDevMode ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>

            {isDevMode ? (
              <div className="space-y-6">
                
                {/* Chaos Simulator Controls */}
                <div className="bg-neutral-950/60 border border-neutral-850 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-400" />
                    <span className="text-xs font-bold uppercase font-mono text-zinc-200">Active Outage & Chaos Simulator</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Toggle infrastructure errors below to test the automatic AI DevOps Insight Speech bubble. The system instantly notifies you with precise suggestions to solve the issue.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                      onClick={handleToggleVpnOutage}
                      className={`py-2 px-3 border rounded-xl text-[10px] font-bold font-mono transition-all text-center ${
                        vpnOutage 
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-sm animate-pulse' 
                          : 'bg-neutral-900 border-neutral-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      VPN OUTAGE: {vpnOutage ? 'ACTIVE' : 'OFF'}
                    </button>
                    <button 
                      onClick={handleToggleCaddyOutage}
                      className={`py-2 px-3 border rounded-xl text-[10px] font-bold font-mono transition-all text-center ${
                        caddyOutage 
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-sm animate-pulse' 
                          : 'bg-neutral-900 border-neutral-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      CADDY OFFLINE: {caddyOutage ? 'ACTIVE' : 'OFF'}
                    </button>
                    <button 
                      onClick={() => {
                        const newVal = !diskFullOutage;
                        setDiskFullOutage(newVal);
                        if (newVal) {
                          triggerInsight("🚨 Crostini disk storage low alert! Safe mode limits writing download assets.");
                        } else {
                          triggerInsight("💡 Disk partition verified. Spreading 9GB storage buffer safely.");
                        }
                      }}
                      className={`py-2 px-3 border rounded-xl text-[10px] font-bold font-mono transition-all text-center ${
                        diskFullOutage 
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-sm' 
                          : 'bg-neutral-900 border-neutral-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      DISK FULL: {diskFullOutage ? 'ACTIVE' : 'OFF'}
                    </button>
                    <button 
                      onClick={() => {
                        const newVal = !trackerTimeout;
                        setTrackerTimeout(newVal);
                        if (newVal) {
                          triggerInsight("🚨 P2P torrent client tracker handshake error. Downloads temporarily suspended.");
                        } else {
                          triggerInsight("💡 P2P trackers updated. Handshake connection established.");
                        }
                      }}
                      className={`py-2 px-3 border rounded-xl text-[10px] font-bold font-mono transition-all text-center ${
                        trackerTimeout 
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-sm' 
                          : 'bg-neutral-900 border-neutral-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      TRACKER TIMEOUT: {trackerTimeout ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>

                  {/* Batcomputer Incident Simulator (Error Codes) */}
                  <div className="pt-4 border-t border-neutral-800/60 space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs font-bold uppercase font-mono text-zinc-300">Batcomputer Incident Tester (Themed Error Pages)</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Master Wayne, simulate any of the core server error responses to review their bespoke, Batman-themed messages and glitch layouts.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[404, 403, 401, 429, 500, 502, 503, 504, 418].map(code => (
                        <button
                          key={code}
                          onClick={() => setSimulatedError(code)}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-red-950/20 hover:border-red-500/40 border border-neutral-800 rounded-lg text-[10px] font-mono font-bold text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                        >
                          Trigger {code}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Configuration Files Editors */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase font-mono text-zinc-200">Raw Stack Config File Editors</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase font-mono text-zinc-400">docker-compose.yml</label>
                      <textarea 
                        value={dockerCompose} 
                        onChange={(e) => setDockerCompose(e.target.value)}
                        className="w-full h-48 bg-neutral-950 border border-neutral-850 rounded-xl p-3 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-zinc-700 leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase font-mono text-zinc-400">Caddyfile</label>
                      <textarea 
                        value={caddyfile} 
                        onChange={(e) => setCaddyfile(e.target.value)}
                        className="w-full h-48 bg-neutral-950 border border-neutral-850 rounded-xl p-3 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-zinc-700 leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => {
                        triggerInsight("Insight: Raw config edits saved to virtual memory. They are ready for deployment.");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" /> Save Configuration Edits
                    </button>
                  </div>
                </div>

                {/* Terminal Script runner */}
                <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                  <div className="bg-neutral-900/60 px-4 py-2 border-b border-neutral-850 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-mono text-zinc-300 font-bold">Interactive Debian Shell Console</span>
                  </div>

                  <div className="p-4 space-y-3 font-mono text-[11px] h-32 overflow-y-auto border-b border-neutral-850 text-zinc-400 bg-neutral-950/80">
                    <div>$ # Type 'sudo ufw status' or 'docker compose ps' below to inspect stack configurations.</div>
                    {terminalOutput.map((out, i) => (
                      <div key={i} className="whitespace-pre-wrap">{out}</div>
                    ))}
                  </div>

                  <div className="p-3 bg-neutral-900 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type host commands here..." 
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRunTerminalCommand()}
                      className="flex-1 bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700 font-mono"
                    />
                    <button 
                      onClick={handleRunTerminalCommand}
                      className="bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs px-4 rounded-lg transition-all"
                    >
                      Run
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-neutral-800 rounded-2xl text-zinc-500 font-mono text-xs space-y-3">
                <Wrench className="h-8 w-8 text-zinc-600 mx-auto" />
                <p>Playground tools are currently deactivated. Secure sandbox is fully locked.</p>
                <button 
                  onClick={() => setIsDevMode(true)}
                  className="bg-indigo-600/15 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 text-xs px-4 py-2 rounded-xl transition-all font-bold"
                >
                  Activate Developer Sandbox
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
