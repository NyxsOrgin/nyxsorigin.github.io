import React, { useState, useEffect } from 'react';
import { Settings, X, Info, Heart, Mic, Volume2 } from 'lucide-react';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  elevenKey: string;
  voiceId: string;
  voiceEnabled: boolean;
  wakeEnabled: boolean;
  userName: string;
  localVoiceEnabled: boolean;
  onSave: (data: {
    elevenKey: string;
    voiceId: string;
    voiceEnabled: boolean;
    wakeEnabled: boolean;
    userName: string;
    localVoiceEnabled: boolean;
  }) => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  isOpen,
  onClose,
  elevenKey,
  voiceId,
  voiceEnabled,
  wakeEnabled,
  userName,
  localVoiceEnabled,
  onSave,
}) => {
  const [localElevenKey, setLocalElevenKey] = useState(elevenKey);
  const [localVoiceId, setLocalVoiceId] = useState(voiceId);
  const [localVoiceEnabledState, setLocalVoiceEnabledState] = useState(voiceEnabled);
  const [localWakeEnabled, setLocalWakeEnabled] = useState(wakeEnabled);
  const [localUserName, setLocalUserName] = useState(userName);
  const [localNativeVoice, setLocalNativeVoice] = useState(localVoiceEnabled);

  // Sync state with props when open
  useEffect(() => {
    if (isOpen) {
      setLocalElevenKey(elevenKey);
      setLocalVoiceId(voiceId);
      setLocalVoiceEnabledState(voiceEnabled);
      setLocalWakeEnabled(wakeEnabled);
      setLocalUserName(userName);
      setLocalNativeVoice(localVoiceEnabled);
    }
  }, [isOpen, elevenKey, voiceId, voiceEnabled, wakeEnabled, userName, localVoiceEnabled]);

  const handleSave = () => {
    onSave({
      elevenKey: localElevenKey,
      voiceId: localVoiceId,
      voiceEnabled: localVoiceEnabledState,
      wakeEnabled: localWakeEnabled,
      userName: localUserName,
      localVoiceEnabled: localNativeVoice,
    });
    onClose();
  };

  return (
    <div
      id="settings-overlay"
      className={`fixed inset-0 z-50 bg-[#0A0E1A]/95 backdrop-blur-[12.5px] flex flex-col p-5 md:p-6 pb-6 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Header bar */}
      <div className="flex justify-between items-center mb-6 md:mb-8 flex-shrink-0">
        <span className="font-['Orbitron'] font-bold text-xs md:text-sm tracking-[4px] text-[#E8849A] flex items-center gap-2">
          <Settings size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
          <span>ASUNA.EXE CONFIG</span>
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full border border-white/5 hover:border-[#E8849A]/30 flex items-center justify-center text-[#F0EEF8]/60 hover:text-[#E8849A] cursor-pointer transition-all"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body content scroll region */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 font-sans">
        {/* Personalization Section */}
        <div className="setting-section">
          <div className="setting-section-title text-[9px] font-mono tracking-[3px] text-white/50 uppercase mb-2">
            Personalization
          </div>
          <div className="setting-card bg-[#13172A] border border-[#E8849A]/15 rounded-xl overflow-hidden divide-y divide-white/[0.04]">
            {/* User nickname input */}
            <div className="p-4">
              <label className="block text-[11px] font-medium text-[#F0EEF8]/60 mb-1.5 uppercase tracking-wider">
                User Codename / Name
              </label>
              <input
                type="text"
                placeholder="Leave blank to be called Master"
                value={localUserName}
                maxLength={40}
                onChange={(e) => setLocalUserName(e.target.value)}
                className="w-full text-sm bg-transparent border-none outline-none text-[#F0EEF8] placeholder-white/20"
              />
            </div>
          </div>
        </div>

        {/* Browser Voice output fallback */}
        <div className="setting-section">
          <div className="setting-section-title text-[9px] font-mono tracking-[3px] text-white/50 uppercase mb-2">
            Default voice engine
          </div>
          <div className="setting-card bg-[#13172A] border border-[#E8849A]/15 rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="min-w-0 pr-3">
                <span className="block text-sm text-[#F0EEF8] font-medium flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#E8849A]" />
                  Browser Text-To-Speech
                </span>
                <span className="block text-[11px] text-[#F0EEF8]/50 mt-1 leading-normal">
                  Toggle locally synthesized high-quality English voice (FREE and runs offline!).
                </span>
              </div>
              <button
                onClick={() => {
                  setLocalNativeVoice(!localNativeVoice);
                  if (!localNativeVoice) setLocalVoiceEnabledState(false); // turn off premium if user triggers free native
                }}
                className={`relative w-11 h-6.5 rounded-full transition-colors flex items-center shrink-0 ${
                  localNativeVoice ? 'bg-[#E8849A]' : 'bg-white/10'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md block transition-transform ${
                    localNativeVoice ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ElevenLabs Premium Voice Output */}
        <div className="setting-section">
          <div className="setting-section-title text-[9px] font-mono tracking-[3px] text-white/50 uppercase mb-2">
            ElevenLabs Voice Option
          </div>
          <div className="setting-card bg-[#13172A] border border-[#E8849A]/15 rounded-xl overflow-hidden divide-y divide-white/[0.04]">
            {/* Toggle eleven labs */}
            <div className="p-4 flex items-center justify-between">
              <div className="min-w-0 pr-3">
                <span className="block text-sm text-[#F0EEF8] font-medium flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pink-500 animate-[heartBeat_1.2s_infinite]" />
                  ElevenLabs Premium Voice
                </span>
                <span className="block text-[11px] text-[#F0EEF8]/50 mt-1 leading-normal">
                  Provide highly realistic voice output matching Asuna Yuki (Requires external API Key).
                </span>
              </div>
              <button
                onClick={() => {
                  setLocalVoiceEnabledState(!localVoiceEnabledState);
                  if (!localVoiceEnabledState) setLocalNativeVoice(false); // turn off native voice if turning on premium elevenlabs
                }}
                className={`relative w-11 h-6.5 rounded-full transition-colors flex items-center shrink-0 ${
                  localVoiceEnabledState ? 'bg-[#E8849A]' : 'bg-white/10'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md block transition-transform ${
                    localVoiceEnabledState ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Input field details conditional */}
            {localVoiceEnabledState && (
              <>
                <div className="p-4">
                  <label className="block text-[11px] font-medium text-[#F0EEF8]/60 mb-1.5 uppercase tracking-wider">
                    ElevenLabs API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your sk- ElevenLabs key"
                    value={localElevenKey}
                    onChange={(e) => setLocalElevenKey(e.target.value)}
                    className="w-full text-sm bg-transparent border-none outline-none text-[#F0EEF8] placeholder-white/20 font-mono"
                  />
                </div>
                <div className="p-4">
                  <label className="block text-[11px] font-medium text-[#F0EEF8]/60 mb-1.5 uppercase tracking-wider">
                    Asuna Custom Voice ID
                  </label>
                  <input
                    type="text"
                    placeholder="21m00Tcm4TlvDq8ikWAM"
                    value={localVoiceId}
                    onChange={(e) => setLocalVoiceId(e.target.value)}
                    className="w-full text-sm bg-transparent border-none outline-none text-[#F0EEF8] placeholder-white/20 font-mono"
                  />
                </div>
                <div className="p-3 bg-[#0A0E1A]/40 flex gap-2 text-[11.5px] leading-relaxed text-[#F0EEF8]/50 italic">
                  <Info className="text-[#4A9EFF] shrink-0 mt-0.5" size={12} />
                  <span>
                    Acquire a free API key at elevenlabs.io. Select any feminine vocal model that matches Asuna's character profile.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Voice Trigger Settings (Wake Word) */}
        <div className="setting-section">
          <div className="setting-section-title text-[9px] font-mono tracking-[3px] text-white/50 uppercase mb-2">
            Auto Trigger Listener
          </div>
          <div className="setting-card bg-[#13172A] border border-[#E8849A]/15 rounded-xl overflow-hidden divide-y divide-white/[0.04]">
            <div className="p-4 flex items-center justify-between">
              <div className="min-w-0 pr-3">
                <span className="block text-sm text-[#F0EEF8] font-medium flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-[#4A9EFF]" />
                  "Awesunnah" Wake Word
                </span>
                <span className="block text-[11px] text-[#F0EEF8]/50 mt-1 leading-normal">
                  Keep speech listener active continuously. Say <strong>"Awesunnah"</strong> to awaken the system microphone automatically.
                </span>
              </div>
              <button
                onClick={() => setLocalWakeEnabled(!localWakeEnabled)}
                className={`relative w-11 h-6.5 rounded-full transition-colors flex items-center shrink-0 ${
                  localWakeEnabled ? 'bg-[#E8849A]' : 'bg-white/10'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md block transition-transform ${
                    localWakeEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Trigger Save */}
      <div className="mt-5 flex-shrink-0">
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E8849A] to-[#C85B7A] text-white font-['Orbitron'] font-bold text-xs tracking-[3px] shadow-[0_4px_16px_rgba(232,132,154,0.15)] hover:shadow-[0_4px_22px_rgba(232,132,154,0.3)] transition-all hover:scale-[1.01] cursor-pointer"
        >
          SAVE SYSTEM SETUP
        </button>
      </div>
    </div>
  );
};
