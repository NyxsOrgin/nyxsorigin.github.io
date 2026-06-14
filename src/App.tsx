import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { TasksPanel } from './components/TasksPanel';
import { SettingsOverlay } from './components/SettingsOverlay';
import { Message, Task, Settings } from './types';
import { Sparkles, HelpCircle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const SpeechRecognition = typeof window !== 'undefined'
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  : null;

export default function App() {
  // ─── LOCAL STATES ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings>({
    elevenKey: '',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    voiceEnabled: false,
    wakeEnabled: false,
    userName: '',
    localVoiceEnabled: true, // FREE offline helper TTS enabled by default
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('Online — Ready to assist');
  const [pwaBannerVisible, setPwaBannerVisible] = useState(false);

  // Recognition References for Speech & Wake cycles
  const activeRecognitionRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentVoiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // ─── HYDRATE STATE & PERSISTENCE ──────────────────────────────────────────────
  useEffect(() => {
    // 1. Settings Loading
    try {
      const storedSettings = localStorage.getItem('asuna_settings');
      if (storedSettings) {
        setSettings({ ...settings, ...JSON.parse(storedSettings) });
      }
    } catch (e) {
      console.error('Failed to load local settings:', e);
    }

    // 2. Tasks Loading
    try {
      const storedTasks = localStorage.getItem('asuna_tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }

    // 3. Conversation Loading
    try {
      const storedMessages = localStorage.getItem('asuna_messages');
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        if (parsed.length > 0) {
          setMessages(parsed);
        } else {
          loadDefaultGreeting();
        }
      } else {
        loadDefaultGreeting();
      }
    } catch (e) {
      console.error('Failed to load messages:', e);
      loadDefaultGreeting();
    }

    // PWA Support check
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isStandalone = (navigator as any).standalone;
    const dismissed = localStorage.getItem('asuna_pwa_dismissed');
    if (isIOS && !isStandalone && !dismissed) {
      setTimeout(() => setPwaBannerVisible(true), 2500);
    }
  }, []);

  const loadDefaultGreeting = () => {
    const defaultGreeting: Message = {
      id: 'welcome-0',
      role: 'assistant',
      content: `Neural connection established. I'm ASUNA — your personal AI assistant running with a cybernetic neural link. I can coordinate your schedule, answer elaborate questions, and manage your daily files or tasks. How may I support you today, Master?`,
      timestamp: Date.now(),
    };
    setMessages([defaultGreeting]);
    localStorage.setItem('asuna_messages', JSON.stringify([defaultGreeting]));
  };

  // Synchronize Tasks changes
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('asuna_tasks', JSON.stringify(tasks));
    } else {
      localStorage.removeItem('asuna_tasks');
    }
  }, [tasks]);

  // Synchronize Messages changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('asuna_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Handle Speech Wake Continuous loop
  useEffect(() => {
    if (settings.wakeEnabled && !isListening) {
      startWakeWordListener();
    } else {
      stopWakeWordListener();
    }
    return () => stopWakeWordListener();
  }, [settings.wakeEnabled, isListening]);

  // ─── TASK SCHEDULER PARSER ────────────────────────────────────────────────────
  const parseTaskTags = (responseText: string) => {
    const taskRegex = /<task>([\s\S]*?)<\/task>/i;
    const match = responseText.match(taskRegex);

    if (match) {
      try {
        const parsedNode = JSON.parse(match[1]);
        if (parsedNode && parsedNode.title) {
          const newTask: Task = {
            id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: parsedNode.title,
            type: parsedNode.type === 'reminder' ? 'reminder' : 'task',
            due: parsedNode.due || null,
            done: false,
            createdAt: Date.now(),
          };

          setTasks((prev) => [newTask, ...prev]);

          // Clean up response string by stripping out HTML task markup tags
          const sanitizedText = responseText.replace(taskRegex, '').trim();

          const triggerNotificationObj = {
            title: parsedNode.title,
            type: parsedNode.type || 'task',
            due: parsedNode.due || null,
          };

          return { sanitizedText, taskAdded: triggerNotificationObj };
        }
      } catch (err) {
        console.error('Error parsing task block tags:', err);
      }
    }

    return { sanitizedText: responseText.replace(/<task>[\s\S]*?<\/task>/gi, '').trim(), taskAdded: undefined };
  };

  // ─── VOICE OUTPUT SPEAK ENGINE ────────────────────────────────────────────────
  const speakVoice = (text: string) => {
    // 1. Browser Native Speech Synthesis TTS
    if (settings.localVoiceEnabled) {
      if ('speechSynthesis' in window) {
        // Cancel ongoing synthesis speech
        window.speechSynthesis.cancel();
        
        const cleanContent = text.replace(/<[^>]*>/g, '').trim(); // Strip HTML tags
        const utterance = new SpeechSynthesisUtterance(cleanContent);
        
        // Find high-quality feminine English speaking node
        const voices = window.speechSynthesis.getVoices();
        const activeVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google US English') ||
              v.name.includes('Samantha') ||
              v.name.includes('Zira') ||
              v.name.includes('Susan'))
        );
        
        if (activeVoice) {
          utterance.voice = activeVoice;
        }
        utterance.pitch = 1.15; // Slightly higher pitch for playful anime tone!
        utterance.rate = 1.05;  // Slightly natural enthusiastic talking speed
        
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    // 2. ElevenLabs API Premium Speech Synthesis
    if (settings.voiceEnabled && settings.elevenKey) {
      const voiceId = settings.voiceId || '21m00Tcm4TlvDq8ikWAM';
      const cleanContent = text.replace(/<[^>]*>/g, '').trim();

      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': settings.elevenKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanContent,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.52,
            similarity_boost: 0.75,
          },
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('ElevenLabs returned API error state.');
          return res.blob();
        })
        .then((blob) => {
          const audioUrl = URL.createObjectURL(blob);
          if (currentVoiceAudioRef.current) {
            currentVoiceAudioRef.current.pause();
            URL.revokeObjectURL(currentVoiceAudioRef.current.src);
          }
          const audio = new Audio(audioUrl);
          currentVoiceAudioRef.current = audio;
          audio.play().catch((playErr) => console.error('Audio playback block:', playErr));
        })
        .catch((err) => console.error('ElevenLabs TTS synthesis failed:', err));
    }
  };

  // ─── CHAT CONTROLLER ──────────────────────────────────────────────────────────
  const handleSendMessage = async (text: string) => {
    if (isThinking) return;

    // Create user bubble
    const userMessage: Message = {
      id: `m-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);
    setStatusText('Processing neural response...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          userName: settings.userName,
          currentTime: new Date().toString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Fallback Express API returned failure node: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.text || '';

      // Parse Task Tags
      const { sanitizedText, taskAdded } = parseTaskTags(rawText);

      const assistantMessage: Message = {
        id: `m-${Date.now()}-asuna`,
        role: 'assistant',
        content: sanitizedText,
        timestamp: Date.now(),
        taskAdded,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speakVoice(sanitizedText);
    } catch (err: any) {
      console.error('Error in handleSendMessage fetch transaction:', err);
      const errorMessage: Message = {
        id: `m-${Date.now()}-err`,
        role: 'assistant',
        content: `Connection Interrupted. I lost sync with my core servers! Please reload or verify your local workspace link. Reason: ${err.message || 'Server-Timeout'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setStatusText('Online — Ready to assist');
    }
  };

  // ─── SPEECH TO TEXT CONTROLLERS ───────────────────────────────────────────────
  const toggleSpeechMic = () => {
    if (isListening) {
      stopSpeechMic();
      return;
    }

    if (!SpeechRecognition) {
      alert('Speech Recognition / Microphone processing is not fully supported in your container browser. Try Chrome, Safari or Edge.');
      return;
    }

    // Synthesis pause to prevent looping
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentVoiceAudioRef.current) {
      currentVoiceAudioRef.current.pause();
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;

    rec.onstart = () => {
      setIsListening(true);
      setStatusText('Listening to voice cues...');
    };

    rec.onresult = (event: any) => {
      const speechToTextResult = event.results[0][0].transcript;
      if (speechToTextResult && speechToTextResult.trim() !== '') {
        handleSendMessage(speechToTextResult.trim());
      }
    };

    rec.onerror = (err: any) => {
      console.error('Mic stream Speech Error occurred:', err.error);
      stopSpeechMic();
    };

    rec.onend = () => {
      stopSpeechMic();
    };

    activeRecognitionRef.current = rec;
    rec.start();
  };

  const stopSpeechMic = () => {
    if (activeRecognitionRef.current) {
      activeRecognitionRef.current.stop();
      activeRecognitionRef.current = null;
    }
    setIsListening(false);
    setStatusText('Online — Ready to assist');
  };

  // ─── BACKGROUND WAKE WORD ENGINE ──────────────────────────────────────────────
  const startWakeWordListener = () => {
    if (!SpeechRecognition || wakeRecognitionRef.current) return;

    const wakeRec = new SpeechRecognition();
    wakeRec.lang = 'en-US';
    wakeRec.continuous = false;
    wakeRec.interimResults = false;

    wakeRec.onresult = (event: any) => {
      const vocalText = event.results[0][0].transcript.toLowerCase();
      
      // Phonetic variations for how "Awesunnah" is transcribed by the Speech Engine
      const triggerWords = [
        'awesunnah',
        'awesunah',
        'awe sunnah',
        'awe sunah',
        'aw-sunna',
        'aw sunna',
        'aw sunnah',
        'awesome nah',
        'awesome-nah',
        'awesomna',
        'hey awesunnah',
        'hey awe sunnah',
        'hey aw sunnah'
      ];
      
      const isTriggered = triggerWords.some(trigger => vocalText.includes(trigger));

      if (isTriggered) {
        // Trigger responsive system ding / synth word
        setStatusText('Wake word detected!');
        speakVoice('Yes, Master? I am listening!');
        
        // Timeout trigger mic capture immediately
        setTimeout(() => {
          toggleSpeechMic();
        }, 800);
      }
    };

    wakeRec.onend = () => {
      // Loop wake word background listener if flag is still true and user is not in active mic mode
      if (settings.wakeEnabled && !isListening) {
        setTimeout(() => {
          try {
            if (wakeRecognitionRef.current === wakeRec) {
              wakeRec.start();
            }
          } catch (e) {
            console.warn('Wake loops restart lock:', e);
          }
        }, 1200);
      }
    };

    wakeRec.onerror = () => {
      // Loop fallback error
    };

    wakeRecognitionRef.current = wakeRec;
    try {
      wakeRec.start();
    } catch (e) {
      console.warn('Initial Wake capture exception:', e);
    }
  };

  const stopWakeWordListener = () => {
    if (wakeRecognitionRef.current) {
      try {
        wakeRecognitionRef.current.stop();
      } catch (e) {}
      wakeRecognitionRef.current = null;
    }
  };

  // ─── SETTINGS HANDLERS ────────────────────────────────────────────────────────
  const handleSaveSettings = (updatedSettings: Settings) => {
    setSettings(updatedSettings);
    localStorage.setItem('asuna_settings', JSON.stringify(updatedSettings));
    setStatusText('Configurations applied successfully.');
    setTimeout(() => setStatusText('Online — Ready to assist'), 1800);
  };

  // ─── TASKS HANDLERS ───────────────────────────────────────────────────────────
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.done));
  };

  const dismissPwaBanner = () => {
    setPwaBannerVisible(false);
    localStorage.setItem('asuna_pwa_dismissed', 'true');
  };

  return (
    <div className="w-full min-h-screen bg-[#080B16] text-[#F0EEF8] flex items-center justify-center p-0 md:p-6 overflow-hidden relative selection:bg-[#E8849A]/30">
      
      {/* BACKGROUND GRAPHIC HUD - HOLOPOLY DESKTOP COCKPIT EFFECT */}
      <div className="absolute inset-0 pointer-events-none opacity-20 hidden md:block select-none overflow-hidden">
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full border border-[#4A9EFF]/10 animate-[spin_20s_linear_infinite]" />
        <div className="absolute bottom-1/4 right-10 w-[450px] h-[450px] rounded-full border border-[#E8849A]/10 animate-[spin_40s_linear_infinite_reverse]" />
        
        {/* Futuristic Technical Cathode ray background overlay */}
        <div className="absolute top-12 left-24 text-[11px] font-mono text-[#4A9EFF]/35 tracking-widest space-y-1 bg-[#13172A]/10 p-4 border border-blue-500/10 rounded-lg">
          <div className="font-bold text-[#E8849A]/50">SAO UTILITY RAIL // ENGINE v5.28</div>
          <div>STATUS: SYNCED</div>
          <div>USER: PICKYEXS</div>
          <div>LOC: NEW APPS / CONTAINER</div>
          <div>PING: 14ms (STABLE)</div>
        </div>

        <div className="absolute bottom-12 right-24 text-[10px] font-mono text-[#E8849A]/30 text-right space-y-1">
          <div>ASUNA CORE COGNITIVE V2.0</div>
          <div>SECURE LOCAL PERSIST_STORAGE_DB // LOADED</div>
          <div>VIRTUAL KEYBOARD CAPTURE // STANDBY</div>
          <div>"DEFEAT IS NOT AN OPTION"</div>
        </div>
      </div>

      {/* STACKED CELL PHONE APP CANVASES FRAME */}
      <div className="relative w-full max-w-[480px] h-screen md:h-[880px] bg-[#0A0E1A] shadow-3xl flex flex-col overflow-hidden md:rounded-3xl border border-white/5 md:border-[#E8849A]/15">
        
        {/* Subtle glowing digital particle grid overlay */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(rgba(232,132,154,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(232,132,154,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* 1. Header display bar */}
        <Header
          userName={settings.userName}
          statusText={statusText}
          isThinking={isThinking}
          isListening={isListening}
          activeTasksCount={tasks.filter((t) => !t.done).length}
          activeTab={activeTab}
          onSwitchTab={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* 2. Primary contents viewport panels (tabs conditional) */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {activeTab === 'chat' ? (
            <ChatPanel
              messages={messages}
              isThinking={isThinking}
              isListening={isListening}
              onSend={handleSendMessage}
              onToggleMic={toggleSpeechMic}
            />
          ) : (
            <TasksPanel
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onClearCompleted={handleClearCompleted}
            />
          )}
        </div>

        {/* 3. Settings configurations bottom overlay sheet */}
        <SettingsOverlay
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          elevenKey={settings.elevenKey}
          voiceId={settings.voiceId}
          voiceEnabled={settings.voiceEnabled}
          wakeEnabled={settings.wakeEnabled}
          userName={settings.userName}
          localVoiceEnabled={settings.localVoiceEnabled}
          onSave={handleSaveSettings}
        />

        {/* 4. IOS Safari PWA Install Instructions Banner */}
        {pwaBannerVisible && (
          <div
            id="install-banner"
            className="absolute bottom-5 left-4 right-4 bg-[#13172A] border border-[#E8849A]/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-[0_12px_44px_rgba(0,0,0,0.65)] z-50 animate-[slideUp_0.4s_cubic-bezier(0.32,0.72,0,1)_forwards]"
          >
            <div className="text-3xl select-none">⚔️</div>
            <div className="flex-1 min-w-0 font-sans">
              <strong className="block text-sm text-[#F0EEF8] font-semibold mb-0.5">Install ASUNA on Mobile</strong>
              <p className="text-[11.5px] leading-relaxed text-[#F0EEF8]/60">
                Tap the <strong className="text-[#E8849A]">Share</strong> icon, then select <strong className="text-[#E8849A]">"Add to Home Screen"</strong> in Safari for standalone interface.
              </p>
            </div>
            <button
              onClick={dismissPwaBanner}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center shrink-0 border border-white/5 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
