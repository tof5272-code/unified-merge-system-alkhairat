
import React, { useState } from 'react';
import { MoonStar, Sun, FileSpreadsheet, Trash2, Settings, Palette, ChevronLeft, LayoutGrid, Award, Menu, X } from 'lucide-react';
import { PageType, ThemeMode } from '../types';
import { LogoIcon } from './Icons';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isDarkMode, toggleTheme, currentTheme, onThemeChange }) => {
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getButtonClass = (page: PageType) => {
    const isActive = currentPage === page;
    return `
      relative w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all duration-500 group overflow-hidden
      ${isActive 
        ? 'bg-gold-main/10 text-gold-main shadow-sm ring-1 ring-gold-main/20' 
        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5'}
    `;
  };

  const themes: { id: ThemeMode; name: string; color: string }[] = [
    { id: 'royal', name: 'ذهبي', color: '#b8860b' },
    { id: 'sapphire', name: 'ياقوتي', color: '#1e40af' },
    { id: 'emerald', name: 'زمردي', color: '#065f46' },
    { id: 'ruby', name: 'عقيقي', color: '#991b1b' },
    { id: 'midnight', name: 'ليلي', color: '#334155' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-[100] lg:hidden w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gold-main/20 flex items-center justify-center text-gold-main"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside className={`fixed lg:relative z-[90] w-[280px] lg:w-[320px] h-[calc(100dvh-2rem)] m-4 flex flex-col p-6 lg:p-8 transition-all duration-700 rounded-[2rem] lg:rounded-[2.5rem] 
        ${isDarkMode ? 'bg-[#0f172a]/80 border-white/5' : 'bg-white/80 border-slate-200/60'} 
        backdrop-blur-3xl border shadow-2xl
        ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[150%] lg:translate-x-0 opacity-0 lg:opacity-100'}
      `}>
        
        {/* Brand & Logo */}
        <div className="flex flex-col items-center mb-10 shrink-0">
          <div className="relative mb-5 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="absolute -inset-4 royal-gold-gradient rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-14 h-14 royal-gold-gradient rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
              <LogoIcon size={28} color="white" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <h1 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              الخيرات <span className="gold-text">الذكية</span>
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold-main/10 border border-gold-main/20 animate-fade-in">
               <Award size={10} className="text-gold-main" />
               <p className="text-[9px] font-black text-gold-main uppercase tracking-widest">منصة الترقيات ❤️🙏</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-4 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-main/40" />
            الخدمات
          </div>
          
          <nav className="space-y-2 custom-scrollbar overflow-y-auto pr-1">
            <button 
              onClick={() => { onPageChange(PageType.RECOMMENDATION); setIsOpen(false); }} 
              className={getButtonClass(PageType.RECOMMENDATION)}
            >
              <div className={`p-2 rounded-xl transition-all duration-500 ${currentPage === PageType.RECOMMENDATION ? 'bg-gold-main text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <FileSpreadsheet size={16} />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[13px] font-bold">التوصيات</span>
                <span className="text-[8px] opacity-60 font-medium">الترقية والترفيع</span>
              </div>
              {currentPage === PageType.RECOMMENDATION && (
                <div className="mr-auto w-1 h-5 rounded-full bg-gold-main animate-pulse" />
              )}
            </button>

            <button 
              onClick={() => { onPageChange(PageType.DELETION_CREATION); setIsOpen(false); }} 
              className={getButtonClass(PageType.DELETION_CREATION)}
            >
              <div className={`p-2 rounded-xl transition-all duration-500 ${currentPage === PageType.DELETION_CREATION ? 'bg-gold-main text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Trash2 size={16} />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[13px] font-bold">الحذف والاستحداث</span>
                <span className="text-[8px] opacity-60 font-medium">إدارة الملاك</span>
              </div>
              {currentPage === PageType.DELETION_CREATION && (
                <div className="mr-auto w-1 h-5 rounded-full bg-gold-main animate-pulse" />
              )}
            </button>
          </nav>
        </div>

        {/* Footer Settings */}
        <div className="mt-auto pt-6 border-t border-slate-200/50 dark:border-white/5 space-y-4">
          
          <div className="grid grid-cols-2 gap-2.5">
            <button 
              onClick={() => setShowThemePanel(!showThemePanel)} 
              className={`h-11 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 ${
                showThemePanel 
                ? 'bg-gold-main text-white shadow-lg scale-105' 
                : 'bg-white/50 dark:bg-white/5 text-slate-500 hover:bg-white'
              }`}
            >
              <Palette size={16} />
              <span className="text-[9px] font-black">السمات</span>
            </button>
            
            <button 
              onClick={toggleTheme} 
              className="h-11 rounded-xl bg-white/50 dark:bg-white/5 text-slate-500 hover:bg-white transition-all duration-500 flex items-center justify-center gap-2"
            >
              {isDarkMode ? <Sun size={16} /> : <MoonStar size={16} />}
              <span className="text-[9px] font-black">{isDarkMode ? 'نهاري' : 'ليلي'}</span>
            </button>
          </div>

          {/* Theme Selector Panel */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden rounded-xl ${showThemePanel ? 'h-12 opacity-100 bg-white/40 dark:bg-black/20 mb-2' : 'h-0 opacity-0 mb-0'}`}>
            <div className="flex justify-center items-center gap-3 h-full px-2">
              {themes.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => onThemeChange(t.id)}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${currentTheme === t.id ? 'border-white ring-2 ring-gold-main/40 scale-125' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  style={{ backgroundColor: t.color }}
                />
              ))}
            </div>
          </div>

          {/* Identity Card - Simplified for responsiveness */}
          <div className="p-3 rounded-2xl flex items-center gap-3 bg-white/80 dark:bg-white/5 shadow-sm border border-transparent hover:border-gold-main/30 transition-all duration-500 group">
            <div className="w-9 h-9 rounded-xl royal-gold-gradient flex items-center justify-center text-white font-black text-[10px] shadow-md group-hover:rotate-6 transition-transform shrink-0">MA</div>
            <div className="flex-1 min-w-0 text-right">
              <h4 className="text-[10px] font-black truncate text-slate-800 dark:text-white">مناف عباس</h4>
              <p className="text-[8px] text-gold-main font-black uppercase tracking-widest opacity-70">مسؤول النظام</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] lg:hidden animate-fade-in"
        />
      )}
    </>
  );
};

export default Sidebar;
