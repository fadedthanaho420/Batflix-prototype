import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  Activity, 
  Terminal, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Plus, 
  Trash2, 
  Copy, 
  Info,
  Tv,
  HelpCircle,
  AlertCircle,
  Search,
  Maximize2,
  X,
  Lock,
  LockKeyhole,
  Eye,
  ActivityIcon
} from 'lucide-react';
import { ContainerStatus, CustomRule, SpeedTestData } from '../types';

interface NetworkingTabProps {
  containers: ContainerStatus[];
  setContainers: React.Dispatch<React.SetStateAction<ContainerStatus[]>>;
  logLines: string[];
  setLogLines: React.Dispatch<React.SetStateAction<string[]>>;
  selectedLogContainer: string;
  setSelectedLogContainer: (val: string) => void;
  speedTestData: SpeedTestData;
  speedTestRunning: boolean;
  runSpeedTest: () => void;
  localSubnet: string;
  customRules: CustomRule[];
  setCustomRules: React.Dispatch<React.SetStateAction<CustomRule[]>>;
  ufwScript: string;
  copiedText: string | null;
  handleCopy: (text: string, label: string) => void;
  triggerInsight: (text: string) => void;
  isApplyingFirewall: boolean;
  setIsApplyingFirewall: (val: boolean) => void;
  firewallLogs: string[];
  setFirewallLogs: React.Dispatch<React.SetStateAction<string[]>>;
  firewallApplied: boolean;
  setFirewallApplied: (val: boolean) => void;
  // Outage Simulation parameters
  vpnOutage: boolean;
  caddyOutage: boolean;
  diskFullOutage: boolean;
  trackerTimeout: boolean;
  onTriggerOutageInsight: (title: string, diagnostic: string, fix: string) => void;
  cpuSpikeActive: boolean;
  setCpuSpikeActive: React.Dispatch<React.SetStateAction<boolean>>;
}

interface LoggerEntry {
  time: string;
  type: 'info' | 'success' | 'blocked' | 'suspicious';
  service: string;
  message: string;
}

export default function NetworkingTab({
  containers,
  setContainers,
  logLines,
  setLogLines,
  selectedLogContainer,
  setSelectedLogContainer,
  speedTestData,
  speedTestRunning,
  runSpeedTest,
  localSubnet,
  customRules,
  setCustomRules,
  ufwScript,
  copiedText,
  handleCopy,
  triggerInsight,
  isApplyingFirewall,
  setIsApplyingFirewall,
  firewallLogs,
  setFirewallLogs,
  firewallApplied,
  setFirewallApplied,
  vpnOutage,
  caddyOutage,
  diskFullOutage,
  trackerTimeout,
  onTriggerOutageInsight,
  cpuSpikeActive,
  setCpuSpikeActive
}: NetworkingTabProps) {

  // Rule Form State
  const [newRulePort, setNewRulePort] = useState('');
  const [newRuleProto, setNewRuleProto] = useState<'tcp' | 'udp' | 'both'>('tcp');
  const [newRuleAction, setNewRuleAction] = useState<'allow' | 'deny'>('allow');
  const [newRuleSource, setNewRuleSource] = useState('');
  const [newRuleComment, setNewRuleComment] = useState('');

  // Diagnostic Scan States
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [scanStep, setScanStep] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<any | null>(null);

  // Log Streaming Filter States
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logFilterType, setLogFilterType] = useState<'all' | 'error' | 'info' | 'warn'>('all');

  // Leak Test and IP Verification States
  const [leakResult, setLeakResult] = useState<{ type: 'dns' | 'ip', status: 'secure' | 'danger', text: string } | null>(null);

  // Sandboxed Logger Window States
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [loggerNotificationCount, setLoggerNotificationCount] = useState(2); // Starts with 2 unread suspicious items
  const [loggerFilter, setLoggerFilter] = useState<'all' | 'red' | 'green'>('all');
  const [loggerLogs, setLoggerLogs] = useState<LoggerEntry[]>([
    { time: '12:08:14', type: 'info', service: 'gluetun', message: 'WireGuard tunnels initiating...' },
    { time: '12:08:15', type: 'success', service: 'gluetun', message: 'Handshake completed with NordVPN (Amsterdam, NL) - SECURED' },
    { time: '12:08:18', type: 'success', service: 'caddy', message: 'Bound reverse proxy local subnet isolation successful on port 80' },
    { time: '12:09:02', type: 'blocked', service: 'UFW', message: 'BLOCKED connection attempt from public IP 45.143.203.11 on port 8080 (Unapproved WAN route)' },
    { time: '12:09:44', type: 'suspicious', service: 'gluetun', message: 'SUSPICIOUS: VPN Bypass connection attempted on port 22 (SSH raw bypass) - HALTED' },
    { time: '12:10:12', type: 'info', service: 'qbittorrent', message: 'Announcing 12 torrents on private VPN trackers...' }
  ]);

  // Boot-up dynamic notification state
  const [bootNotif, setBootNotif] = useState<string | null>(null);

  const handleToggleCpuSpike = () => {
    const nextActive = !cpuSpikeActive;
    setCpuSpikeActive(nextActive);
    
    if (nextActive) {
      setContainers(prev => prev.map(c => {
        if (c.status !== 'online') return c;
        if (c.name === 'qbittorrent' || c.name === 'jellyfin') {
          return { ...c, cpu: (Math.random() * 10 + 82).toFixed(1) + '%' };
        }
        return c;
      }));
      
      const timeStr = new Date().toLocaleTimeString();
      setLogLines(prev => [...prev, `[${timeStr}] TELEMETRY_ALARM: High CPU utilization detected in docker0 bridges for qbittorrent and jellyfin daemon instances!`]);
      
      triggerInsight("Alert: Master Wayne, several container instances are experiencing high CPU load. qBittorrent is hashing massive chunks while Jellyfin is transcoding a 4K stream.");
    } else {
      setContainers(prev => prev.map(c => {
        if (c.status !== 'online') return c;
        if (c.name === 'qbittorrent' || c.name === 'jellyfin') {
          return { ...c, cpu: (Math.random() * 2 + 1).toFixed(1) + '%' };
        }
        return c;
      }));
      
      const timeStr = new Date().toLocaleTimeString();
      setLogLines(prev => [...prev, `[${timeStr}] TELEMETRY_ALARM: Container CPU loads have returned to nominal levels.`]);
      
      triggerInsight("Status: Container CPU utilization has stabilized back to nominal levels, Master Wayne. All queues are running normally.");
    }
  };

  const logEndRef = useRef<HTMLDivElement>(null);
  const loggerEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logLines]);

  useEffect(() => {
    if (isLoggerOpen) {
      loggerEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loggerLogs, isLoggerOpen]);

  // Boot-Time alert detection
  useEffect(() => {
    if (vpnOutage || caddyOutage || diskFullOutage || trackerTimeout) {
      const activeOutage = vpnOutage ? "VPN Gateway (gluetun) Disconnection" :
                           caddyOutage ? "Reverse Proxy Conflict (Port 80)" :
                           diskFullOutage ? "Crostini Storage Exhaustion" : 
                           "P2P Torrent Tracker Stalling";
      
      setBootNotif(`[ALERT DETECTED]: ${activeOutage}. Please click 'Fix Insight' above or consult Alfred for resolution.`);
    }
  }, []);

  // Periodic network logger traffic simulator
  useEffect(() => {
    const services = ['qbittorrent', 'jellyfin', 'prowlarr', 'radarr', 'sonarr', 'caddy'];
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString();
      const randVal = Math.random();
      
      let entry: LoggerEntry;
      if (randVal < 0.15) {
        // Suspicious red log
        const badIPs = ['185.220.101.4', '45.32.112.55', '198.51.100.12'];
        const chosenIP = badIPs[Math.floor(Math.random() * badIPs.length)];
        entry = {
          time: timeStr,
          type: 'blocked',
          service: 'UFW',
          message: `BLOCKED unapproved WAN connection probe from ${chosenIP} on port 7878 - DROPPED`
        };
        // Increment notification count if logger is closed
        if (!isLoggerOpen) {
          setLoggerNotificationCount(c => c + 1);
        }
      } else if (randVal < 0.3) {
        // Standard info log
        entry = {
          time: timeStr,
          type: 'info',
          service: services[Math.floor(Math.random() * services.length)],
          message: `Querying trackers or local directory buffers...`
        };
      } else {
        // Secure green log
        const ports = [8096, 7000, 8888, 80];
        entry = {
          time: timeStr,
          type: 'success',
          service: 'Caddy',
          message: `SECURE Proxy routing completed on port ${ports[Math.floor(Math.random() * ports.length)]} for local subnet ${localSubnet}`
        };
      }

      setLoggerLogs(prev => [...prev, entry].slice(-50)); // Keep last 50 logs
    }, 4000);

    return () => clearInterval(interval);
  }, [isLoggerOpen, localSubnet]);

  // Network Audit Scanning Routine (Simulated)
  const handleStartScan = () => {
    setScanState('scanning');
    setScanProgress(5);
    setScanStep('Initializing Zero-Trust active audit...');
    setScanResults(null);

    const steps = [
      { progress: 20, text: 'Auditing UFW state & rule configurations...' },
      { progress: 40, text: 'Scanning container bridge namespaces for open WAN ports...' },
      { progress: 65, text: 'Probing Gluetun VPN WireGuard encryption tunnels...' },
      { progress: 85, text: 'Performing DNS leak validation on upstream servers...' },
      { progress: 100, text: 'Reviewing attached logger database for suspicious connections...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setScanProgress(steps[currentStep].progress);
        setScanStep(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setScanState('completed');
        
        // Compile audit findings
        const hasOutage = vpnOutage || caddyOutage;
        setScanResults({
          status: hasOutage ? 'WARNING' : 'SECURE',
          wanExposure: '0 ports exposed to WAN (Perfect Isolation)',
          firewallStatus: firewallApplied ? 'UFW Hardened (Zero-Trust Active)' : 'UFW Active (Needs Hardening)',
          vpnEncrypted: vpnOutage ? 'FAILED - Gluetun offline' : 'SECURED (ChaCha20-Poly1305 WireGuard)',
          dnsLeakStatus: vpnOutage ? 'LEAKING - Local ISP DNS visible' : 'SECURE (NordVPN/Mullvad Encrypted Private DNS)',
          suspiciousConnectionCount: vpnOutage ? '3 alerts flag VPN bypass' : '0 active WAN leaks'
        });

        triggerInsight("Insight: Network Audit complete! Your host was scanned. Result status: " + (hasOutage ? "Vulnerable. Fix Gluetun VPN connection immediately." : "Fully secured. DNS and IP masks are intact."));
      }
    }, 800);
  };

  // Run DNS Leak Test
  const handleDnsLeakTest = () => {
    setLeakResult(null);
    setTimeout(() => {
      if (vpnOutage) {
        setLeakResult({
          type: 'dns',
          status: 'danger',
          text: `DNS LEAK DETECTED! Your local home ISP nameservers (Comcast/Verizon) are exposed because Gluetun VPN is offline. Downloader traffic is leaking your location!`
        });
        triggerInsight("Alert: DNS Leak Check returned CRITICAL EXPOSURE. Standard network packets are bypassing the sandbox.");
      } else {
        setLeakResult({
          type: 'dns',
          status: 'secure',
          text: `STATUS: SECURE. No DNS Leaks detected. Upstream queries are encrypted and routed exclusively through NordVPN/Mullvad Private DNS nameserver (10.0.0.2).`
        });
      }
    }, 500);
  };

  // Run IP Mask Verify
  const handleIpVerifyTest = () => {
    setLeakResult(null);
    setTimeout(() => {
      if (vpnOutage) {
        setLeakResult({
          type: 'ip',
          status: 'danger',
          text: `IP EXPOSED! Your actual public IP (98.122.45.109) is actively broadcasting. Zero-Trust VPN is bypassed.`
        });
        triggerInsight("Alert: IP address mask check failed. Absolute VPN bypass is leaking real host coordinates.");
      } else {
        setLeakResult({
          type: 'ip',
          status: 'secure',
          text: `IP SECURED. Routed via 185.200.118.4 (Amsterdam, Netherlands) on tun0 interface. Real public coordinates fully masked.`
        });
      }
    }, 500);
  };

  const handleApplyFirewallWithInsight = () => {
    setIsApplyingFirewall(true);
    setFirewallLogs([]);
    const logs = [
      "Setting default deny for incoming traffic...",
      "Setting default allow for outgoing traffic...",
      `Allowing media streaming (Jellyfin:8096, AIOStreams:7000, MediaFlow:8888) exclusively from home subnet: ${localSubnet}...`,
      "Enforcing Tailscale isolation for Admin panels (interface: tailscale0)...",
      "Enabling Loopback rule (127.0.0.1)...",
      "Backing up existing rule tables...",
      "Activating Uncomplicated Firewall (UFW)...",
      "UFW status: ACTIVE (Hardened)"
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setFirewallLogs(prev => [...prev, `[UFW-SEC] ${logs[currentLogIndex]}`]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsApplyingFirewall(false);
        setFirewallApplied(true);
        triggerInsight("Insight: Firewall rules activated! All ports are locked. Master Settings has options to audit rules.");
      }
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl relative">

      {/* Visual Header */}
      <div className="bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="text-indigo-400" />
            Zero-Trust Networking, Telemetry & Host-Level UFW Security
          </h2>
          <p className="text-zinc-400 text-xs font-sans">
            Monitor your Docker container bridges, audit live network latency, tail streaming stack logs, and manage Uncomplicated Firewall (UFW) rules dynamically.
          </p>
        </div>
      </div>

      {/* Boot-time bottom alert banner */}
      {bootNotif && (
        <div className="bg-rose-950/50 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300 animate-slide-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
            <span className="font-mono">{bootNotif}</span>
          </div>
          <button 
            onClick={() => setBootNotif(null)} 
            className="p-1 rounded text-rose-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 🔒 ZERO-TRUST SHIELD & AUDIT CONSOLE */}
      <div className="bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl shadow-md space-y-5">
        <div className="border-b border-neutral-800/60 pb-3 flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Zero-Trust Shield & Audit Console</h3>
          </div>
          <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
            Active Host Protection
          </span>
        </div>

        {/* Console Buttons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={handleStartScan}
            disabled={scanState === 'scanning'}
            className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-zinc-700 text-zinc-200 text-xs py-3 px-4 rounded-xl font-mono flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <ActivityIcon className={`h-4 w-4 text-cyan-400 ${scanState === 'scanning' ? 'animate-spin' : ''}`} />
            Scan Network
          </button>

          <button
            onClick={handleDnsLeakTest}
            className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-zinc-700 text-zinc-200 text-xs py-3 px-4 rounded-xl font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Wifi className="h-4 w-4 text-indigo-400" />
            DNS Leak Test
          </button>

          <button
            onClick={handleIpVerifyTest}
            className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-zinc-700 text-zinc-200 text-xs py-3 px-4 rounded-xl font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Eye className="h-4 w-4 text-rose-400" />
            Verify VPN Mask
          </button>

          <button
            onClick={() => {
              setIsLoggerOpen(true);
              setLoggerNotificationCount(0); // clear notifications when opened
            }}
            className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-indigo-500/40 text-zinc-200 text-xs py-3 px-4 rounded-xl font-mono flex items-center justify-center gap-2 transition-all relative cursor-pointer"
          >
            <Terminal className="h-4 w-4 text-emerald-400" />
            Request Logger
            {loggerNotificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce border border-neutral-900">
                {loggerNotificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Live scanning progress bar */}
        {scanState === 'scanning' && (
          <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400 animate-pulse">{scanStep}</span>
              <span className="text-indigo-400 font-bold">{scanProgress}%</span>
            </div>
            <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
            </div>
          </div>
        )}

        {/* Scan Results Display */}
        {scanState === 'completed' && scanResults && (
          <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-neutral-850 pb-2">
              <span className="text-zinc-500 uppercase tracking-wider font-bold">Comprehensive Host Audit Findings</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                scanResults.status === 'SECURE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400 animate-pulse'
              }`}>
                STATUS: {scanResults.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-loose">
              <div>
                <span className="text-zinc-500">UFW Rule Integrity:</span> <span className="text-zinc-300 font-bold">{scanResults.firewallStatus}</span>
              </div>
              <div>
                <span className="text-zinc-500">Exposed WAN Sockets:</span> <span className="text-zinc-300 font-bold">{scanResults.wanExposure}</span>
              </div>
              <div>
                <span className="text-zinc-500">VPN Tunnel State:</span> <span className={vpnOutage ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{scanResults.vpnEncrypted}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-sans">DNS Query Privacy:</span> <span className={vpnOutage ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{scanResults.dnsLeakStatus}</span>
              </div>
              <div className="md:col-span-2 border-t border-neutral-850 pt-2 flex justify-between items-center">
                <span>Suspicious activity flagged: <span className={vpnOutage ? 'text-rose-400 font-bold' : 'text-zinc-400'}>{scanResults.suspiciousConnectionCount}</span></span>
                <button onClick={() => setScanState('idle')} className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold underline transition-all cursor-pointer">Clear report</button>
              </div>
            </div>
          </div>
        )}

        {/* Leak results display box */}
        {leakResult && (
          <div className={`p-4 rounded-xl text-xs font-mono flex items-start gap-3 border ${
            leakResult.status === 'secure' 
              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' 
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}>
            {leakResult.status === 'secure' ? (
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            )}
            <div className="flex-1 space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400 block">
                {leakResult.type === 'dns' ? 'DNS Query Audit Result' : 'Public IP Routing Check'}
              </span>
              <p className="leading-relaxed">{leakResult.text}</p>
              <button onClick={() => setLeakResult(null)} className="text-[9px] uppercase underline text-zinc-400 hover:text-white font-bold cursor-pointer">Close result</button>
            </div>
          </div>
        )}

      </div>

      {/* Outage Warning Panels (Cohesive alert blocks) */}
      {(vpnOutage || caddyOutage || diskFullOutage || trackerTimeout) && (
        <div className="space-y-3">
          {vpnOutage && (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 flex justify-between items-center text-xs text-rose-200">
              <div className="flex gap-3 items-center">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                <div>
                  <span className="font-bold text-rose-300 block">VPN GATEWAY OFFLINE (gluetun)</span>
                  <p className="text-rose-400 font-mono text-[11px]">WireGuard handshake failed. Killswitch active. All torrent, prowlarr, and mediaflow traffic blocked.</p>
                </div>
              </div>
              <button 
                onClick={() => onTriggerOutageInsight(
                  "VPN Handshake Failed",
                  "Gluetun WireGuard client could not connect. This triggers the container-level killswitch, isolating downloader tools from leaking your real public IP.",
                  "1. Verify that your WireGuard Private Key inside the Master Settings is valid.\n2. Ensure your WG_ADDRESSES has a suitable CIDR.\n3. Run 'docker-compose restart gluetun' to re-initialize handshakes."
                )}
                className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shrink-0 transition-all font-mono cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 animate-pulse" /> Fix Insight
              </button>
            </div>
          )}

          {caddyOutage && (
            <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-4 flex justify-between items-center text-xs text-amber-200">
              <div className="flex gap-3 items-center">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-300 block">REVERSE PROXY CONFLICT (Caddy)</span>
                  <p className="text-amber-400 font-mono text-[11px]">Caddy failed to bind port 80. Local reverse proxy unreachable.</p>
                </div>
              </div>
              <button 
                onClick={() => onTriggerOutageInsight(
                  "Reverse Proxy Binding Error",
                  "Another process on your Crostini host or Linux partition is already utilizing port 80, creating an infrastructure socket conflict.",
                  "1. Stop apache2 or nginx services: 'sudo systemctl stop nginx apache2'\n2. Check which pid holds the port: 'sudo netstat -tulpn | grep :80'\n3. Restart caddy container via Telemetry monitor below."
                )}
                className="bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shrink-0 transition-all font-mono cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 animate-pulse" /> Fix Insight
              </button>
            </div>
          )}

          {diskFullOutage && (
            <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-4 flex justify-between items-center text-xs text-amber-200">
              <div className="flex gap-3 items-center">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-300 block">CROSTINI DISK ALLOCATION LOW</span>
                  <p className="text-amber-400 font-mono text-[11px]">Linux VM partition is 98% full. qBittorrent write actions suspended.</p>
                </div>
              </div>
              <button 
                onClick={() => onTriggerOutageInsight(
                  "Disk Storage Exhausted",
                  "Your Chromebook allocated storage for Crostini Linux container is nearly fully consumed. Safe mode has suspended direct disk write queues.",
                  "1. Go to ChromeOS Settings -> Advanced -> Developers -> Linux Development Environment.\n2. Click 'Disk Size' and expand the allocation slider slider size (recommend 30GB+).\n3. Clean cached downloads: 'docker system prune -a --volumes'"
                )}
                className="bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shrink-0 transition-all font-mono cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 animate-pulse" /> Fix Insight
              </button>
            </div>
          )}

          {trackerTimeout && (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 flex justify-between items-center text-xs text-rose-200">
              <div className="flex gap-3 items-center">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                <div>
                  <span className="font-bold text-rose-300 block">P2P TORRENT TRACKER TIMEOUT</span>
                  <p className="text-rose-400 font-mono text-[11px]">Tracker timeout error in qBittorrent namespace. Downloading has stalled.</p>
                </div>
              </div>
              <button 
                onClick={() => onTriggerOutageInsight(
                  "Torrent Tracker Timeout",
                  "Your P2P torrent client is encountering tracker handshake failures inside Gluetun. This typically points to restricted MTU sizes or blocked peer ports on the VPN tunnel.",
                  "1. Double check VPN provider specifications for WireGuard MTU. Recommended: 1420 or 1280.\n2. Enable port forwarding inside Gluetun environment configurations (environment variable: VPN_PORT_FORWARDING=on)."
                )}
                className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shrink-0 transition-all font-mono cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 animate-pulse" /> Fix Insight
              </button>
            </div>
          )}
        </div>
      )}

      {/* Row 1: Telemetry and Speed Test */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Docker Containers Monitor */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800/60 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Docker Containers Telemetry Monitor</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleToggleCpuSpike}
                className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  cpuSpikeActive 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' 
                    : 'bg-neutral-950 border-neutral-850 text-zinc-500 hover:text-zinc-300'
                }`}
                title="Toggle simulated heavy CPU workload on core containers"
              >
                <ActivityIcon className={`h-3.5 w-3.5 ${cpuSpikeActive ? 'animate-spin text-amber-400' : ''}`} />
                {cpuSpikeActive ? 'Simulated CPU Spike: ACTIVE' : 'Simulate CPU Spike'}
              </button>

              <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 font-mono px-2 py-0.5 rounded flex items-center gap-1 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Daemon: Online
              </span>
            </div>
          </div>

          <div className="overflow-x-auto text-[11px] sm:text-xs">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-neutral-950/60 text-zinc-400 border-b border-neutral-800 font-mono text-[9px] uppercase">
                  <th className="p-2.5 pl-3 font-semibold">Service</th>
                  <th className="p-2.5 font-semibold">Image Tag</th>
                  <th className="p-2.5 font-semibold">CPU</th>
                  <th className="p-2.5 font-semibold">RAM Usage</th>
                  <th className="p-2.5 font-semibold">Uptime</th>
                  <th className="p-2.5 font-semibold text-center">Status</th>
                  <th className="p-2.5 pr-3 text-right font-semibold">Restart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850/40 text-zinc-300 font-mono text-[11px]">
                {containers.map((c) => {
                  const isSvcDown = (c.name === 'gluetun' && vpnOutage) || (c.name === 'caddy' && caddyOutage);
                  const displayStatus = isSvcDown ? 'offline' : c.status;

                  return (
                    <tr key={c.name} className="hover:bg-neutral-950/20 transition-colors">
                      <td className="p-2.5 pl-3 font-bold text-white text-xs flex items-center gap-1">
                        {c.name}
                        {isSvcDown && (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (c.name === 'gluetun') {
                                onTriggerOutageInsight(
                                  "VPN Handshake Failed",
                                  "Gluetun WireGuard client connection failed. The container-level killswitch is engaged to prevent unsecured traffic leaks.",
                                  "1. Check WireGuard private key.\n2. Ensure endpoints are reachable.\n3. Restart container."
                                );
                              } else {
                                onTriggerOutageInsight(
                                  "Reverse Proxy Binding Error",
                                  "Port 80 binding error in Caddy container.",
                                  "1. Terminate conflicting host services.\n2. Rebind port configurations."
                                );
                              }
                            }}
                            className="text-rose-400 hover:text-rose-200 cursor-pointer animate-bounce pl-1"
                            title="Click for error insight"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-zinc-500 max-w-[120px] truncate" title={c.image}>{c.image}</td>
                      <td className={`p-2.5 ${!isSvcDown && parseFloat(c.cpu) >= 15.0 ? 'text-amber-400 font-bold' : ''}`}>
                        <div className="flex items-center gap-1">
                          {!isSvcDown && parseFloat(c.cpu) >= 15.0 && (
                            <Activity className="h-3 w-3 animate-pulse shrink-0 text-amber-400" />
                          )}
                          {isSvcDown ? '0.0%' : c.cpu}
                        </div>
                      </td>
                      <td className="p-2.5">{isSvcDown ? '0 MB' : c.ram}</td>
                      <td className="p-2.5 text-zinc-500">{isSvcDown ? '---' : c.uptime}</td>
                      <td className="p-2.5 text-center">
                        {(() => {
                          const cpuValue = parseFloat(isSvcDown ? '0' : c.cpu);
                          const isHighCpu = !isSvcDown && displayStatus === 'online' && cpuValue >= 15.0;

                          if (displayStatus === 'restarting') {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-[pulse_1.5s_infinite]">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                                🟡 Increased Patrols
                              </span>
                            );
                          } else if (isHighCpu) {
                            return (
                              <span 
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/35 animate-[pulse_1.2s_infinite]"
                                title={`High CPU load detected: ${c.cpu}`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-ping shrink-0" />
                                🟠 High Alert
                              </span>
                            );
                          } else if (displayStatus === 'online') {
                            if (isSvcDown) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
                                  🔴 City Under Siege
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                🟢 Gotham Secure
                              </span>
                            );
                          } else { // offline
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-850 text-zinc-400 border border-neutral-800 animate-pulse">
                                ⚫ Lockdown
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="p-2.5 pr-3 text-right">
                        <button 
                          onClick={() => {
                            setContainers(prev => prev.map(item => item.name === c.name ? { ...item, status: 'restarting', cpu: '0.0%', ram: '0 MB' } : item));
                            const timeStr = new Date().toLocaleTimeString();
                            setLogLines(prev => [...prev, `[${timeStr}] SYSTEM: Restart signal sent to container ${c.name}...`]);
                            
                            setTimeout(() => {
                              setContainers(prev => prev.map(item => item.name === c.name ? { ...item, status: 'online', cpu: '0.1%', ram: '14 MB' } : item));
                              const timeStr2 = new Date().toLocaleTimeString();
                              setLogLines(prev => [...prev, `[${timeStr2}] SYSTEM: Container ${c.name} loaded successfully (PID: ${Math.floor(Math.random() * 900) + 100})`]);
                            }, 1500);
                          }}
                          disabled={c.status === 'restarting'}
                          className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          title="Restart Container"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 inline ${c.status === 'restarting' ? 'animate-spin text-amber-400' : ''}`} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* VPN Speed Test */}
        <div className="bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-neutral-800/60 pb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">VPN Speed Test</h3>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-4">
            {/* Dial layout */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-neutral-800/80 animate-spin" style={{ animationDuration: speedTestRunning ? '6s' : '40s' }} />
              <div className="absolute inset-2 rounded-full border border-neutral-850 bg-neutral-950/80 flex flex-col items-center justify-center shadow-inner">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Download</span>
                <span className="text-lg font-mono font-bold text-white tracking-tight">
                  {speedTestData.download !== null ? speedTestData.download : '---'}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 font-bold">MB/s</span>
              </div>
            </div>

            {/* Ping and Upload metrics */}
            <div className="grid grid-cols-2 gap-4 w-full text-center">
              <div className="bg-neutral-950/40 border border-neutral-850 px-2 py-2 rounded-xl">
                <span className="text-[10px] font-mono text-zinc-500 block">VPN PING</span>
                <span className="text-xs font-mono font-bold text-zinc-100">
                  {speedTestData.ping !== null ? `${speedTestData.ping} ms` : '---'}
                </span>
              </div>
              <div className="bg-neutral-950/40 border border-neutral-850 px-2 py-2 rounded-xl">
                <span className="text-[10px] font-mono text-zinc-500 block">UPLOAD</span>
                <span className="text-xs font-mono font-bold text-zinc-100">
                  {speedTestData.upload !== null ? `${speedTestData.upload} MB/s` : '---'}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={runSpeedTest}
            disabled={speedTestRunning}
            className="w-full bg-zinc-100 hover:bg-zinc-200 disabled:bg-neutral-800 disabled:text-zinc-500 text-neutral-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {speedTestRunning ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                {speedTestData.step === 'pinging' && 'Pinging VPN...'}
                {speedTestData.step === 'download' && 'Downloading...'}
                {speedTestData.step === 'upload' && 'Uploading...'}
              </>
            ) : (
              <>
                <Activity className="h-3.5 w-3.5" />
                Run Speed Test
              </>
            )}
          </button>
        </div>

      </div>

      {/* Row 2: Logs and Firewall rules list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Container Logs Stream */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col gap-3 border-b border-neutral-800/60 pb-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <Terminal className="h-4 w-4 text-zinc-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Live Docker Logs Streamer</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">Simulate tailing live outputs from container sandboxes.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-zinc-400 text-right">Container:</span>
                <select 
                  value={selectedLogContainer}
                  onChange={(e) => setSelectedLogContainer(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700"
                >
                  <option value="gluetun">gluetun (VPN)</option>
                  <option value="qbittorrent">qbittorrent</option>
                  <option value="jellyfin">jellyfin</option>
                  <option value="caddy">caddy</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1.5 h-3 w-3 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search in logs..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700"
                />
              </div>
              <select
                value={logFilterType}
                onChange={(e) => setLogFilterType(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700"
              >
                <option value="all">All Logs</option>
                <option value="error">Errors/Alerts</option>
                <option value="info">Info/Other</option>
                <option value="warn">System/Warn</option>
              </select>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-850 rounded-xl overflow-hidden shadow-inner">
            <div className="bg-neutral-900/60 px-4 py-1.5 border-b border-neutral-850 flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-500">stdout_streamer_daemon_v1.0.3</span>
              <span className="text-green-500 animate-pulse">● TAILING FEED ACTIVE</span>
            </div>
            
            <div className="p-4 font-mono text-[11px] text-zinc-300 leading-relaxed max-h-48 overflow-y-auto space-y-1.5 select-text">
              {logLines
                .filter(log => {
                  if (logFilterType === 'all') return true;
                  const isError = log.includes("SUSPICIOUS") || log.includes("UNAPPROVED") || log.includes("ALERT") || log.includes("BLOCKED") || log.includes("Bypass") || log.includes("failed");
                  const isWarn = log.includes("SYSTEM:");
                  if (logFilterType === 'error') return isError;
                  if (logFilterType === 'warn') return isWarn;
                  if (logFilterType === 'info') return !isError && !isWarn;
                  return true;
                })
                .filter(log => log.toLowerCase().includes(logSearchQuery.toLowerCase()))
                .map((log, idx) => {
                  let colorClass = "text-zinc-400";
                  
                  // Red unapproved or suspicious connection logs highlight
                  if (log.includes("SUSPICIOUS") || log.includes("UNAPPROVED") || log.includes("ALERT") || log.includes("BLOCKED") || log.includes("Bypass") || log.includes("failed")) {
                    colorClass = "text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 font-bold block";
                  } else if (log.includes("SYSTEM:")) {
                    colorClass = "text-amber-400 font-semibold";
                  } else if (log.includes("Handshake") || log.includes("established") || log.includes("completed") || log.includes("SECURE")) {
                    colorClass = "text-emerald-400";
                  }
                  
                  return (
                    <div key={idx} className={`${colorClass} hover:bg-neutral-900/20`}>{log}</div>
                  );
                })}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Isolation Rules card */}
        <div className="bg-neutral-900/40 border border-neutral-800/80 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-500">Active Isolation Rules</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-zinc-400">
              <span className="h-5 w-5 rounded bg-neutral-800 text-zinc-300 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">01</span>
              <div>
                <span className="font-semibold text-white block">Deny Default Incoming</span>
                <span>Blocks all unsolicited connection attempts to your Chromebook from external sources.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-zinc-400">
              <span className="h-5 w-5 rounded bg-neutral-800 text-zinc-300 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">02</span>
              <div>
                <span className="font-semibold text-white block">Google TV Subnet Allow</span>
                <span>Allows home subnet <code className="text-zinc-300 font-mono">{localSubnet}</code> to reach Jellyfin streaming (8096), manifest (7000) & proxy (8888).</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-zinc-400">
              <span className="h-5 w-5 rounded bg-neutral-800 text-zinc-300 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">03</span>
              <div>
                <span className="font-semibold text-white block">Tailscale Interface Admin Only</span>
                <span>Permits connections on the <code className="text-zinc-300 font-mono">tailscale0</code> virtual interface, isolating administration pages from the local network.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Firewall UFW Rules Editor & Visual table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-neutral-800/40">
        
        {/* Custom Rules Add form */}
        <div className="lg:col-span-1 bg-neutral-900 border border-neutral-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-neutral-800/60 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Add Custom Firewall Rule</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">Open custom ports safely inside Crostini's UFW tables.</p>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase font-mono text-zinc-500">Port Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 22" 
                  value={newRulePort}
                  onChange={(e) => setNewRulePort(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase font-mono text-zinc-500">Protocol</label>
                <select 
                  value={newRuleProto}
                  onChange={(e: any) => setNewRuleProto(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700"
                >
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                  <option value="both">BOTH</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase font-mono text-zinc-500">Action</label>
                <select 
                  value={newRuleAction}
                  onChange={(e: any) => setNewRuleAction(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700"
                >
                  <option value="allow">ALLOW</option>
                  <option value="deny">DENY</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase font-mono text-zinc-500">Source IP / CIDR</label>
                <input 
                  type="text" 
                  placeholder="any" 
                  value={newRuleSource}
                  onChange={(e) => setNewRuleSource(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase font-mono text-zinc-500">Comment Description</label>
              <input 
                type="text" 
                placeholder="e.g. Allow developer workstation access" 
                value={newRuleComment}
                onChange={(e) => setNewRuleComment(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700"
              />
            </div>

            <button 
              onClick={() => {
                if (!newRulePort) return;
                const newRule: CustomRule = {
                  id: Math.random().toString(36).substring(2, 9),
                  port: newRulePort,
                  protocol: newRuleProto,
                  action: newRuleAction,
                  source: newRuleSource || 'any',
                  comment: newRuleComment || 'User Custom rule'
                };
                setCustomRules(prev => [...prev, newRule]);
                setNewRulePort('');
                setNewRuleComment('');
                setNewRuleSource('');
                triggerInsight("Insight: Custom rule added. You can copy the updated shell script on the right to apply UFW changes.");
              }}
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add custom firewall rule
            </button>
          </div>
        </div>

        {/* Rules Table and Script Console */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Rules Table */}
          <div className="bg-neutral-900 border border-neutral-800/80 p-5 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400">Custom Firewall Rules Table</h3>
            
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-950 border-b border-neutral-800/80 text-zinc-400 font-mono text-[10px] uppercase">
                      <th className="p-3.5 pl-4 font-bold">Action</th>
                      <th className="p-3.5 font-bold">Port</th>
                      <th className="p-3.5 font-bold">Protocol</th>
                      <th className="p-3.5 font-bold">Source</th>
                      <th className="p-3.5 font-bold">Description</th>
                      <th className="p-3.5 pr-4 text-right font-bold">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850">
                    {customRules.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono text-xs">
                          No custom rules configured. Standard Zero-Trust rules apply.
                        </td>
                      </tr>
                    ) : (
                      customRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-neutral-900/30 transition-colors">
                          <td className="p-3.5 pl-4">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                              rule.action === 'allow' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {rule.action.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-white font-semibold">{rule.port}</td>
                          <td className="p-3.5 font-mono text-zinc-300">{rule.protocol.toUpperCase()}</td>
                          <td className="p-3.5 font-mono text-zinc-400">{rule.source}</td>
                          <td className="p-3.5 text-zinc-300">{rule.comment}</td>
                          <td className="p-3.5 pr-4 text-right">
                            <button 
                              onClick={() => setCustomRules(prev => prev.filter(r => r.id !== rule.id))}
                              className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Script view and Apply section */}
          <div className="border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-neutral-950 px-4 py-2 border-b border-neutral-800/80 flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-zinc-400">secure-ufw-rules.sh</span>
              <button 
                id="btn-copy-ufw"
                onClick={() => handleCopy(ufwScript, 'ufw')}
                className="text-[10px] bg-neutral-900 hover:bg-neutral-800 text-zinc-200 px-3 py-1 rounded-lg border border-neutral-800 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Copy className="h-3 w-3" />
                {copiedText === 'ufw' ? 'Copied script!' : 'Copy Shell Script'}
              </button>
            </div>
            <pre className="p-4 bg-neutral-950/80 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-48 leading-relaxed">
              {ufwScript}
            </pre>
          </div>

          <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">Trigger Firewall Configuration</h4>
              <p className="text-xs text-zinc-400 font-sans">Apply default deny incoming, subnet isolation parameters, and allow user-defined custom ports.</p>
            </div>
            <button 
              onClick={handleApplyFirewallWithInsight}
              disabled={isApplyingFirewall}
              className="bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
            >
              {isApplyingFirewall ? "Applying rules..." : "Apply Firewall Hardening"}
            </button>
          </div>

          {firewallLogs.length > 0 && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-300 font-semibold">UFW Script Console logs</span>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <pre className="p-4 font-mono text-[11px] text-emerald-400/90 leading-relaxed max-h-40 overflow-y-auto space-y-0.5">
                {firewallLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </pre>
            </div>
          )}

        </div>

      </div>

      {/* 🛡️ SANDBOXED NETWORK REQUEST LOGGER OVERLAY (Locked-Down Floating Panel) */}
      {isLoggerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
          <div className="bg-neutral-900 border border-neutral-850 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
            
            {/* Header / Locked Down System Frame */}
            <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-850 flex justify-between items-center select-none shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/40 cursor-not-allowed" title="System Locked" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/40 cursor-not-allowed" title="System Locked" />
                  <span className="h-3 w-3 rounded-full bg-green-500/40 cursor-not-allowed" title="System Locked" />
                </div>
                <div className="h-4 w-px bg-neutral-800 mx-1" />
                <span className="text-[10px] font-bold text-zinc-300 tracking-wider">SECURE_BRIDGE_MONITOR_v1.2 // READ-ONLY CONTAINER SOCKETS</span>
              </div>
              <button 
                onClick={() => setIsLoggerOpen(false)}
                className="text-zinc-500 hover:text-white transition-all cursor-pointer p-1 rounded hover:bg-neutral-900"
                title="Dismiss terminal isolation overlay"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Locked Bar Warning */}
            <div className="bg-amber-500/10 border-b border-amber-500/15 py-1.5 px-4 text-[9px] text-amber-400 font-bold flex items-center gap-1.5 shrink-0 select-none">
              <LockKeyhole className="h-3 w-3" /> SECURITY LOCK ACTIVE: Direct interaction shell is suspended. Telemetry is read-only.
            </div>

            {/* Filters Bar */}
            <div className="bg-neutral-950 px-4 py-2 border-b border-neutral-850 flex justify-between items-center gap-3 shrink-0 select-none">
              <span className="text-[10px] text-zinc-500">Live feed connected via docker0 bridge subnet</span>
              <div className="flex gap-1.5 text-[9px]">
                <button 
                  onClick={() => setLoggerFilter('all')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${loggerFilter === 'all' ? 'bg-neutral-800 text-white font-bold border border-neutral-700' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  ALL TELEMETRY
                </button>
                <button 
                  onClick={() => setLoggerFilter('red')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${loggerFilter === 'red' ? 'bg-rose-950/40 text-rose-400 font-bold border border-rose-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  BLOCKED (RED)
                </button>
                <button 
                  onClick={() => setLoggerFilter('green')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${loggerFilter === 'green' ? 'bg-emerald-950/40 text-emerald-400 font-bold border border-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  SECURE (GREEN)
                </button>
              </div>
            </div>

            {/* Logger Output Console */}
            <div className="flex-1 p-4 overflow-y-auto space-y-1.5 bg-neutral-950/90 text-[11px] select-text">
              {loggerLogs
                .filter(log => {
                  if (loggerFilter === 'red') return log.type === 'blocked' || log.type === 'suspicious';
                  if (loggerFilter === 'green') return log.type === 'success';
                  return true;
                })
                .map((log, idx) => {
                  let textClass = "text-zinc-400";
                  
                  // Style Suspicious/Blocked in vibrant red as requested
                  if (log.type === 'blocked' || log.type === 'suspicious') {
                    textClass = "text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold block";
                  } else if (log.type === 'success') {
                    textClass = "text-emerald-400 font-medium";
                  } else if (log.type === 'info') {
                    textClass = "text-zinc-500";
                  }

                  return (
                    <div key={idx} className={`${textClass} hover:bg-neutral-900/10 py-0.5`}>
                      <span className="text-zinc-600">[{log.time}]</span> <span className="text-zinc-500 font-bold">[{log.service.toUpperCase()}]</span> {log.message}
                    </div>
                  );
                })}
              <div ref={loggerEndRef} />
            </div>

            {/* Console Footer */}
            <div className="bg-neutral-950 px-4 py-2 border-t border-neutral-850 flex justify-between items-center shrink-0 select-none text-[9px] text-zinc-500">
              <span>Streaming socket feed active...</span>
              <button 
                onClick={() => setLoggerLogs([
                  { time: new Date().toLocaleTimeString(), type: 'info', service: 'SYSTEM', message: 'Tailing logs flushed by supervisor admin.' }
                ])}
                className="hover:text-white uppercase font-bold cursor-pointer"
              >
                Clear buffer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
