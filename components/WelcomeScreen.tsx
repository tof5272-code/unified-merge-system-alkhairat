
import React from 'react';
import { ArrowLeft, ShieldCheck, Zap, Palette, Moon, Sun, BookOpen, CheckCircle2, Rocket, Sparkles } from 'lucide-react';
import { LogoIcon } from './Icons';
import { ThemeMode } from '../types';

interface WelcomeScreenProps {
  onStart: () => void;
  isDarkMode: boolean;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  toggleDark: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isDarkMode, theme, onThemeChange, toggleDark }) => {
  const themes: { id: ThemeMode; name: string; color: string }[] = [
    { id: 'royal', name: 'ذهبي', color: '#d4af37' },
    { id: 'sapphire', name: 'ياقوتي', color: '#3b82f6' },
    { id: 'emerald', name: 'زمردي', color: '#10b981' },
    { id: 'ruby', name: 'عقيقي', color: '#e11d48' },
    { id: 'midnight', name: 'ليلي', color: '#94a3b8' },
  ];

  const features = [
    { text: "محرك V7: سرعة 50 ملف / 5 ثوانٍ", icon: <Rocket size={18} className="animate-pulse" />, highlight: true },
    { text: "رفع ذكي ومنع التكرار", icon: <ShieldCheck size={18} /> },
    { text: "تدقيق آلي للتواقيع", icon: <CheckCircle2 size={18} /> },
    { text: "دمج مع الحفاظ على التنسيق", icon: <Zap size={18} /> },
    { text: "إعادة ترقيم تلقائي", icon: <BookOpen size={18} /> },
    { text: "توزيع المحاظر بشكل ذكي", icon: <Palette size={18} /> }
  ];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-all duration-1000 tech-grid ${
      isDarkMode ? 'bg-[#020617]' : 'bg-[#f8fafc]'
    }`}>
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] royal-gold-gradient opacity-10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30vw] h-[30vw] royal-gold-gradient opacity-5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10 flex gap-4 z-50">
         <button 
           onClick={toggleDark} 
           className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl border border-white/10 ${
             isDarkMode ? 'bg-white/5 text-gold-main hover:bg-white/10' : 'bg-white text-gold-main hover:bg-slate-50'
           }`}
         >
            {isDarkMode ? <Sun size={20} className="animate-spin-slow" /> : <Moon size={20} />}
         </button>
      </div>

      <div className="max-w-7xl w-full h-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 p-6 lg:p-12 relative z-10 overflow-hidden">
        
        {/* Branding & Info Section */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-right space-y-6 animate-fade-in max-w-2xl">
          <div className="relative group">
            <div className="absolute -inset-4 royal-gold-gradient rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="relative p-7 royal-gold-gradient rounded-[2.5rem] shadow-2xl border border-white/20 animate-float-soft">
              <LogoIcon size={56} color="white" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-gold-main/30 bg-gold-main/10 text-gold-main font-black text-xs shadow-lg backdrop-blur-md transition-all hover:scale-105">
               <Sparkles size={16} className="text-gold-main animate-pulse" />
               <span>منصة الترقيات ❤️🙏</span>
            </div>
            <h1 className={`text-[clamp(2.2rem,4.5vw,4rem)] font-black tracking-tight leading-[1.1] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               منصة <span className="gold-text">الخيرات</span> الذكية
            </h1>
            <p className={`text-sm sm:text-base font-bold opacity-70 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              النظام المركزي المعتمد لمعالجة ودمج ملفات التوصيات والحذف والاستحداث لمحطة كهرباء الخيرات الغازية بدقة متناهية وسرعة فائقة.
            </p>
          </div>

          {/* Desktop Feature Badges */}
          <div className="hidden lg:flex flex-wrap gap-3 justify-start">
            {features.map((feat, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border text-[11px] font-bold transition-all group ${
                feat.highlight 
                ? 'border-gold-main/40 bg-gold-main/10 text-gold-main shadow-lg' 
                : 'border-white/10 text-slate-400 hover:border-gold-main/30'
              }`}>
                <div className={`${feat.highlight ? 'text-gold-main' : 'text-gold-main group-hover:scale-110'} transition-transform`}>
                  {feat.icon}
                </div>
                <span>{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action & Configuration Section */}
        <div className="w-full lg:w-[420px] flex flex-col items-center gap-8 stagger-in shrink-0">
          
          {/* Mobile Feature List - Compact */}
          <div className="lg:hidden grid grid-cols-2 gap-2 w-full">
            {features.slice(0, 6).map((feat, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border text-[9px] font-black ${
                feat.highlight ? 'border-gold-main/30 text-gold-main bg-gold-main/5' : 'border-white/10 text-slate-400'
              }`}>
                <span className="text-gold-main shrink-0">{feat.icon}</span>
                <span className="truncate">{feat.text}</span>
              </div>
            ))}
          </div>

          {/* Theme Selector */}
          <div className="glass-card p-7 w-full border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 royal-gold-gradient opacity-[0.03] blur-3xl -translate-y-16 translate-x-16" />
            
            <div className="flex items-center justify-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4">
              <Palette size={14} className="text-gold-main" /> تخصيص الطابع البصري للنظام
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  className={`group relative flex flex-col items-center gap-2.5 p-2.5 rounded-2xl transition-all duration-300 ${
                    theme === t.id 
                    ? 'bg-gold-main/10 scale-105 shadow-inner' 
                    : 'hover:bg-white/5 opacity-40 grayscale hover:grayscale-0'
                  }`}
                >
                  <div 
                    className={`w-9 h-9 rounded-full shadow-lg border-2 transition-transform group-active:scale-90 ${
                      theme === t.id ? 'border-white dark:border-white/40' : 'border-transparent'
                    }`} 
                    style={{ backgroundColor: t.color }} 
                  />
                  <span className={`text-[8px] font-black ${theme === t.id ? 'text-gold-main' : ''}`}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start CTA */}
          <div className="w-full flex flex-col items-center gap-6">
            <button 
              onClick={onStart}
              className="w-full px-8 py-5 royal-gold-gradient text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 shadow-[0_15px_40px_rgba(184,134,11,0.2)] hover:scale-[1.02] active:scale-95 transition-all group border border-white/20"
            >
              <span>دخول النظام</span>
              <ArrowLeft size={22} className="group-hover:-translate-x-2 transition-transform duration-500" />
            </button>

            <div className="flex items-center gap-6 opacity-40 py-2">
              <div className="flex items-center gap-2 group cursor-default">
                <div className="p-1.5 rounded-lg bg-gold-main/20 text-gold-main group-hover:scale-110 transition-transform">
                  <ShieldCheck size={14} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">محمي رقمياً</span>
              </div>
              <div className="w-px h-4 bg-slate-500/20" />
              <div className="flex items-center gap-2 group cursor-default">
                <div className="p-1.5 rounded-lg bg-gold-main/20 text-gold-main group-hover:scale-110 transition-transform">
                  <Zap size={14} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">معالجة فورية</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-soft { animation: float 6s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        body { overflow: hidden !important; }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;
