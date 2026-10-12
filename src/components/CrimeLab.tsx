import React, { useState } from 'react';
import { Play, ShieldAlert, FileText, CheckCircle2, Network } from 'lucide-react';

export default function CrimeLab() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>(['Simulation system standby.']);
  const [activeTab, setActiveTab] = useState<'simulation' | 'networkeye'>('simulation');

  const phases = [
    { title: 'Recon', icon: <FileText />, color: 'text-blue-400' },
    { title: 'Exploit', icon: <ShieldAlert />, color: 'text-amber-400' },
    { title: 'Post-Exploit', icon: <CheckCircle2 />, color: 'text-emerald-400' },
  ];

  const startSimulation = () => {
    setRunning(true);
    setLogs(['Initiating red team exercise...', 'Recon phase started.']);
    setTimeout(() => {
        setLogs(prev => [...prev, 'Exploit phase: Vulnerability detected.', 'Post-Exploit: System secured.']);
        setRunning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-neutral-800">
        <button 
          onClick={() => setActiveTab('simulation')}
          className={`pb-2 text-sm font-bold ${activeTab === 'simulation' ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500'}`}
        >
          Red Team Simulation
        </button>
        <button 
          onClick={() => setActiveTab('networkeye')}
          className={`pb-2 text-sm font-bold ${activeTab === 'networkeye' ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500'}`}
        >
          NetworkEye
        </button>
      </div>

      {activeTab === 'simulation' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl font-bold text-white">Red Team Exercise Simulator</h2>
            <button 
              onClick={startSimulation}
              disabled={running}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
            >
              <Play className="h-4 w-4" /> {running ? 'Simulating...' : 'Start Simulation'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {phases.map((phase, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center gap-3">
                <div className={phase.color}>{phase.icon}</div>
                <span className="font-bold text-xs uppercase tracking-wider">{phase.title}</span>
              </div>
            ))}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl font-mono text-xs text-zinc-400 space-y-1 h-48 overflow-y-auto">
            {logs.map((log, i) => <div key={i}>{`> ${log}`}</div>)}
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl h-[500px]">
          <h3 className="font-bold text-sm text-white mb-3">NetworkEye Integrated Monitor</h3>
          <iframe 
            src="https://github.com/coderyi/NetworkEye" 
            className="w-full h-full rounded-lg"
            title="NetworkEye"
          />
          <p className="text-xs text-zinc-400 mt-2">If NetworkEye fails to load, the repository may not support embedding. <a href="https://github.com/coderyi/NetworkEye" target="_blank" rel="noopener noreferrer" className="text-indigo-400">Open in new tab</a></p>
        </div>
      )}
    </div>
  );
}
