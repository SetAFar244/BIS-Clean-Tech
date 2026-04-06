/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLiveAPI } from './hooks/useLiveAPI';
import { Mic, MicOff, Loader2, Server, Shield, Cloud, Monitor, Code, PhoneCall, Activity, CalendarDays, Phone, Mail, FileText, X, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminCalendar } from './components/AdminCalendar';
import { InsightsList } from './components/InsightsList';
import { InsightDetail } from './components/InsightDetail';
import { Insight } from './lib/insights';

export default function App() {
  const { isConnected, isConnecting, isSpeaking, error, connect, disconnect } = useLiveAPI();
  const [view, setView] = useState<'home' | 'calendar' | 'insights' | 'insight-detail'>('home');
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [selectedService, setSelectedService] = useState<{title: string, description: string, icon: React.ReactNode} | null>(null);

  const handleSelectInsight = (insight: Insight) => {
    setSelectedInsight(insight);
    setView('insight-detail');
  };

  return (
    <div className="min-h-screen bg-black text-slate-50 font-sans selection:bg-orange-500/30">
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          <div 
            className="flex items-center gap-3 cursor-pointer z-10" 
            onClick={() => setView('home')}
          >
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider leading-none">BROWN'S <span className="text-orange-500">IT</span></span>
              <span className="text-xl font-black tracking-wider text-orange-500 leading-none">SOLUTIONS</span>
            </div>
          </div>
          
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 text-sm font-medium text-slate-400 z-0">
            <a href="tel:+16785925243" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Phone className="w-4 h-4" />
              (678) 592-5243
            </a>
            <a href="mailto:info@brownsitsolutions.services" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Mail className="w-4 h-4" />
              info@brownsitsolutions.services
            </a>
          </div>

          <nav className="flex items-center gap-8 text-sm font-medium text-slate-400 z-10">
            <button 
              onClick={() => setView('home')} 
              className={`hover:text-white transition-colors ${view === 'home' ? 'text-white' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => setView('insights')} 
              className={`flex items-center gap-2 hover:text-white transition-colors ${view === 'insights' || view === 'insight-detail' ? 'text-white' : ''}`}
            >
              <FileText className="w-4 h-4" />
              Insights
            </button>
            <button 
              onClick={() => setView('calendar')} 
              className={`flex items-center gap-2 hover:text-white transition-colors ${view === 'calendar' ? 'text-white' : ''}`}
            >
              <CalendarDays className="w-4 h-4" />
              Staff Portal
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {view === 'home' && (
          <div className="pb-20">
            <div className="py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium border border-orange-500/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Serving Atlanta Businesses
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
              >
                Designing the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                  Future of Tech.
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-400 max-w-xl leading-relaxed"
              >
                From cybersecurity to cloud management, we provide comprehensive IT solutions to keep your Atlanta business running smoothly. 
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-2 relative">
                      {isConnected && (
                        <motion.div 
                          className={`absolute inset-0 rounded-full border-2 ${isSpeaking ? 'border-amber-400' : 'border-orange-500/50'}`}
                          animate={isSpeaking ? { scale: [1, 1.3, 1], opacity: [1, 0, 1] } : { scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                          transition={{ duration: isSpeaking ? 1.5 : 3, repeat: Infinity }}
                        />
                      )}
                      {isSpeaking ? (
                        <Activity className="w-10 h-10 text-amber-400 animate-pulse" />
                      ) : (
                        <PhoneCall className={`w-10 h-10 ${isConnected ? 'text-orange-400' : 'text-slate-400'}`} />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">Meet Miriam</h3>
                      <p className="text-slate-400 text-sm max-w-sm mx-auto">
                        {isConnected 
                          ? (isSpeaking ? "Miriam is speaking..." : "Miriam is listening...") 
                          : "Our AI receptionist is ready to help you book an appointment and answer questions about our services."}
                      </p>
                    </div>

                    <button
                      onClick={isConnected ? disconnect : connect}
                      disabled={isConnecting}
                      className={`
                        relative w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3
                        ${isConnected 
                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
                          : 'bg-orange-600 text-white hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-600/25 border border-orange-500'
                        }
                        ${isConnecting ? 'opacity-75 cursor-not-allowed' : ''}
                      `}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Connecting...
                        </>
                      ) : isConnected ? (
                        <>
                          <MicOff className="w-5 h-5" />
                          End Conversation
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          Talk to Miriam
                        </>
                      )}
                    </button>
                    {error && (
                      <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              <ServiceCard 
                icon={<Shield />} 
                title="Cybersecurity" 
                description="Protect your business from evolving threats with enterprise-grade security, continuous monitoring, and proactive threat detection."
                onClick={(data) => setSelectedService(data)}
              />
              <ServiceCard 
                icon={<Cloud />} 
                title="Cloud Management" 
                description="Seamlessly migrate, optimize, and manage your cloud infrastructure for maximum scalability, security, and performance."
                onClick={(data) => setSelectedService(data)}
              />
              <ServiceCard 
                icon={<Server />} 
                title="Backup & Recovery" 
                description="Ensure business continuity with automated, secure backups and rapid disaster recovery solutions to prevent data loss."
                onClick={(data) => setSelectedService(data)}
              />
              <ServiceCard 
                icon={<Monitor />} 
                title="Computer Repair" 
                description="Fast, reliable hardware and software diagnostics and repair to minimize your downtime and keep your team productive."
                onClick={(data) => setSelectedService(data)}
              />
              <ServiceCard 
                icon={<Code />} 
                title="Web Development" 
                description="Custom, high-performance web applications tailored to your business needs, designed to scale and drive growth."
                onClick={(data) => setSelectedService(data)}
              />
              <ServiceCard 
                icon={<Headset />} 
                title="IT Support" 
                description="Comprehensive remote and on-site IT support to resolve technical issues quickly and keep your team productive."
                onClick={(data) => setSelectedService(data)}
              />
              <div 
                onClick={() => { if (!isConnected && !isConnecting) connect(); }}
                className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="text-orange-400 font-medium">+4 More Services</span>
                <span className="text-xs text-slate-500 mt-1">Ask Miriam for details</span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-8 lg:mt-12 bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-3xl p-8 lg:p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-8">
                Brown's <span className="text-orange-500">IT Solutions</span>
              </h2>
              <p className="text-lg lg:text-xl text-slate-300 leading-relaxed mb-6">
                With 20 years in software engineering and IT infrastructure, <strong>Brown’s IT Solutions</strong> aims to bridge the gap between veteran craftsmanship and AI-driven speed. We provide Business Owners with rapid AI delivery alongside the stability of robust IT support.
              </p>
              <p className="text-lg lg:text-xl text-slate-300 leading-relaxed mb-10">
                By integrating advanced AI with comprehensive managed services, we secure your entire digital ecosystem—from cloud to hardware—delivering in minutes what used to take weeks.
              </p>
              <div className="inline-block px-8 py-4 border border-orange-500/30 bg-orange-500/10 rounded-2xl text-orange-400 font-semibold tracking-wide text-lg shadow-lg shadow-orange-500/5">
                Let's build your future—scalable. Solutions for Business.
              </div>
            </div>
          </motion.div>
        </div>
        )}
        
        {view === 'calendar' && <AdminCalendar />}
        {view === 'insights' && <InsightsList onSelectInsight={handleSelectInsight} />}
        {view === 'insight-detail' && selectedInsight && (
          <InsightDetail insight={selectedInsight} onBack={() => setView('insights')} />
        )}
      </main>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
              
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-10 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-orange-400 mb-6 shadow-lg">
                  {selectedService.icon}
                </div>
                
                <h2 className="text-3xl font-bold mb-4 text-white">{selectedService.title}</h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                  {selectedService.description}
                </p>

                <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-slate-400 mb-4">Ready to secure your business?</p>
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      if (!isConnected && !isConnecting) connect();
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    Talk to Miriam to Book
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ServiceCard({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: (data: any) => void }) {
  return (
    <div 
      onClick={() => onClick({ icon, title, description })}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-orange-500/50 transition-colors group cursor-pointer"
    >
      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-medium text-slate-200 group-hover:text-orange-400 transition-colors">{title}</h3>
    </div>
  );
}
