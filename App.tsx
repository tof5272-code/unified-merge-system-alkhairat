
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MergePage from './components/MergePage';
import WelcomeScreen from './components/WelcomeScreen';
import { PageType, MergeConfig, CommitteeMember, ThemeMode } from './types';

const DEFAULT_COMMITTEE: CommitteeMember[] = [
  { id: '1', role: 'عضو', name: 'علي جبر عباس', col: 2, rowOffset: 0 },
  { id: '2', role: 'عضو', name: 'اياد كاظم جعاطة', col: 5, rowOffset: 0 },
  { id: '3', role: 'عضو', name: 'هاشم عريبي فاضل', col: 8, rowOffset: 0 },
  { id: '4', role: 'عضو', name: 'فراس محمد عباس كاظم', col: 11, rowOffset: 0 },
  { id: '5', role: 'ر. اللجنة', name: 'علاء حسن صالح', col: 14, rowOffset: 0 },
  { id: '6', role: 'عضو', name: 'رجوان ساهر شاكر', col: 2, rowOffset: 3 },
  { id: '7', role: 'عضو', name: 'حمزة عبد حمزة', col: 8, rowOffset: 3 }
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.RECOMMENDATION);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('khairat_dark') === 'true');
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('khairat_theme') as ThemeMode) || 'royal');
  const [showWelcome, setShowWelcome] = useState(true);
  
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(() => {
    const saved = localStorage.getItem('khairat_committee');
    return saved ? JSON.parse(saved) : DEFAULT_COMMITTEE;
  });

  const [filesMap, setFilesMap] = useState<Record<PageType, any[]>>({
    [PageType.RECOMMENDATION]: [],
    [PageType.DELETION_CREATION]: [],
  });

  useEffect(() => {
    localStorage.setItem('khairat_committee', JSON.stringify(committeeMembers));
  }, [committeeMembers]);

  useEffect(() => {
    localStorage.setItem('khairat_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('khairat_dark', isDarkMode.toString());
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const configs: Record<PageType, MergeConfig> = {
    [PageType.RECOMMENDATION]: {
      title: 'محاظر التوصيات',
      keyword: 'توصية',
      startRow: 4,
      allowedPrefixes: ['توصية']
    },
    [PageType.DELETION_CREATION]: {
      title: 'الحذف والاستحداث',
      keyword: 'حذف واستحداث',
      startRow: 2,
      allowedPrefixes: ['حذف', 'استحداث']
    }
  };

  const handleFilesChange = (newFiles: any[]) => {
    setFilesMap(prev => ({ ...prev, [currentPage]: newFiles }));
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={() => setShowWelcome(false)} isDarkMode={isDarkMode} theme={theme} onThemeChange={setTheme} toggleDark={() => setIsDarkMode(!isDarkMode)} />;
  }

  return (
    <div className={`flex flex-col lg:flex-row h-[100dvh] w-full font-['Cairo'] antialiased selection:bg-gold-main/20 ${isDarkMode ? 'dark' : ''} bg-[#f1f5f9] dark:bg-[#020617]`}>
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <MergePage 
          config={configs[currentPage]} 
          isDarkMode={isDarkMode} 
          key={`${currentPage}-${theme}`} 
          files={filesMap[currentPage]}
          onFilesChange={handleFilesChange}
          committeeMembers={committeeMembers}
          onCommitteeChange={setCommitteeMembers}
        />
      </main>
    </div>
  );
};

export default App;
