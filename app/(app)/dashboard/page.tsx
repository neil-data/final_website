'use client';

import dynamic from 'next/dynamic';
import { DashboardKPIs } from '@/components/DashboardKPIs';
import { Chatbot } from '@/components/Chatbot';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 font-mono text-sm animate-pulse">
      INITIALIZING MAP SYSTEM...
    </div>
  ),
});

export default function Dashboard() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="w-full lg:w-[55%] h-[50vh] lg:h-full">
        <Map />
      </div>
      <div className="w-full lg:w-[45%] flex flex-col gap-4 h-[50vh] lg:h-full">
        <div className="h-1/3 min-h-[160px]">
          <DashboardKPIs />
        </div>
        <div className="flex-1 min-h-[300px]">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}
