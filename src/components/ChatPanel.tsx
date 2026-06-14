import React, { useRef, useEffect, useState } from 'react';
import { Send, Mic, MicOff, Star } from 'lucide-react';
import { Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ChatPanelProps {
  messages: Message[];
  isThinking: boolean;
  isListening: boolean;
  onSend: (text: string) => void;
  onToggleMic: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isThinking,
  isListening,
  onSend,
  onToggleMic,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to lowest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleQuickAction = (text: string) => {
    if (isThinking) return;
    onSend(text);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden" id="chat-panel">
      {/* Messages Container */}
      <div 
        id="messages" 
        className="flex-1 overflow-y-auto px-4 py-5 md:py-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-pink-500/20"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`flex items-end gap-2.5 max-w-[85%] ${
                msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              {/* Profile avatar indicator */}
              <div
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs shadow-inner select-none ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500/50 to-blue-600'
                    : 'bg-gradient-to-br from-pink-400 to-pink-600'
                }`}
              >
                {msg.role === 'user' ? '👤' : '⚔️'}
              </div>

              {/* Chat Bubble */}
              <div className="flex flex-col gap-1 min-w-0">
                <div
                  className={`bubble px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#4A9EFF]/10 to-[#4A9EFF]/25 border border-[#4A9EFF]/22 rounded-br-2px text-[#F0EEF8]'
                      : 'bg-gradient-to-br from-[#181D32] to-[#121728] border border-[#E8849A]/12 rounded-bl-2px text-[#F0EEF8]'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Optional Task Success Notification */}
                {msg.taskAdded && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 mt-1 px-2.5 py-1.5 rounded-lg bg-[#4A9EFF]/15 border border-[#4A9EFF]/25 text-[11px] text-[#4A9EFF]"
                  >
                    <Star className="w-3.5 h-3.5 fill-[#4A9EFF] animate-spin" style={{ animationDuration: '3s' }} />
                    <span>
                      Parsed: <strong>{msg.taskAdded.title}</strong>{' '}
                      {msg.taskAdded.type === 'reminder' ? 'reminder' : 'task'} added!
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pulsing Asuna Thinking Indicator */}
        {isThinking && (
          <div className="flex items-end gap-2.5 self-start max-w-[80%]" id="typing-row">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs bg-gradient-to-br from-pink-400 to-pink-600">
              ⚔️
            </div>
            <div className="bubble flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-gradient-to-br from-[#181D32] to-[#121728] border border-[#E8849A]/12 rounded-bl-2px">
              <span className="w-2 h-2 rounded-full bg-[#E8849A] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#E8849A] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#E8849A] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions Scroll Bar */}
      <div id="quick-actions" className="flex gap-2 px-4 py-1.5 overflow-x-auto scrollbar-none flex-shrink-0 pb-2">
        <button
          onClick={() => handleQuickAction('Add a reminder: Complete chemistry homework tomorrow at 3 PM')}
          className="chip flex-shrink-0 text-[11px] px-3.5 py-1.5 rounded-full border border-[#4A9EFF]/25 text-[#4A9EFF]/70 hover:bg-[#4A9EFF]/10 active:bg-[#4A9EFF]/15 transition-all"
        >
          Add a reminder
        </button>
        <button
          onClick={() => handleQuickAction('Explain quantum tunneling simply')}
          className="chip flex-shrink-0 text-[11px] px-3.5 py-1.5 rounded-full border border-[#4A9EFF]/25 text-[#4A9EFF]/70 hover:bg-[#4A9EFF]/10 active:bg-[#4A9EFF]/15 transition-all"
        >
          Explain quantum physics
        </button>
        <button
          onClick={() => handleQuickAction('What tasks or reminders do I have pending?')}
          className="chip flex-shrink-0 text-[11px] px-3.5 py-1.5 rounded-full border border-[#4A9EFF]/25 text-[#4A9EFF]/70 hover:bg-[#4A9EFF]/10 active:bg-[#4A9EFF]/15 transition-all"
        >
          My tasks
        </button>
        <button
          onClick={() => handleQuickAction('Suggest a healthy 15-minute quick breakfast recipe')}
          className="chip flex-shrink-0 text-[11px] px-3.5 py-1.5 rounded-full border border-[#4A9EFF]/25 text-[#4A9EFF]/70 hover:bg-[#4A9EFF]/10 active:bg-[#4A9EFF]/15 transition-all"
        >
          Healthy Breakfast Ideas
        </button>
      </div>

      {/* Input Bar Area */}
      <div id="input-bar" className="flex-shrink-0 p-3 pt-1.5 md:p-4 bg-gradient-to-t from-[#0D1225] to-[#0A0E1A] border-t border-[#E8849A]/15">
        <div className="flex items-end gap-2 bg-[#13172A] border border-[#E8849A]/18 rounded-[22px] p-2">
          {/* Microphone Capture Button */}
          <button
            id="mic-btn"
            onClick={onToggleMic}
            className={`w-9 h-9 rounded-full flex-shrink-0 border flex items-center justify-center text-sm transition-all hover:bg-white/5 active:scale-95 ${
              isListening
                ? 'bg-blue-500/15 border-[#4A9EFF] text-[#4A9EFF] shadow-[0_0_8px_rgba(74,158,255,0.3)]'
                : 'border-white/10 text-[#F0EEF8]/60'
            }`}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          {/* Core Textarea */}
          <textarea
            ref={textareaRef}
            id="chat-input"
            rows={1}
            placeholder={isListening ? "Listening..." : "Message ASUNA..."}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isListening}
            className="flex-1 text-[14px] leading-[1.5] max-h-24 py-1.5 px-1 bg-transparent text-[#F0EEF8] border-none outline-none resize-none self-center scrollbar-thin"
          />

          {/* Send Trigger Button */}
          <button
            id="send-btn"
            onClick={handleSubmit}
            disabled={!inputText.trim() || isThinking}
            className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white transition-all active:scale-95 ${
              inputText.trim() && !isThinking
                ? 'bg-gradient-to-br from-[#E8849A] to-[#C85B7A] cursor-pointer shadow-[0_2px_8px_rgba(232,132,154,0.3)]'
                : 'bg-white/10 opacity-30 cursor-not-allowed'
            }`}
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
