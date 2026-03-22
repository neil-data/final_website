'use client';

import { useUIStore } from '@/store';
import { Activity, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

type BackendStatus = 'ok' | 'offline' | 'checking';

export function Navbar() {
  const { lastRefreshTimestamp } = useUIStore();
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Poll backend health every 10 seconds
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setBackendStatus(data.status === 'ok' ? 'ok' : 'offline');
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Colored dot + status text based on health
  const getBackendStatusDisplay = () => {
    if (backendStatus === 'ok') {
      return {
        dot: 'bg-green-500',
        dotAnimation: '',
        text: 'BACKEND ONLINE',
      };
    }
    if (backendStatus === 'checking') {
      return {
        dot: 'bg-amber-500 animate-pulse',
        dotAnimation: '',
        text: 'CONNECTING...',
      };
    }
    return {
      dot: 'bg-red-500',
      dotAnimation: '',
      text: 'BACKEND OFFLINE',
    };
  };

  const status = getBackendStatusDisplay();

  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-4">
        {/* ✅ Backend health indicator */}
        <div className={`flex items-center gap-2 font-mono text-xs font-bold`}>
          <div className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className={backendStatus === 'ok' ? 'text-green-600' : backendStatus === 'checking' ? 'text-amber-600' : 'text-red-600'}>
            {status.text}
          </span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="text-slate-500 font-mono text-xs font-semibold">
          GROQ · LLAMA-3.3-70B
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs font-semibold">
          <Clock size={14} />
          <span suppressHydrationWarning>{mounted ? time : '--:--:--'}</span>
        </div>
        <div className="text-slate-400 font-mono text-xs font-medium" suppressHydrationWarning>
          LAST REFRESH: {mounted ? new Date(lastRefreshTimestamp).toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}
        </div>
      </div>
    </header>
  );
}