'use client';

import dynamic from 'next/dynamic';
import { useIncidentStore } from '@/store';
import { TrafficCone, ArrowRightLeft, Timer, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 font-mono text-sm animate-pulse">
      INITIALIZING MAP SYSTEM...
    </div>
  ),
});

export default function RoutesPage() {
  // ✅ All fields match backend: signal_retiming, diversion_route, estimated_clearance_minutes, signal_changes[], priority_corridor
  const {
    signal_retiming,
    diversion_route,
    estimated_clearance_minutes,
    signal_changes,
    priority_corridor,
    estimated_clearance_improvement_minutes,
  } = useIncidentStore();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full max-w-7xl mx-auto">
      {/* Map */}
      <div className="w-full lg:w-1/2 h-[50vh] lg:h-full">
        <Map showDiversionOnly={true} />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col gap-6 h-[50vh] lg:h-full overflow-y-auto pr-2">

        {/* ✅ signal_retiming from command agent */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-cyan-600 border-b border-slate-100 pb-3">
            <TrafficCone size={20} />
            <h2 className="font-mono font-bold tracking-wider uppercase">Signal Retiming</h2>
          </div>
          <p className="text-slate-700 font-sans text-sm leading-relaxed">
            {signal_retiming}
          </p>

          {/* ✅ signal_changes[] from signal agent — structured list */}
          {signal_changes.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Phase Changes · Priority: {priority_corridor}
              </div>
              {signal_changes.map((sc, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-mono">
                  <span className="text-slate-600 font-semibold flex-1">{sc.intersection}</span>
                  <span className="text-slate-400">{sc.current_phase_seconds}s</span>
                  <ArrowRight size={12} className="text-cyan-500" />
                  <span className="text-cyan-700 font-bold">{sc.recommended_phase_seconds}s</span>
                  <span className="text-slate-400 capitalize">{sc.direction_to_extend}</span>
                </div>
              ))}
              <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 font-sans">
                Est. clearance improvement: <span className="font-bold font-mono">{estimated_clearance_improvement_minutes} min</span>
              </div>
            </div>
          )}
        </div>

        {/* ✅ diversion_route from command agent */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-amber-600 border-b border-slate-100 pb-3">
            <ArrowRightLeft size={20} />
            <h2 className="font-mono font-bold tracking-wider uppercase">Diversion Route</h2>
          </div>
          <p className="text-slate-700 font-sans text-sm leading-relaxed">
            {diversion_route}
          </p>
        </div>

        {/* ✅ estimated_clearance_minutes from severity agent */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col gap-4 flex-1 justify-center items-center relative overflow-hidden">
          <div className="absolute top-6 left-6 flex items-center gap-3 text-green-600 border-b border-slate-100 pb-3 w-[calc(100%-48px)]">
            <Timer size={20} />
            <h2 className="font-mono font-bold tracking-wider uppercase">Clearance Time</h2>
          </div>

          <div className="relative w-48 h-48 flex items-center justify-center mt-8">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 * (1 - estimated_clearance_minutes / 60) }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-5xl font-mono font-bold text-slate-900 mb-1">
                {estimated_clearance_minutes}
              </span>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                Minutes
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}