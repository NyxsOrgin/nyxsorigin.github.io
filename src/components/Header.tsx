import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, CheckSquare, Battery, BatteryCharging } from 'lucide-react';

interface HeaderProps {
  userName: string;
  statusText: string;
  isThinking: boolean;
  isListening: boolean;
  activeTasksCount: number;
  activeTab: 'chat' | 'tasks';
  onSwitchTab: (tab: 'chat' | 'tasks') => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  statusText,
  isThinking,
  isListening,
  activeTasksCount,
  activeTab,
  onSwitchTab,
  onOpenSettings,
}) => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);

  useEffect(() => {
    let battery: any = null;

    const updateBatteryInfo = (bat: any) => {
      setBatteryLevel(Math.round(bat.level * 100));
      setIsCharging(bat.charging);
    };

    const handleLevelChange = (e: any) => {
      setBatteryLevel(Math.round(e.target.level * 100));
    };

    const handleChargingChange = (e: any) => {
      setIsCharging(e.target.charging);
    };

    try {
      if (typeof window !== 'undefined' && navigator && 'getBattery' in navigator) {
        const nav = navigator as any;
        nav.getBattery().then((bat: any) => {
          battery = bat;
          updateBatteryInfo(bat);
          bat.addEventListener('levelchange', handleLevelChange);
          bat.addEventListener('chargingchange', handleChargingChange);
        }).catch((err: any) => {
          console.warn('Battery Status API permission/block in iframe:', err);
        });
      }
    } catch (batterySyncError) {
      console.warn('Battery API blocked synchronously in this frame structure:', batterySyncError);
    }

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', handleLevelChange);
        battery.removeEventListener('chargingchange', handleChargingChange);
      }
    };
  }, []);

  return (
    <div id="header" className="flex-shrink-0 p-4 md:p-5 pb-3 bg-gradient-to-b from-[#0D1225] to-[#0A0E1A] border-b border-[#E8849A]/15 z-10">
      {/* HUD status row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[9px] tracking-[3px] text-[#4A9EFF]/50 uppercase">
            SYS.LINK · {isListening ? 'VOICE CAPTURE' : isThinking ? 'PROCESSING' : 'ONLINE'}
          </span>
          {batteryLevel !== null && (
            <div className="flex items-center gap-1 font-mono text-[9px] tracking-[1.5px] text-[#E8849A]/75 bg-[#E8849A]/5 px-1.5 py-0.5 rounded border border-[#E8849A]/12">
              {isCharging ? (
                <BatteryCharging size={10} className="text-[#4A9EFF] animate-pulse" />
              ) : (
                <Battery size={10} className={batteryLevel <= 20 ? "text-red-500 animate-pulse" : "text-[#E8849A]/80"} />
              )}
              <span>BAT {batteryLevel}%</span>
            </div>
          )}
        </div>
        <button
          id="config-btn"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 hover:border-[#E8849A]/30 text-[#F0EEF8]/60 text-[10px] tracking-wider transition-colors"
        >
          <SettingsIcon size={12} className="text-[#E8849A]/70 animate-pulse" />
          <span>CONFIG</span>
        </button>
      </div>

      {/* Avatar details */}
      <div className="flex items-center gap-4 mb-3">
        {/* Animated Cyber Orb */}
        <div
          id="orb"
          className={`relative w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-2xl transition-all duration-300 ${
            isListening
              ? 'animate-[pulse_1s_infinite] shadow-[0_0_0_5px_rgba(74,158,255,0.3),0_0_24px_rgba(74,158,255,0.6)]'
              : isThinking
              ? 'animate-[pulse_1.5s_infinite] shadow-[0_0_0_4px_rgba(232,132,154,0.3),0_0_20px_rgba(232,132,154,0.5)]'
              : 'shadow-[0_0_0_2px_rgba(232,132,154,0.2),0_0_10px_rgba(232,132,154,0.3)]'
          }`}
          style={{
            background: isListening
              ? 'radial-gradient(circle at 35% 35%, #93c5fd, #2563eb 55%, #1e3a8a)'
              : 'radial-gradient(circle at 35% 35%, #F9C6D3, #D4637A 55%, #7A1F3A)',
          }}
        >
          {/* Internal core glint */}
          <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
            {isListening ? '🎙️' : isThinking ? '✨' : '⚔️'}
          </span>
          <div className="absolute inset-0 rounded-full bg-white/5 animate-ping opacity-20 duration-1000" />
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <h1 className="font-['Orbitron'] font-bold text-xl tracking-[3px] text-[#F0EEF8]">
            ASUNA
          </h1>
          <p
            className={`text-[11px] mt-0.5 leading-none transition-colors duration-300 font-sans ${
              isListening ? 'text-[#4A9EFF]' : 'text-[#E8849A]'
            }`}
          >
            {statusText}
          </p>
        </div>

        {/* Dynamic Task count badge */}
        {activeTasksCount > 0 && (
          <button
            onClick={() => onSwitchTab('tasks')}
            className="flex items-center gap-1.5 text-[11px] text-[#E8849A] px-3 py-1 rounded-full bg-[#E8849A]/10 border border-[#E8849A]/30 hover:bg-[#E8849A]/20 transition-all font-mono"
          >
            <CheckSquare size={11} />
            <span>{activeTasksCount} Pending</span>
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2.5">
        <button
          id="tab-chat"
          onClick={() => onSwitchTab('chat')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wider border transition-all ${
            activeTab === 'chat'
              ? 'bg-[#E8849A]/10 border-[#E8849A]/35 text-[#E8849A] shadow-[0_2px_8px_rgba(232,132,154,0.05)]'
              : 'bg-transparent border-white/5 text-[#F0EEF8]/45 hover:text-[#F0EEF8]/80 hover:border-white/10'
          }`}
        >
          💬 Chat
        </button>
        <button
          id="tab-tasks"
          onClick={() => onSwitchTab('tasks')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wider border transition-all ${
            activeTab === 'tasks'
              ? 'bg-[#4A9EFF]/10 border-[#4A9EFF]/35 text-[#4A9EFF] shadow-[0_2px_8px_rgba(74,158,255,0.05)]'
              : 'bg-transparent border-white/5 text-[#F0EEF8]/45 hover:text-[#F0EEF8]/80 hover:border-white/10'
          }`}
        >
          ✅ Tasks {activeTasksCount > 0 ? `(${activeTasksCount})` : ''}
        </button>
      </div>
    </div>
  );
};
