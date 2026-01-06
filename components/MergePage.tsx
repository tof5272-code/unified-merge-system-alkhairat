
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, Loader2, X, Trash2, Plus, 
  Users, Eye, Table as TableIcon,
  Sparkles, Wand2, CheckCircle2, AlertCircle, Scan, ShieldCheck, Save, FileCode,
  AlertTriangle, CreditCard, LayoutDashboard, UserPlus, Copy, Check, Info, Search,
  Clock, UserCog, User, Briefcase, Hash, MoreVertical, Award, Fingerprint,
  LayoutGrid
} from 'lucide-react';
import { FileEntry, MergeConfig, CommitteeMember } from '../types';
import { mergeExcelFiles, extractTextForAI, getFilePreviewData, PreviewCell, normalizeArabic } from '../services/excelService';

interface FileWithVerification extends FileEntry {
  size: string;
  verificationStatus?: 'pending' | 'scanning' | 'clean' | 'detected' | 'error';
  foundCount?: number;
  totalCommitteeCount?: number;
}

interface MergePageProps {
  config: MergeConfig;
  isDarkMode?: boolean;
  files: FileWithVerification[];
  onFilesChange: (files: FileWithVerification[]) => void;
  committeeMembers: CommitteeMember[];
  onCommitteeChange: (members: CommitteeMember[]) => void;
}

const MergePage: React.FC<MergePageProps> = ({ 
  config, isDarkMode, files, onFilesChange, committeeMembers, onCommitteeChange
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMergedSuccessfully, setIsMergedSuccessfully] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('نظام الخيرات جاهز');
  const [previewData, setPreviewData] = useState<PreviewCell[][] | null>(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewSearchTerm, setPreviewSearchTerm] = useState('');
  
  const [duplicateAlert, setDuplicateAlert] = useState<{
    isOpen: boolean;
    files: File[];
    uniques: File[];
  }>({ isOpen: false, files: [], uniques: [] });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMergedSuccessfully) {
      const timer = setTimeout(() => setIsMergedSuccessfully(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isMergedSuccessfully]);

  const processFiles = (selectedFiles: File[]) => {
    const newFiles: FileWithVerification[] = selectedFiles.map(f => ({
      id: Math.random().toString(36).substring(2, 11) + Date.now(),
      name: f.name,
      file: f,
      status: 'جاهز',
      size: (f.size / 1024).toFixed(1) + ' KB',
      verificationStatus: 'pending'
    }));
    onFilesChange([...files, ...newFiles]);
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files) as File[];
    const existingNames = new Set(files.map(f => f.name));
    const duplicates = selectedFiles.filter(f => existingNames.has(f.name));
    const uniques = selectedFiles.filter(f => !existingNames.has(f.name));

    if (duplicates.length > 0) {
      setDuplicateAlert({ isOpen: true, files: duplicates, uniques });
    } else {
      processFiles(selectedFiles);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resolveDuplicates = (action: 'keep' | 'skip') => {
    const { files: dupes, uniques } = duplicateAlert;
    if (action === 'keep') processFiles([...uniques, ...dupes]);
    else processFiles(uniques);
    setDuplicateAlert({ isOpen: false, files: [], uniques: [] });
  };

  const verifyFilesLocally = async () => {
    if (files.length === 0) return;
    setIsVerifying(true);
    setStatusText('جاري فحص التواقيع رقمياً...');
    
    const normalizedCommittee = committeeMembers.map(m => normalizeArabic(m.name)).filter(name => name.length > 2);
    let currentFiles = [...files];

    for (let i = 0; i < currentFiles.length; i++) {
      currentFiles[i] = { ...currentFiles[i], verificationStatus: 'scanning' };
      onFilesChange([...currentFiles]);
      
      try {
        await new Promise(r => setTimeout(r, 150));
        const rawText = await extractTextForAI(currentFiles[i].file);
        const normalizedText = normalizeArabic(rawText);
        const foundNames = normalizedCommittee.filter(name => normalizedText.includes(name));
        
        let finalStatus: 'clean' | 'detected' | 'error' = 'error';
        if (foundNames.length === normalizedCommittee.length) {
          finalStatus = 'clean';
        } else if (foundNames.length > 0) {
          finalStatus = 'detected';
        }

        currentFiles[i] = { 
          ...currentFiles[i], 
          verificationStatus: finalStatus,
          foundCount: foundNames.length,
          totalCommitteeCount: normalizedCommittee.length
        };
      } catch (err) {
        currentFiles[i] = { ...currentFiles[i], verificationStatus: 'error' };
      }
      onFilesChange([...currentFiles]);
    }
    
    setIsVerifying(false);
    setStatusText('اكتمل التدقيق الفني');
  };

  const handleStartMerge = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setIsMergedSuccessfully(false);
    setStatusText('جاري المعالجة الملكية...');
    try {
      const { blob, suggestedFileName } = await mergeExcelFiles(
        files.map(f => f.file), config.keyword, config.startRow, committeeMembers, setProgress, setStatusText
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = suggestedFileName;
      link.click();
      setStatusText('تم الدمج بنجاح');
      setIsMergedSuccessfully(true);
    } catch (e) { 
      setStatusText('فشلت العملية'); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handlePreview = async (file: File) => {
    setIsPreviewLoading(true);
    setPreviewFileName(file.name);
    setPreviewSearchTerm('');
    try {
      const data = await getFilePreviewData(file);
      setPreviewData(data);
    } catch (e) { 
      console.error("Preview error:", e);
      alert("فشل في تحميل معاينة الملف. قد يكون الملف تالفاً أو بتنسيق غير مدعوم.");
    } finally { 
      setIsPreviewLoading(false); 
    }
  };

  const filteredPreviewData = useMemo(() => {
    if (!previewData || !previewSearchTerm.trim()) return previewData;
    const term = normalizeArabic(previewSearchTerm);
    return previewData.filter(row => 
      row.some(cell => normalizeArabic(cell.value?.toString() || '').includes(term))
    );
  }, [previewData, previewSearchTerm]);

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden relative tech-grid transition-all duration-700 ${isDarkMode ? 'dark bg-[#020617]' : 'bg-slate-50'}`}>
      
      {/* Header Container - Dynamic Sizing */}
      <header className={`px-4 sm:px-6 lg:px-10 py-6 lg:py-8 z-40 shrink-0 transition-all ${isDarkMode ? 'bg-[#0f172a]/20' : 'bg-white/40'}`}>
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
          <div className="flex items-center gap-4 lg:gap-8 w-full lg:w-auto animate-fade-in">
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl lg:rounded-[1.8rem] royal-gold-gradient flex items-center justify-center text-white shadow-2xl shrink-0 group hover:rotate-6 transition-transform">
              <ShieldCheck size={28} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-xl lg:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>{config.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold mt-2 uppercase tracking-widest opacity-60">
                 <span className="text-gold-main flex items-center gap-1.5"><Sparkles size={14} /> {files.length} ملفات</span>
                 <div className="w-1 h-1 rounded-full bg-slate-400" />
                 <span>V7.0 Engine</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto animate-fade-in">
             <button 
               onClick={() => setIsCommitteeModalOpen(true)} 
               className="p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-white dark:bg-white/5 text-gold-main shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-gold-main/20"
             >
                <Users size={20} />
             </button>
             <button 
               onClick={verifyFilesLocally} 
               disabled={isVerifying || files.length === 0} 
               className={`px-5 lg:px-8 py-4 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[11px] lg:text-xs flex items-center gap-2 lg:gap-3 transition-all shadow-sm ${isVerifying ? 'bg-blue-600 text-white animate-pulse' : 'bg-white dark:bg-white/5 text-gold-main hover:bg-gold-main hover:text-white'}`}
             >
               {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <Scan size={16} />}
               <span>تدقيق</span>
             </button>
             <button onClick={() => fileInputRef.current?.click()} className="flex-1 lg:flex-none px-8 lg:px-12 py-4 lg:py-5 royal-gold-gradient text-white rounded-xl lg:rounded-2xl font-black text-xs lg:text-sm flex items-center justify-center gap-3 lg:gap-4 shadow-xl hover:scale-105 transition-all">
               <Plus size={20} /> رفع سجلات
             </button>
             <input type="file" multiple accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleAddFiles} />
          </div>
        </div>
      </header>

      {/* Main Grid View - Dynamic Spacing */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] opacity-10 animate-fade-in">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2.5rem] lg:rounded-[4rem] bg-slate-200 dark:bg-white/5 flex items-center justify-center mb-8">
                <LayoutGrid size={48} className="text-slate-400" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-black">انتظار البيانات...</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className={`group relative glass-card p-6 lg:p-8 flex flex-col transition-all duration-700 border-2 border-transparent
                  ${isMergedSuccessfully ? 'animate-success-glow' : 'hover:shadow-2xl hover:border-gold-main/20 hover:-translate-y-1.5'}
                  ${file.verificationStatus === 'clean' ? 'ring-2 ring-emerald-500/20' : 
                    file.verificationStatus === 'detected' ? 'ring-2 ring-amber-500/20' :
                    file.verificationStatus === 'error' ? 'ring-2 ring-rose-500/20' : ''}`}
                >
                  <div className="flex items-start gap-4 lg:gap-6 mb-6 lg:mb-8">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1.5rem] lg:rounded-[2rem] bg-gold-main/5 flex items-center justify-center text-gold-main shrink-0 group-hover:bg-gold-main group-hover:text-white transition-all duration-500 shadow-inner">
                      <FileCode size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                         <h4 className={`text-[15px] lg:text-lg font-black leading-tight break-words ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                           {file.name}
                         </h4>
                         <button onClick={() => onFilesChange(files.filter(f => f.id !== file.id))} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0 p-1">
                           <X size={20} />
                         </button>
                      </div>
                      <div className="flex items-center gap-2 lg:gap-3 mt-2 lg:mt-3">
                         <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">{file.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                     <div className={`px-4 lg:px-6 py-4 lg:py-5 rounded-2xl flex items-center justify-between text-[10px] lg:text-[11px] font-black transition-all ${
                       file.verificationStatus === 'clean' ? 'bg-emerald-500/10 text-emerald-500' :
                       file.verificationStatus === 'scanning' ? 'bg-blue-500/10 text-blue-500 animate-pulse' :
                       file.verificationStatus === 'detected' ? 'bg-amber-500/10 text-amber-500' :
                       file.verificationStatus === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                     }`}>
                        <div className="flex items-center gap-3">
                          {file.verificationStatus === 'scanning' ? <Loader2 size={16} className="animate-spin" /> : 
                           file.verificationStatus === 'clean' ? <CheckCircle2 size={16} /> : 
                           file.verificationStatus === 'detected' ? <AlertTriangle size={16} /> :
                           file.verificationStatus === 'error' ? <AlertCircle size={16} /> : <Clock size={16} />}
                          <span className="truncate">
                            {file.verificationStatus === 'clean' ? 'مكتمل' : 
                             file.verificationStatus === 'scanning' ? 'جاري الفحص...' : 
                             file.verificationStatus === 'detected' ? `جزئي (${file.foundCount})` :
                             file.verificationStatus === 'error' ? 'تنبيه' : 'بانتظار التدقيق'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handlePreview(file.file)} 
                          className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-gold-main hover:bg-gold-main hover:text-white transition-all shadow-sm"
                        >
                          <Eye size={18} />
                        </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Control Bar - Floating Design (Dynamic Height) */}
      {files.length > 0 && (
        <div className="p-4 sm:p-6 lg:p-10 pt-0 shrink-0 animate-fade-in">
           <div className={`max-w-[1400px] mx-auto glass-card p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-14 shadow-2xl relative overflow-hidden transition-all duration-1000 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
              <div className="flex-1 w-full">
                 <div className="flex justify-between items-center text-[10px] lg:text-[12px] font-black mb-4 lg:mb-6 uppercase tracking-[0.2em] text-gold-main">
                    <span className="flex items-center gap-3"><Sparkles size={18} className="animate-pulse" /> {statusText}</span>
                    <span>{progress}%</span>
                 </div>
                 <div className="h-3 lg:h-4 bg-slate-100 dark:bg-black/20 rounded-full overflow-hidden p-1 shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) shadow-[0_0_20px_var(--accent-glow)]" 
                      style={{ width: `${progress}%`, background: 'var(--royal-grad)' }} 
                    />
                 </div>
              </div>
              <div className="flex items-center gap-4 w-full lg:w-auto shrink-0">
                 <button onClick={() => onFilesChange([])} className="px-6 lg:px-10 py-4 lg:py-6 rounded-2xl lg:rounded-[1.8rem] bg-slate-100 dark:bg-white/5 text-slate-500 font-bold text-xs lg:text-sm hover:text-rose-600 transition-all">تصفير</button>
                 <button onClick={handleStartMerge} disabled={isProcessing} className="flex-1 lg:flex-none px-10 lg:px-20 py-4 lg:py-6 royal-gold-gradient text-white rounded-2xl lg:rounded-[1.8rem] font-black text-sm lg:text-lg flex items-center justify-center gap-4 lg:gap-6 shadow-xl hover:scale-[1.03] transition-all disabled:opacity-50">
                    {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                    <span>تنفيذ الدمج</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Preview Loading Overlay */}
      {isPreviewLoading && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white animate-fade-in">
           <div className="w-20 h-20 rounded-full border-4 border-gold-main/20 border-t-gold-main animate-spin mb-6" />
           <p className="text-lg font-black tracking-widest uppercase">جاري تحليل البيانات...</p>
        </div>
      )}

      {/* Preview Modal - Responsive & Functional */}
      {previewData && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-2 sm:p-6 lg:p-10 bg-[#020617]/95 backdrop-blur-3xl animate-fade-in">
           <div className={`w-full h-full max-h-[95dvh] flex flex-col overflow-hidden shadow-2xl rounded-2xl sm:rounded-[2.5rem] border border-white/5 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
              <div className="p-4 sm:p-8 border-b border-white/5 flex flex-col md:flex-row gap-4 sm:gap-8 items-center justify-between shrink-0">
                 <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full md:w-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl royal-gold-gradient flex items-center justify-center text-white shadow-xl shrink-0">
                       <TableIcon size={24} />
                    </div>
                    <div className="text-right truncate flex-1">
                      <h3 className={`text-lg sm:text-2xl font-black truncate max-w-xs sm:max-w-md ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{previewFileName}</h3>
                    </div>
                 </div>

                 <div className="relative flex-1 w-full max-w-xl group">
                    <Search size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-main transition-colors" />
                    <input 
                      type="text" 
                      placeholder="ابحث في السجل..." 
                      value={previewSearchTerm}
                      onChange={(e) => setPreviewSearchTerm(e.target.value)}
                      className={`w-full py-4 pr-14 pl-6 rounded-2xl border-none font-bold outline-none shadow-inner transition-all text-right text-sm ${
                        isDarkMode ? 'bg-black/20 text-white focus:bg-black/40' : 'bg-slate-100 text-slate-800 focus:bg-white'
                      }`}
                    />
                 </div>

                 <button onClick={() => setPreviewData(null)} className="p-4 rounded-xl bg-rose-600/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shrink-0">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-auto p-2 sm:p-8 custom-scrollbar">
                <div className={`inline-block min-w-full rounded-xl sm:rounded-[2rem] overflow-hidden shadow-xl border ${isDarkMode ? 'bg-black/10 border-white/10' : 'bg-white border-slate-200'}`}>
                  <table className="border-collapse w-full text-right text-[11px] sm:text-[13px]">
                    <thead className="sticky top-0 z-20">
                      <tr className={`${isDarkMode ? 'bg-[#1e293b]' : 'bg-slate-100'}`}>
                        <th className={`w-12 p-3 sm:p-5 text-center font-black text-gold-main border-b border-l ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>#</th>
                        {filteredPreviewData[0]?.map((_, idx) => (
                           <th key={idx} className={`p-3 sm:p-5 text-slate-400 font-black uppercase tracking-tighter border-b border-l ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>C{idx + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPreviewData.map((row, rIdx) => (
                        <tr key={rIdx} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5 border-white/5' : 'hover:bg-slate-50 border-slate-100'} border-b`}>
                          <td className={`w-12 font-black p-3 text-center sticky right-0 z-10 ${isDarkMode ? 'bg-[#0f172a] text-gold-main' : 'bg-slate-50 text-slate-500'}`}>{rIdx + 1}</td>
                          {row.map((cell, cIdx) => cell.isMaster ? (
                            <td 
                              key={cIdx} 
                              rowSpan={cell.rowSpan} 
                              colSpan={cell.colSpan} 
                              className={`p-3 sm:p-5 min-w-[120px] max-w-[400px] whitespace-pre-wrap break-words leading-relaxed border-l ${isDarkMode ? 'text-slate-300 border-white/10' : 'text-slate-700 border-slate-200'}`} 
                              style={{ 
                                textAlign: cell.style?.alignment?.horizontal || 'right', 
                                fontWeight: cell.style?.font?.bold ? 'bold' : 'normal'
                              }}
                            > 
                              {cell.value} 
                            </td>
                          ) : null)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPreviewData.length === 0 && (
                    <div className="p-16 text-center text-slate-400 font-bold">لا توجد بيانات مطابقة لعملية البحث</div>
                  )}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Duplicate Alert Overlay */}
      {duplicateAlert.isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className={`w-full max-w-md glass-card p-10 text-center shadow-2xl ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
             <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-8 mx-auto">
                <AlertTriangle size={40} />
             </div>
             <h3 className="text-2xl font-black mb-3">ملفات مكررة</h3>
             <p className="text-xs font-bold text-slate-500 mb-8 leading-relaxed">اكتشفنا {duplicateAlert.files.length} ملفات موجودة بالفعل في القائمة الحالية.</p>
             <div className="flex flex-col gap-3">
                <button onClick={() => resolveDuplicates('keep')} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg">إضافة مع التكرار</button>
                <button onClick={() => resolveDuplicates('skip')} className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black">تجاهل المكرر</button>
             </div>
          </div>
        </div>
      )}

      {/* Committee Modal - Responsive Design */}
      {isCommitteeModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-[#020617]/95 backdrop-blur-2xl animate-fade-in">
          <div className={`w-full max-w-6xl glass-card flex flex-col max-h-[92dvh] shadow-2xl border border-white/5 overflow-hidden ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
             <div className="p-6 lg:p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 rounded-2xl royal-gold-gradient flex items-center justify-center text-white shadow-xl">
                      <Users size={28} />
                   </div>
                   <div className="text-right">
                      <h3 className={`text-xl lg:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>هيكلية اللجنة</h3>
                      <p className="text-[10px] lg:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">تخصيص الهوية الوظيفية والتواقيع</p>
                   </div>
                </div>
                <button onClick={() => setIsCommitteeModalOpen(false)} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                   <X size={24} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                   {committeeMembers.map((member) => (
                      <div 
                        key={member.id} 
                        className={`group relative p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] transition-all duration-500 border-2 border-transparent flex flex-col gap-6 lg:gap-10 hover:shadow-xl ${
                          isDarkMode ? 'bg-black/30 hover:bg-black/40' : 'bg-slate-50 hover:bg-white'
                        }`}
                      >
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-gold-main/10 text-gold-main flex items-center justify-center">
                                  <Award size={20} />
                               </div>
                               <span className="text-[10px] font-black text-gold-main uppercase tracking-widest">{member.role}</span>
                            </div>
                            <button 
                              onClick={() => onCommitteeChange(committeeMembers.filter(m => m.id !== member.id))} 
                              className="w-10 h-10 rounded-xl bg-rose-500/5 text-rose-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-rose-500 hover:text-white"
                            >
                              <Trash2 size={16} />
                            </button>
                         </div>

                         <div className="space-y-4 relative z-10">
                            <div className="relative group/input">
                               <User size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-gold-main transition-colors" />
                               <input 
                                 type="text" 
                                 placeholder="الاسم الكامل الرباعي..."
                                 value={member.name} 
                                 onChange={(e) => onCommitteeChange(committeeMembers.map(m => m.id === member.id ? {...m, name: e.target.value} : m))}
                                 className={`w-full bg-white/5 rounded-2xl pr-14 pl-5 py-4 lg:py-5 text-[14px] lg:text-[16px] font-black border-2 border-transparent focus:border-gold-main/30 outline-none text-right transition-all shadow-inner ${
                                   isDarkMode ? 'text-white' : 'text-slate-800'
                                 }`}
                               />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                               <div className="relative group/input">
                                  <Briefcase size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-gold-main" />
                                  <input 
                                    type="text" 
                                    placeholder="العنوان"
                                    value={member.role} 
                                    onChange={(e) => onCommitteeChange(committeeMembers.map(m => m.id === member.id ? {...m, role: e.target.value} : m))}
                                    className={`w-full bg-white/5 rounded-2xl pr-10 pl-3 py-3 lg:py-4 text-[11px] font-bold border-2 border-transparent focus:border-gold-main/30 outline-none text-right transition-all shadow-inner ${
                                      isDarkMode ? 'text-white' : 'text-slate-800'
                                    }`}
                                  />
                               </div>
                               <div className="relative group/input">
                                  <Hash size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-gold-main" />
                                  <input 
                                    type="number"
                                    placeholder="العمود"
                                    value={member.col}
                                    onChange={(e) => onCommitteeChange(committeeMembers.map(m => m.id === member.id ? {...m, col: parseInt(e.target.value) || 1} : m))}
                                    className={`w-full bg-white/5 rounded-2xl pr-10 pl-3 py-3 lg:py-4 text-[12px] font-black text-gold-main border-2 border-transparent focus:border-gold-main/30 outline-none text-center transition-all shadow-inner ${
                                      isDarkMode ? 'text-white' : 'text-slate-800'
                                    }`}
                                  />
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                   
                   <button 
                     onClick={() => onCommitteeChange([...committeeMembers, { id: Math.random().toString(36).substring(2,9), name: '', role: 'عضو جديد', col: 2, rowOffset: 0 }])} 
                     className="min-h-[250px] lg:min-h-[300px] rounded-[2.5rem] lg:rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-5 text-slate-400 hover:border-gold-main hover:text-gold-main transition-all group hover:bg-gold-main/5"
                   >
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gold-main group-hover:text-white transition-all shadow-sm">
                        <UserPlus size={32} />
                      </div>
                      <span className="text-[11px] lg:text-sm font-black uppercase tracking-[0.2em]">إضافة عضو جديد</span>
                   </button>
                </div>
             </div>

             <div className="p-6 lg:p-12 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6 bg-white/5">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                   <Info size={18} className="text-gold-main" />
                   يتم حفظ وتطبيق التعديلات فور الاعتماد
                </div>
                <button 
                  onClick={() => setIsCommitteeModalOpen(false)} 
                  className="w-full lg:w-auto px-16 lg:px-24 py-5 lg:py-7 royal-gold-gradient text-white rounded-[2rem] lg:rounded-[3rem] font-black text-base lg:text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 lg:gap-6"
                >
                  <Save size={24} />
                  <span>اعتماد وحفظ</span>
                </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes success-glow {
          0%, 100% { 
            box-shadow: 0 0 0px transparent;
            border-color: transparent;
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 50px var(--accent-glow);
            border-color: var(--accent-color);
            transform: scale(1.02) translateY(-5px);
          }
        }
        .animate-success-glow {
          animation: success-glow 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--accent-color);
          border-radius: 10px;
          opacity: 0.5;
        }

        @media (max-width: 1024px) {
          .tech-grid {
            background-size: 20px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default MergePage;
