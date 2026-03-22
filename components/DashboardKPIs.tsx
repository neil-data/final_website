'use client';

import { useIncidentStore, useMapStore } from '@/store';
import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, MapPin, Zap } from 'lucide-react';
import { clsx } from 'clsx';

function CountUp({ to, duration = 1 }: { to: number; duration?: number }) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (current) => Math.floor(current));

  useEffect(() => {
    spring.set(to);
  }, [spring, to]);

  return <motion.span>{display}</motion.span>;
}

export function DashboardKPIs() {
  // ✅ Updated: using correct backend field names from store
  const { severity, severity_score, affected_intersections, estimated_clearance_minutes } = useIncidentStore();
  const { roadSegments } = useMapStore();

  const totalSegments = roadSegments.length;
  const criticalSegments = roadSegments.filter(s => s.speed < 15).length;

  // severity_score is 0–100 from backend
  const getSeverityColor = (score: number) => {
    if (score < 40) return 'bg-green-50 text-green-700 border-green-200';
    if (score <= 70) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  // Derive borough from first affected intersection e.g. "7th Ave & W56th St, Manhattan"
  const borough = affected_intersections.length > 0
    ? (affected_intersections[0].includes(',')
        ? affected_intersections[0].split(',').pop()?.trim()
        : 'Manhattan')
    : 'Manhattan';

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Total Segments */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-sm font-medium">Total Segments</span>
          <RouteIcon />
        </div>
        <div>
          <div className="text-4xl font-mono font-bold text-slate-900 mb-1">
            <CountUp to={totalSegments} />
          </div>
          <div className="flex items-center text-xs text-green-600 font-medium">
            <TrendingUp size={12} className="mr-1" />
            <span>Active</span>
          </div>
        </div>
      </div>

      {/* Critical Segments */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-sm font-medium">Critical Segments</span>
          <AlertTriangle size={16} className="text-red-500" />
        </div>
        <div>
          <div className="text-4xl font-mono font-bold text-red-600 mb-1">
            <CountUp to={criticalSegments} />
          </div>
          <div className="flex items-center text-xs text-red-600 font-medium">
            <TrendingDown size={12} className="mr-1" />
            <span>Speed &lt; 15 km/h</span>
          </div>
        </div>
      </div>

      {/* Clearance Time — replaces borough (more useful from backend) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-sm font-medium">Est. Clearance</span>
          <MapPin size={16} />
        </div>
        <div>
          <div className="text-4xl font-mono font-bold text-slate-900 mb-1">
            <CountUp to={estimated_clearance_minutes} />
            <span className="text-lg font-normal text-slate-400 ml-1">min</span>
          </div>
          <div className="flex items-center text-xs text-slate-500">
            <span>{borough} · Primary Zone</span>
          </div>
        </div>
      </div>

      {/* Severity Score — now 0–100 from backend */}
      <div className={clsx('border shadow-sm rounded-xl p-4 flex flex-col justify-between transition-colors', getSeverityColor(severity_score))}>
        <div className="flex items-center justify-between opacity-80">
          <span className="text-sm font-medium">Severity Score</span>
          <Zap size={16} />
        </div>
        <div>
          <div className="text-4xl font-mono font-bold mb-1">
            <CountUp to={severity_score} />
            <span className="text-lg opacity-50">/100</span>
          </div>
          <div className="flex items-center text-xs opacity-80 font-medium">
            {/* ✅ Uses severity string from backend: CRITICAL / HIGH / MEDIUM / LOW */}
            <span>Level {severity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3"/>
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
      <circle cx="18" cy="5" r="3"/>
    </svg>
  );
}