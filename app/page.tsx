'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Activity, Shield, Zap, ArrowRight, Map, Bell, BarChart3, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate loading time for the stunning animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-cyan-500 blur-[100px] opacity-30 rounded-full" />
              <Activity size={64} className="text-cyan-400 mb-8 relative z-10" />
            </motion.div>
            
            <div className="flex flex-col items-center gap-4 relative z-10">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl font-mono font-bold tracking-tight"
              >
                NYC.COPILOT
              </motion.h1>
              
              <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-cyan-400"
                />
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-slate-400 font-mono text-sm uppercase tracking-widest"
              >
                Initializing Systems...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* suppressHydrationWarning prevents mismatch from browser extensions like Bitwarden */}
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans" suppressHydrationWarning>
        {/* Top Navbar */}
        <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-cyan-400">
              <Activity size={24} />
            </div>
            <span className="font-mono font-bold text-xl tracking-tight text-slate-900">NYC.COPILOT</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#system" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">System Status</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
            >
              Access Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>

          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-x-0 top-20 bg-white border-b border-slate-200 p-6 z-30 flex flex-col gap-4 shadow-xl md:hidden"
            >
              <a href="#features" className="text-lg font-medium text-slate-600 py-2 border-b border-slate-100">Features</a>
              <a href="#system" className="text-lg font-medium text-slate-600 py-2 border-b border-slate-100">System Status</a>
              <Link 
                href="/dashboard"
                className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-slate-900 rounded-xl shadow-lg"
              >
                Access Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Secondary Navbar (Stats/Ticker) */}
        <div className="mt-20 bg-slate-900 text-slate-300 py-3 px-6 overflow-hidden border-b border-slate-800">
          <div className="flex items-center gap-8 animate-marquee whitespace-nowrap font-mono text-xs tracking-wider">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> SYSTEM ONLINE</span>
            <span>•</span>
            <span>ACTIVE INCIDENTS: 3</span>
            <span>•</span>
            <span>AVG RESPONSE TIME: 4.2m</span>
            <span>•</span>
            <span>NETWORK STATUS: OPTIMAL</span>
            <span>•</span>
            <span>LAST SYNC: JUST NOW</span>
            <span>•</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> SYSTEM ONLINE</span>
            <span>•</span>
            <span>ACTIVE INCIDENTS: 3</span>
            <span>•</span>
            <span>AVG RESPONSE TIME: 4.2m</span>
          </div>
        </div>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-24 pb-32 px-6 lg:px-12 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-cyan-400 opacity-20 blur-[100px]" />
            
            <div className="max-w-5xl mx-auto text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6, duration: 0.8 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 font-mono text-xs font-bold mb-8 border border-cyan-200">
                  <Shield size={14} />
                  OFFICIAL TRAFFIC MANAGEMENT SYSTEM
                </span>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                  Next-Generation <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                    Traffic Intelligence
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Real-time AI-powered system used by traffic control officers to manage live incidents, optimize routes, and reduce congestion across all five boroughs.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    href="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20"
                  >
                    Login to Dashboard
                    <ArrowRight size={18} />
                  </Link>
                  <a 
                    href="#features"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all"
                  >
                    View Capabilities
                  </a>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="py-24 bg-white px-6 lg:px-12 border-t border-slate-200">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Capabilities</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">Advanced tools designed specifically for rapid response and traffic flow optimization.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Map, title: "Live Mapping", desc: "Real-time visualization of traffic flow, incidents, and road closures with sub-second latency." },
                  { icon: Zap, title: "AI Co-Pilot", desc: "Automated reasoning for incident response, generating diversion routes and signal retiming plans." },
                  { icon: Bell, title: "Automated Alerts", desc: "Instant generation of VMS displays, radio broadcasts, and social media updates." }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-cyan-600 shadow-sm border border-slate-100 mb-6">
                      <feature.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-12 px-6 lg:px-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-cyan-500" />
              <span className="font-mono font-bold text-white tracking-wider">NYC.COPILOT</span>
            </div>
            
            <div className="flex items-center gap-6 font-mono text-sm">
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">System Status</a>
            </div>
            
            {/* suppressHydrationWarning for dynamic year */}
            <div className="text-sm" suppressHydrationWarning>
              &copy; {mounted ? new Date().getFullYear() : '2026'} NYC Dept of Transportation.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}