'use client';

import { useIncidentStore, useUIStore } from '@/store';
import { RefreshCw, AlertTriangle, MapPin, Clock, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function IncidentsPage() {
  // ✅ All fields match new store/index.ts (backend field names)
  const {
    narrative,
    reasoning,
    risk_factors,
    severity,
    severity_score,
    affected_intersections,
    predictions,
    cascade_risk,
    recommended_preemptive_action,
  } = useIncidentStore();

  const { lastRefreshTimestamp, refresh } = useUIStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      refresh();
      setIsRefreshing(false);
    }, 1500);
  };

  // severity_score is 0–100 from backend
  const getSeverityColor = (score: number) => {
    if (score < 40) return 'bg-green-100 text-green-800 border-green-200';
    if (score <= 70) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getCascadeColor = (risk: string) => {
    if (risk === 'HIGH') return 'bg-red-50 border-red-100 text-red-700';
    if (risk === 'MEDIUM') return 'bg-amber-50 border-amber-100 text-amber-700';
    return 'bg-green-50 border-green-100 text-green-700';
  };

  // Derive borough from first affected intersection
  const borough = affected_intersections[0]?.split(',').pop()?.trim() ?? 'Manhattan';

  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-mono font-bold text-slate-900">ACTIVE INCIDENT</h1>

          {/* ✅ severity_score/100 + severity label from backend */}
          <div className={`px-3 py-1 rounded-full border font-mono text-sm font-bold flex items-center gap-2 shadow-sm ${getSeverityColor(severity_score)}`}>
            <AlertTriangle size={14} />
            {severity} · {severity_score}/100
          </div>

          {/* ✅ borough derived from affected_intersections */}
          <div className="px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm font-mono text-sm text-slate-600 flex items-center gap-2">
            <MapPin size={14} />
            {borough}
          </div>

          <div className="px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm font-mono text-sm text-slate-600 flex items-center gap-2" suppressHydrationWarning>
            <Clock size={14} />
            {new Date(lastRefreshTimestamp).toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg text-sm font-mono text-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'SYNCING...' : 'REFRESH DATA'}
        </button>
      </div>

      {/* Narrative + Reasoning + Risk Factors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ✅ narrative from command agent */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col gap-3">
          <div className="text-sm font-mono text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            Narrative
          </div>
          <p className="text-slate-700 leading-relaxed font-sans text-sm">{narrative}</p>
        </div>

        {/* ✅ reasoning from severity agent */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col gap-3">
          <div className="text-sm font-mono text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Reasoning
          </div>
          <p className="text-slate-700 leading-relaxed font-sans text-sm">{reasoning}</p>
        </div>

        {/* ✅ risk_factors[] from severity agent — replaces old flat "risk" string */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col gap-3">
          <div className="text-sm font-mono text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Risk Factors
          </div>
          <ul className="flex flex-col gap-2">
            {risk_factors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-sans">
                <ShieldAlert size={13} className="text-red-500 mt-0.5 shrink-0" />
                {factor}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ✅ predictions[] from predictor agent — replaces old flat "cascade" string */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="text-sm font-mono text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            Cascade Prediction (Next 15 Mins)
          </div>
          {/* ✅ cascade_risk from predictor agent */}
          <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${getCascadeColor(cascade_risk)}`}>
            CASCADE RISK: {cascade_risk}
          </span>
        </div>

        {/* Structured predictions table */}
        <div className="flex flex-col gap-2 flex-1">
          {predictions.map((p, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
              <div className="font-mono text-xs font-bold text-slate-400 w-5">{i + 1}</div>
              <div className="flex-1">
                <div className="font-mono text-sm font-semibold text-slate-800">{p.intersection}</div>
                <div className="text-xs text-slate-500 font-sans mt-0.5">{p.reason}</div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                <span className="text-slate-500">{p.current_speed_kmh} → <span className="text-red-600 font-bold">{p.predicted_speed_kmh} km/h</span></span>
                <span className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded font-bold">
                  -{p.time_to_congest_minutes}min
                </span>
                <span className="text-slate-400">{p.confidence_percent}%</span>
              </div>
            </div>
          ))}

          {/* ✅ recommended_preemptive_action from predictor agent */}
          <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-800 font-sans">
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-amber-600">Preemptive Action · </span>
            {recommended_preemptive_action}
          </div>
        </div>
      </div>
    </div>
  );
}