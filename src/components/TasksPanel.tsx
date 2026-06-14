import React from 'react';
import { Task } from '../types';
import { Check, Trash2, Calendar, ClipboardList } from 'lucide-react';

interface TasksPanelProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onClearCompleted: () => void;
}

export const TasksPanel: React.FC<TasksPanelProps> = ({
  tasks,
  onToggleTask,
  onClearCompleted,
}) => {
  const activeTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  const formatDueDate = (isoString: string | null) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const renderTaskRow = (t: Task) => {
    const dueFormatted = formatDueDate(t.due);
    return (
      <div
        key={t.id}
        className={`task-row flex items-center gap-3.5 p-3.5 rounded-xl mb-2.5 transition-all duration-300 border ${
          t.done
            ? 'opacity-55 bg-[#0A0E1A]/60 border-white/5 saturate-[0.1]'
            : t.type === 'reminder'
            ? 'bg-[#13172A] border-[#4A9EFF]/20 hover:border-[#4A9EFF]/40 hover:bg-[#13172A]/80'
            : 'bg-[#13172A] border-[#E8849A]/20 hover:border-[#E8849A]/40 hover:bg-[#13172A]/80'
        }`}
      >
        {/* Customized Circular Checkbox */}
        <button
          onClick={() => onToggleTask(t.id)}
          className={`w-6 h-6 rounded-full flex-shrink-0 border flex items-center justify-center transition-all ${
            t.done
              ? 'bg-[#4A9EFF]/10 border-[#4A9EFF] text-[#4A9EFF]'
              : t.type === 'reminder'
              ? 'border-[#4A9EFF]/45 bg-transparent hover:bg-[#4A9EFF]/5 text-transparent hover:text-[#4A9EFF]/50'
              : 'border-[#E8849A]/45 bg-transparent hover:bg-[#E8849A]/5 text-transparent hover:text-[#E8849A]/50'
          }`}
        >
          <Check size={12} className={t.done ? 'opacity-100' : 'opacity-0 hover:opacity-100'} />
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div
            className={`text-sm select-none font-medium truncate ${
              t.done ? 'line-through text-[#F0EEF8]/45 font-normal' : 'text-[#F0EEF8]'
            }`}
          >
            {t.title}
          </div>
          {dueFormatted && (
            <div className={`flex items-center gap-1.5 text-xs mt-1.5 font-mono ${t.done ? 'text-gray-600' : 'text-[#4A9EFF]/70'}`}>
              <Calendar size={11} />
              <span>{dueFormatted}</span>
            </div>
          )}
        </div>

        {/* Type Badge */}
        <span
          className={`text-[9px] font-mono font-medium tracking-wider uppercase px-2 py-0.5 rounded-md ${
            t.type === 'reminder'
              ? 'bg-[#4A9EFF]/10 text-[#4A9EFF]'
              : 'bg-[#E8849A]/10 text-[#E8849A]'
          }`}
        >
          {t.type}
        </span>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col" id="tasks-panel">
      {tasks.length === 0 ? (
        // Highly aligned Cyber Blank state
        <div id="empty-tasks" className="flex flex-col items-center justify-center py-24 text-center my-auto">
          <div className="w-16 h-16 rounded-full bg-[#13172A] border border-[#E8849A]/15 flex items-center justify-center mb-4 text-[#E8849A]/60 shadow-[0_0_15px_rgba(232,132,154,0.05)]">
            <ClipboardList size={26} className="animate-pulse" />
          </div>
          <span className="font-mono text-[10px] tracking-[4px] text-[#F0EEF8]/40 uppercase mb-2">
            No active nodes
          </span>
          <p className="text-xs text-[#F0EEF8]/30 max-w-[280px] leading-relaxed">
            There are no pending tasks. Tell ASUNA e.g. <span className="text-[#E8849A]/50">"Remind me to submit the assignment tomorrow at noon"</span> inside the chat room.
          </p>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {/* Active List */}
          {activeTasks.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] font-mono tracking-[3px] text-[#E8849A]/70 uppercase mb-3">
                Active Buffer ({activeTasks.length})
              </div>
              <div>{activeTasks.map(renderTaskRow)}</div>
            </div>
          )}

          {/* Completed List */}
          {completedTasks.length > 0 && (
            <div className="mt-2 mb-6">
              <div className="text-[10px] font-mono tracking-[3px] text-white/20 uppercase mb-3">
                Archived Logs ({completedTasks.length})
              </div>
              <div>{completedTasks.map(renderTaskRow)}</div>

              {/* Clear Completed Triggers */}
              <button
                id="clear-done-btn"
                onClick={onClearCompleted}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl border border-white/5 hover:border-red-500/15 hover:bg-red-500/5 text-xs text-[#F0EEF8]/45 hover:text-red-400 font-semibold tracking-wide transition-all"
              >
                <Trash2 size={13} />
                <span>Clear Completed Tasks</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
