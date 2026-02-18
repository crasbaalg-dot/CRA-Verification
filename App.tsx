
import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Html5Qrcode } from 'html5-qrcode';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Languages, Search, QrCode, ArrowRight, Check, X, SearchX, RefreshCcw, FileDown } from 'lucide-react';
import { Lang, CertificateData, SearchStatus } from './types';
import { TRANSLATIONS, LOGO_URL, SHEET_CSV_URL } from './constants';

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>('ar');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'scan'>('manual');
  const [inputCode, setInputCode] = useState('');
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [statusType, setStatusType] = useState<'valid' | 'expired'>('valid');
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const certificateRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanData = results.data.map((row: any) => {
          const newRow: any = { _original: row };
          Object.keys(row).forEach(key => newRow[key.trim().toLowerCase()] = row[key]);
          return newRow;
        });
        setDataList(cleanData);
        setLoading(false);
      },
      error: () => {
        setLoading(false);
      }
    });
  }, []);

  const handleLangSwitch = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const newLang = lang === 'ar' ? 'fr' : 'ar';
      setLang(newLang);
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    }, 600);
    setTimeout(() => setIsTransitioning(false), 1200);
  };

  const normalizeDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    return null;
  };

  const handleSearch = (codeToSearch: string) => {
    if (!codeToSearch) return;
    setSearchStatus('loading');
    const query = codeToSearch.trim().toLowerCase();
    setInputCode(codeToSearch);

    const found = dataList.find(row => 
      Object.values(row).some(val => val && val.toString().toLowerCase().trim() === query)
    );

    if (found) {
      const original = found._original;
      setCertificateData(original);
      let expiryDate: Date | null = null;
      const expiryKeys = Object.keys(original).filter(k => 
        k.toLowerCase().includes('expiry') || k.toLowerCase().includes('valid') || k.includes('انتهاء') || k.includes('صلاحية')
      );
      if (expiryKeys.length > 0) expiryDate = normalizeDate(original[expiryKeys[0]]);
      setStatusType(expiryDate && new Date() > expiryDate ? 'expired' : 'valid');
      setSearchStatus('found');
    } else {
      setSearchStatus('not_found');
    }
  };

  const resetSearch = () => {
    setSearchStatus('idle');
    setInputCode('');
    setCertificateData(null);
    setActiveTab('manual');
  };

  const downloadAsPDF = async () => {
    if (!certificateRef.current) return;
    setIsGeneratingPDF(true);
    certificateRef.current.classList.add('pdf-mode');

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ARC-Verification-${inputCode}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
    } finally {
      certificateRef.current.classList.remove('pdf-mode');
      setIsGeneratingPDF(false);
    }
  };

  const Scanner: React.FC = () => {
    useEffect(() => {
      const scanner = new Html5Qrcode("reader");
      const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
      
      scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          scanner.stop().then(() => {
            scanner.clear();
            handleSearch(decodedText);
          }).catch(() => handleSearch(decodedText));
        },
        () => {}
      ).catch(console.error);

      return () => {
        if (scanner.isScanning) {
          scanner.stop().then(() => scanner.clear()).catch(console.error);
        }
      };
    }, []);

    return (
      <div className="flex flex-col items-center w-full animate-[fadeIn_0.5s_ease-out]">
        <div className="relative w-full max-w-sm aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
          <div id="reader" className="w-full h-full"></div>
        </div>
        <p className="mt-4 text-gray-500 font-medium">{t.scanInstruction}</p>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <span className="custom-loader mb-4"></span>
      <p className="text-gray-500 font-medium animate-pulse">{t.loadingData}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Language Transition Overlay */}
      <div className={`fixed inset-0 bg-[#ce1126] z-[9999] flex items-center justify-center transition-transform duration-600 ease-[cubic-bezier(0.83,0,0.17,1)] ${isTransitioning ? 'scale-y-100 origin-top' : 'scale-y-0 origin-bottom'}`}>
        <img src={LOGO_URL} className={`h-24 w-auto filter brightness-0 invert transition-opacity duration-300 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`} alt="Logo" />
      </div>

      <header className="glass-card sticky top-4 z-40 mx-2 sm:mx-4 mt-4 rounded-2xl shadow-sm px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <img src={LOGO_URL} alt="Logo" className="h-8 sm:h-12 w-auto flex-shrink-0 drop-shadow-sm" crossOrigin="anonymous" />
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-gray-800 leading-tight truncate">{t.title}</h1>
            <p className="text-[9px] sm:text-xs text-gray-500 font-medium truncate">{t.subtitle}</p>
          </div>
        </div>
        <button 
          onClick={handleLangSwitch}
          disabled={isTransitioning}
          className="group relative flex-shrink-0 overflow-hidden px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-gray-200 bg-white/50 text-xs sm:text-sm font-bold text-gray-700 hover:text-white transition-all duration-300 shadow-sm ml-2"
        >
          <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
            <Languages size={14} className="sm:w-4 sm:h-4" /> {t.langName}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-2xl relative z-10">
        {searchStatus === 'idle' || searchStatus === 'loading' ? (
          <div className="animate-[scaleIn_0.3s_ease-out_forwards]">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">{t.platformName}</h2>
              <p className="text-gray-500 font-medium opacity-80">{t.subtitle}</p>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden shadow-xl border-0">
              <div className="flex p-2 bg-gray-100/50 gap-2">
                <button onClick={() => setActiveTab('manual')} className={`flex-1 py-3 rounded-xl text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'bg-white text-red-600 shadow-md' : 'text-gray-500 hover:bg-gray-200/50'}`}>
                  <Search size={18} /> {t.searchTab}
                </button>
                <button onClick={() => setActiveTab('scan')} className={`flex-1 py-3 rounded-xl text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'scan' ? 'bg-white text-red-600 shadow-md' : 'text-gray-500 hover:bg-gray-200/50'}`}>
                  <QrCode size={18} /> {t.scanTab}
                </button>
              </div>

              <div className="p-6 md:p-8 min-h-[300px] flex flex-col justify-center">
                {activeTab === 'manual' ? (
                  <div className="animate-[fadeIn_0.5s_ease-out]">
                    <p className="text-gray-500 text-center mb-6 font-medium">{t.manualInstruction}</p>
                    <input 
                      type="text" 
                      value={inputCode} 
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder={t.inputPlaceholder}
                      className="w-full px-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-500/30 transition-all text-lg text-center font-black text-black outline-none mb-6"
                    />
                    <button 
                      onClick={() => handleSearch(inputCode)}
                      disabled={searchStatus === 'loading'}
                      className="w-full bg-gradient-to-r from-[#ce1126] to-[#a30d1d] hover:to-[#ce1126] text-white font-bold py-5 rounded-2xl shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-3 text-lg disabled:opacity-50"
                    >
                      {searchStatus === 'loading' ? <span className="custom-loader !w-6 !h-6 !border-2"></span> : (
                        <>
                          {t.checkBtn} <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <Scanner />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-[scaleIn_0.3s_ease-out_forwards] space-y-4">
            {searchStatus === 'not_found' ? (
              <div className="glass-card rounded-3xl p-10 text-center border-t-8 border-gray-400">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchX size={48} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.resultNotFound}</h3>
                <button onClick={resetSearch} className="mt-8 px-8 py-3 rounded-xl bg-gray-800 text-white font-bold shadow-lg flex items-center gap-2 mx-auto">
                  <RefreshCcw size={18} /> {t.newSearch}
                </button>
              </div>
            ) : (
              <>
                <div ref={certificateRef} className="bg-white rounded-3xl overflow-hidden shadow-2xl border-t-8 border-red-600 relative">
                  {/* Watermark Logo */}
                  <div className="hidden pdf-watermark-container absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 opacity-5 pointer-events-none z-0">
                    <img src={LOGO_URL} alt="Watermark" className="w-full h-auto" crossOrigin="anonymous" />
                  </div>

                  <div className="pt-8 px-8 flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-3">
                      <img src={LOGO_URL} alt="Logo" className="h-14 w-auto" crossOrigin="anonymous" />
                      <div className="text-right">
                        <h4 className="text-sm font-bold text-gray-800">{t.title}</h4>
                        <p className="text-[10px] text-gray-500">{t.subtitle}</p>
                      </div>
                    </div>
                    <div className="bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{inputCode}</span>
                    </div>
                  </div>

                  <div className={`${statusType === 'valid' ? 'bg-gradient-to-b from-green-50/50 to-white' : 'bg-gradient-to-b from-red-50/50 to-white'} p-8 text-center relative z-10`}>
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg ${statusType === 'valid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {statusType === 'valid' ? <Check size={40} strokeWidth={3} /> : <X size={40} strokeWidth={3} />}
                    </div>
                    <h3 className={`text-2xl font-black ${statusType === 'valid' ? 'text-green-800' : 'text-red-800'}`}>
                      {statusType === 'valid' ? t.resultValid : t.resultExpired}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR', { dateStyle: 'full' })}</p>
                  </div>

                  <div className="px-8 pb-8 relative z-10">
                    {certificateData && (
                      <div className="space-y-6">
                        <div className="text-center pb-4 border-b border-gray-100">
                          <p className="text-sm text-gray-400 mb-1">{t.name}</p>
                          <h3 className="text-2xl font-bold text-gray-800">
                            {certificateData[Object.keys(certificateData).find(k => k.toLowerCase().includes('name') || k.includes('اسم') || k.includes('nom')) || ''] || '---'}
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 bg-gray-50/50 p-4 rounded-xl">
                          {Object.keys(certificateData).map((key, idx) => {
                            const val = certificateData[key];
                            if (!val || key.toLowerCase().includes('name') || key.includes('اسم') || key.includes('nom')) return null;
                            return (
                              <div key={idx} className="flex justify-between items-center group">
                                <span className="text-gray-500 text-sm font-medium">{key}</span>
                                <span className="text-gray-800 font-semibold text-right group-hover:text-red-700 transition-colors">{val}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100 relative z-10">
                    <p className="text-[10px] text-gray-400 font-medium">{t.footer}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={downloadAsPDF}
                    disabled={isGeneratingPDF}
                    className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingPDF ? <span className="custom-loader !w-5 !h-5 !border-2"></span> : <FileDown size={20} />}
                    {t.downloadPDF}
                  </button>
                  
                  <button 
                    onClick={resetSearch}
                    className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold shadow-lg flex justify-center items-center gap-2"
                  >
                    <RefreshCcw size={20} /> {t.newSearch}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="mt-auto py-6 border-t border-white/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm font-medium">{t.footer}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
