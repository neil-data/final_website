'use client';

import { useIncidentStore } from '@/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Bell, Clock, CheckCircle2, Radio, Smartphone, Monitor, Zap, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BackendMetrics {
  total_queries: number;
  avg_time_saved_minutes: number;
  total_time_saved_minutes: number;
  avg_ai_response_seconds: number;
  manual_baseline_seconds: number;
}

const speedData = [
  { time: '-30m', Manhattan: 25, Brooklyn: 30, Queens: 35 },
  { time: '-25m', Manhattan: 22, Brooklyn: 28, Queens: 34 },
  { time: '-20m', Manhattan: 18, Brooklyn: 25, Queens: 32 },
  { time: '-15m', Manhattan: 12, Brooklyn: 20, Queens: 30 },
  { time: '-10m', Manhattan: 8, Brooklyn: 18, Queens: 28 },
  { time: '-5m', Manhattan: 4, Brooklyn: 15, Queens: 25 },
  { time: 'Now', Manhattan: 4, Brooklyn: 12, Queens: 22 },
];

const distributionData = [
  { speed: '0-10', count: 15 },
  { speed: '11-20', count: 25 },
  { speed: '21-30', count: 45 },
  { speed: '31-40', count: 30 },
  { speed: '41+', count: 10 },
];

export default function AnalyticsPage() {
  // ✅ public_alert replaces alert, added pipeline_seconds + time_saved_minutes + confidence_percent
  const {
    public_alert,
    pipeline_seconds,
    time_saved_minutes,
    confidence_percent,
    next_review_minutes,
  } = useIncidentStore();

  // ✅ Fetch real metrics from backend
  const [metrics, setMetrics] = useState<BackendMetrics | null>(null);

  useEffect(() => {
    fetch('/api/metrics')
      .then(r => r.json())
      .then(setMetrics)
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8">

      {/* ✅ Top KPI cards — replaced hardcoded values with real metrics data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Queries</div>
            <div className="text-3xl font-mono font-bold text-slate-900">{metrics?.total_queries ?? '-'}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold mb-1">Avg Time Saved</div>
            <div className="text-3xl font-mono font-bold text-green-600">{metrics?.avg_time_saved_minutes?.toFixed(1) ?? '-'}m</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Zap size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold mb-1">Avg AI Response</div>
            <div className="text-3xl font-mono font-bold text-slate-900">{metrics?.avg_ai_response_seconds?.toFixed(1) ?? '-'}s</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold mb-1">Manual Baseline</div>
            <div className="text-3xl font-mono font-bold text-slate-900">{metrics ? (metrics.manual_baseline_seconds / 60).toFixed(0) : '-'}m</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Timer size={20} />
          </div>
        </div>

        {/* Last Query Metrics from Zustand Store */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold mb-1">Last AI Response</div>
            <div className="text-3xl font-mono font-bold text-slate-900">{pipeline_seconds?.toFixed(1) ?? '-'}s</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
            <Zap size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold mb-1">Last Time Saved</div>
            <div className="text-3xl font-mono font-bold text-green-600">{time_saved_minutes?.toFixed(1) ?? '-'}m</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold mb-1">Last Confidence</div>
            <div className="text-3xl font-mono font-bold text-slate-900">{confidence_percent ?? '-'}%</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold mb-1">Next Review</div>
            <div className="text-3xl font-mono font-bold text-slate-900">{next_review_minutes ?? '-'}m</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
            <Timer size={20} />
          </div>
        </div>
      </div>

      {/* Speed over time chart — static demo data (live data comes from backend pipeline) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h2 className="text-sm font-mono text-slate-500 uppercase tracking-wider font-semibold mb-6">Road Speed Over Time (Last 30 Mins)</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={speedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f172a' }}
              />
              <Line type="monotone" dataKey="Manhattan" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Brooklyn" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Queens" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ public_alert.vms / radio / social — correct backend field name */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 pb-2">
            <Monitor size={16} />
            VMS Display
          </div>
          <div className="bg-emerald-900 border-4 border-emerald-950 rounded-lg p-4 flex items-center justify-center min-h-[120px] shadow-inner">
            <p className="font-bold text-emerald-400 text-lg text-center uppercase tracking-wide leading-snug" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
              {public_alert.vms}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 pb-2">
            <Radio size={16} />
            Radio Broadcast
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex-1">
            <p className="font-sans text-slate-700 text-sm leading-relaxed italic">
              &quot;{public_alert.radio}&quot;
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 pb-2">
            <Smartphone size={16} />
            Social Media
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex-1">
            <p className="font-sans text-slate-700 text-sm leading-relaxed">
              {public_alert.social}
            </p>
          </div>
        </div>
      </div>

      {/* Speed distribution bar chart */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h2 className="text-sm font-mono text-slate-500 uppercase tracking-wider font-semibold mb-6">Segment Speed Distribution (km/h)</h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="speed" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}