'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Zap, RotateCcw } from 'lucide-react';
import { useIncidentStore, useMapStore } from '@/store';
import { clsx } from 'clsx';
import { geocodeLocation, extractLocations } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'NYC Traffic Incident Co-Pilot online. Powered by Groq · LLaMA 3.3 70B. Awaiting officer input.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessionId] = useState(() => crypto.randomUUID());

  const setFromResponse = useIncidentStore((state) => state.setFromResponse);
  const setError = useIncidentStore((state) => state.setError);
  const setLoading = useIncidentStore((state) => state.setLoading);
  const setLocations = useIncidentStore((state) => state.setLocations);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setLoading(true);

    try {
      // Extract A and B locations from query
      const { locationA: nameA, locationB: nameB } = extractLocations(userMessage);

      if (nameA && nameB) {
        const [coordsA, coordsB] = await Promise.all([
          geocodeLocation(nameA),
          geocodeLocation(nameB),
        ]);

        if (coordsA && coordsB) {
          setLocations(coordsA, coordsB);

          // Center map between A and B with auto zoom
          const centerLat = (coordsA.lat + coordsB.lat) / 2;
          const centerLng = (coordsA.lng + coordsB.lng) / 2;
          const maxDiff = Math.max(
            Math.abs(coordsA.lat - coordsB.lat),
            Math.abs(coordsA.lng - coordsB.lng)
          );
          const zoom = maxDiff > 0.05 ? 12 : maxDiff > 0.02 ? 13 : 14;

          useMapStore.setState({ mapCenter: [centerLat, centerLng], zoomLevel: zoom });

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `📍 EXACT ROUTE:\n• Location A: ${coordsA.name}\n  (${coordsA.lat.toFixed(6)}, ${coordsA.lng.toFixed(6)})\n• Location B: ${coordsB.name}\n  (${coordsB.lat.toFixed(6)}, ${coordsB.lng.toFixed(6)})`,
          }]);
        }
      }

      // Send to backend
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage, session_id: sessionId }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Update entire store from backend response
      setFromResponse(data);

      // Show narrative as chat reply
      const reply = data?.command?.narrative || 'Response received.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setError(null);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error communicating with Co-Pilot. Please try again.';
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      setMessages([{
        role: 'assistant',
        content: 'NYC Traffic Incident Co-Pilot online. Powered by Groq · LLaMA 3.3 70B. Awaiting officer input.',
      }]);
      setError(null);
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-cyan-600" />
          <span className="font-mono text-sm font-bold text-slate-700">AI CO-PILOT</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={isLoading}
            title="Reset chat and backend state"
            className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors rounded-md hover:bg-slate-100"
          >
            <RotateCcw size={14} />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Zap size={11} className="text-amber-500" />
            <span>Groq · LLaMA 3.3 70B</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
            <div className={clsx(
              'w-8 h-8 rounded shrink-0 flex items-center justify-center',
              msg.role === 'user' ? 'bg-blue-50 text-blue-600' : 'bg-cyan-50 text-cyan-600'
            )}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={clsx(
              'max-w-[80%] rounded-lg p-3 text-sm font-sans leading-relaxed shadow-sm whitespace-pre-line',
              msg.role === 'user'
                ? 'bg-blue-50 text-blue-900 border border-blue-100'
                : 'bg-slate-50 text-slate-800 border border-slate-200'
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-cyan-50 text-cyan-600">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-lg p-3 text-sm text-slate-500 flex items-center gap-2">
              <span className="animate-pulse">Groq synthesizing data...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. from Times Square to Brooklyn Bridge..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-4 pr-12 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none h-[46px] font-sans shadow-sm"
            rows={1}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-1.5 text-slate-400 hover:text-cyan-600 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors rounded-md hover:bg-slate-100"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}