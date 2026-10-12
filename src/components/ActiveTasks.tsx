import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  progress: number;
  remaining: string;
}

export default function ActiveTasks({ tasks, onCancel }: { tasks: Task[], onCancel: (id: string) => void }) {
  if (tasks.length === 0) return null;

  return (
    <div className="w-72 border-l border-neutral-800 bg-neutral-900/50 p-4 space-y-4">
      <h3 className="font-display text-xs font-bold text-white uppercase tracking-widest">Active Tasks</h3>
      {tasks.map(task => (
        <div key={task.id} className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white">{task.name}</span>
            <button onClick={() => onCancel(task.id)} className="text-zinc-500 hover:text-red-400">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${task.progress}%` }}></div>
          </div>
          <div className="text-[10px] text-zinc-500 flex justify-between font-mono">
            <span>{task.progress}%</span>
            <span>{task.remaining} remaining</span>
          </div>
        </div>
      ))}
    </div>
  );
}
