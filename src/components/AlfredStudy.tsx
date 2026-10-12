import React, { useState } from 'react';
import { Bot, Mic, Terminal, Settings, Brain, BookOpen, Microscope, Archive, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import ActiveTasks from './ActiveTasks';
import CrimeLab from './CrimeLab';
import HeartbeatGauge from './HeartbeatGauge';

export default function AlfredStudy() {
  const [messages, setMessages] = useState<Array<{sender: 'alfred' | 'user', text: string}>>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<'chat' | 'briefing' | 'doctrine' | 'lab' | 'intake'>('chat');
  const [activeTasks, setActiveTasks] = useState([
    { id: '1', name: 'Document Indexing', progress: 65, remaining: '2m' },
    { id: '2', name: 'Security Scan', progress: 30, remaining: '5m' },
  ]);

  const cancelTask = (id: string) => setActiveTasks(prev => prev.filter(t => t.id !== id));

  const greetingActions = [
    { icon: <Mic />, label: 'Analyze Docker' },
    { icon: <Terminal />, label: 'Review Config' },
    { icon: <Microscope />, label: 'Security Scan' },
  ];

  return (
    <div className="h-full flex bg-neutral-950 text-neutral-300 font-mono overflow-hidden">
      
      {/* Context/Sidebar Panel */}
      <div className="w-64 border-r border-neutral-800/50 flex flex-col bg-neutral-900/40 backdrop-blur-md z-10">
        <div className="p-4 border-b border-neutral-800/50 font-display font-bold text-white tracking-wide">OPERATIONS</div>
        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'chat', label: 'Command Study', icon: <MessageSquare /> },
            { id: 'briefing', label: 'Briefing Room', icon: <BookOpen /> },
            { id: 'doctrine', label: 'Wayne Doctrine', icon: <Brain /> },
            { id: 'lab', label: 'Crime Lab', icon: <Microscope /> },
            { id: 'intake', label: 'Arkham Intake', icon: <Archive /> },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveWorkspace(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeWorkspace === item.id ? 'bg-indigo-950/50 text-indigo-300' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-neutral-800/50 p-4 flex items-center justify-between bg-neutral-900/30 backdrop-blur-md">
          <div className="flex flex-col">
            <h1 className="font-display text-white text-lg tracking-wide">The Batcave</h1>
            <p className="text-xs text-zinc-500">Powered by Alfred Intelligence (A.I.)</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-emerald-500 font-mono text-[10px] border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1.5">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               SANDBOX: SECURE
            </div>
            <HeartbeatGauge />
          </div>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWorkspace}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeWorkspace === 'chat' ? (
                messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <h2 className="font-display text-2xl text-white mb-2">Good evening, Master Wayne.</h2>
                    <p className="text-zinc-500 mb-8">What can I assist you with today?</p>
                    <div className="grid grid-cols-3 gap-4">
                      {greetingActions.map((action, i) => (
                        <button key={i} className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/50 p-4 rounded-xl text-center hover:border-indigo-500/50 transition-all hover:bg-neutral-800/50">
                          <div className="text-indigo-400 mb-2 flex justify-center">{action.icon}</div>
                          <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'alfred' && <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">A</div>}
                        <div className={`p-4 rounded-xl max-w-[80%] ${msg.sender === 'alfred' ? 'bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/50' : 'bg-indigo-950/40 border border-indigo-500/20'}`}>
                          <div className="prose prose-invert prose-sm">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : activeWorkspace === 'lab' ? (
                <CrimeLab />
              ) : (
                <div className="border border-neutral-800/50 rounded-2xl h-full flex flex-col items-center justify-center text-zinc-600 p-8 text-center bg-neutral-900/20 backdrop-blur-sm">
                  <div className="p-4 bg-neutral-900 rounded-full mb-4">
                    <Bot className="h-8 w-8 text-zinc-700" />
                  </div>
                  <h2 className="font-display text-xl text-zinc-300 mb-2">{activeWorkspace.toUpperCase()} INTERFACE</h2>
                  <p className="text-sm font-mono max-w-sm">Initializing encrypted module... Please await further instructions, Master.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Input Area (Chat Only) */}
        {activeWorkspace === 'chat' && (
          <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Inquire Alfred regarding homelab, DevOps, networks..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setMessages([...messages, {sender: 'user', text: e.currentTarget.value}, {sender: 'alfred', text: 'Working on that, Master.'}]);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">SEND</button>
            </div>
          </div>
        )}
      </div>

      {/* Active Tasks Panel */}
      <ActiveTasks tasks={activeTasks} onCancel={cancelTask} />
    </div>
  );
}
