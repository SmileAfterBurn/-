import React, { useState, useMemo, useEffect } from 'react';
import { LayoutGrid, Map as MapIcon, Table as TableIcon, Search, Sparkles, HeartHandshake, MapPin, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { MapView } from './components/MapView';
import { TableView } from './components/TableView';
import { GeminiChat } from './components/GeminiChat';
import { IntroModal } from './components/IntroModal';
import { INITIAL_ORGANIZATIONS, REGION_CONFIG } from './constants';
import { Organization, ViewMode, RegionName } from './types';

const App: React.FC = () => {
  const [organizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Split);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Sidebar state for Split View
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Region State
  const [activeRegion, setActiveRegion] = useState<RegionName | null>(null);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);

  // Intro/Onboarding State
  const [showIntro, setShowIntro] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Initialization Logic
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hide_intro_annotation');
    if (hasSeenIntro === 'true') {
      setShowIntro(false);
      setIsRegionModalOpen(true);
    } else {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setIsRegionModalOpen(true);
  };

  const handleRegionSelect = (region: RegionName) => {
    setActiveRegion(region);
    setIsRegionModalOpen(false);
    // Reset selection when changing regions
    setSelectedOrgId(null);
  };

  // Derive unique categories for the filter dropdown
  const availableCategories = useMemo(() => 
    Array.from(new Set(organizations.map(o => o.category))).sort(), 
  [organizations]);

  const filteredOrgs = organizations.filter(c => {
    // 1. Filter by Region
    if (activeRegion && c.region !== activeRegion) {
      return false;
    }

    // 2. Filter by Search Term
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 3. Filter by Dropdowns
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    // Priority sorting: "ПОСМІШКА ЮА" always on top
    const priorityPhrase = "ПОСМІШКА ЮА";
    const isPriorityA = a.name.toUpperCase().includes(priorityPhrase);
    const isPriorityB = b.name.toUpperCase().includes(priorityPhrase);

    if (isPriorityA && !isPriorityB) return -1;
    if (!isPriorityA && isPriorityB) return 1;
    return 0;
  });

  const handleOrgSelect = (id: string) => {
    setSelectedOrgId(id);
    if (viewMode === ViewMode.Map) {
      setViewMode(ViewMode.Split);
      setIsSidebarOpen(true); // Ensure sidebar opens when selecting from map
    }
  };

  // Determine Map Center and Zoom with strict validation to prevent NaN errors
  const mapCenter: [number, number] = useMemo(() => {
    if (activeRegion && REGION_CONFIG[activeRegion]) {
      return REGION_CONFIG[activeRegion].center;
    }
    return [46.9750, 31.9946]; // Default safe center (Mykolaiv area)
  }, [activeRegion]);
  
  const mapZoom = useMemo(() => {
    if (activeRegion && REGION_CONFIG[activeRegion]) {
      return REGION_CONFIG[activeRegion].zoom;
    }
    return 8;
  }, [activeRegion]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden relative">
      
      {/* Intro / Annotation Modal (Highest Priority) */}
      {showIntro && (
        <IntroModal onComplete={handleIntroComplete} />
      )}

      {/* Welcome / Region Selection Modal */}
      {isRegionModalOpen && !showIntro && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Вітаю, шановне панство!
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Де саме ви шукаєте допомогу?
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(REGION_CONFIG) as RegionName[]).map((region) => (
                <button
                  key={region}
                  onClick={() => handleRegionSelect(region)}
                  className="group relative p-6 bg-slate-50 border-2 border-slate-100 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200"
                >
                  <MapPin className="w-6 h-6 mx-auto mb-3 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  <span className="font-bold text-slate-700 group-hover:text-teal-800">
                    {REGION_CONFIG[region].label}
                  </span>
                </button>
              ))}
            </div>
            
            <p className="mt-8 text-sm text-slate-400">
              Мапа соціальних послуг: притулки, гуманітарні штаби, волонтерські центри
            </p>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-teal-200">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-800 leading-none">
              Мапа соціальних послуг
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                {activeRegion ? REGION_CONFIG[activeRegion].label : 'Оберіть регіон'}
              </span>
              {activeRegion && (
                <button 
                  onClick={() => setIsRegionModalOpen(true)}
                  className="text-[10px] text-teal-600 hover:text-teal-800 hover:underline font-bold px-1.5 py-0.5 rounded bg-teal-50"
                >
                  ЗМІНИТИ
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук (назва, категорія, адреса, контакти)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="hidden md:flex bg-slate-100 rounded-lg p-1 gap-1 mr-2">
            <button
              onClick={() => { setViewMode(ViewMode.Grid); setIsSidebarOpen(true); }}
              className={`p-2 rounded-md transition ${viewMode === ViewMode.Grid ? 'bg-white shadow text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Таблиця"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setViewMode(ViewMode.Split); setIsSidebarOpen(true); }}
              className={`p-2 rounded-md transition ${viewMode === ViewMode.Split ? 'bg-white shadow text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Розділений вид"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode(ViewMode.Map)}
              className={`p-2 rounded-md transition ${viewMode === ViewMode.Map ? 'bg-white shadow text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Карта"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border ${
                isChatOpen 
                ? 'bg-teal-50 border-teal-200 text-teal-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Помічниця</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Container handling layout logic */}
        <div className={`flex-1 flex ${viewMode === ViewMode.Split ? 'flex-col md:flex-row relative' : 'flex-col'}`}>
          
          {/* Table Section */}
          <div className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${viewMode === ViewMode.Split
               ? (isSidebarOpen ? 'h-1/2 md:h-full w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 opacity-100' : 'h-0 md:h-full w-full md:w-0 border-none opacity-0')
               : (viewMode === ViewMode.Grid ? 'h-full w-full opacity-100' : 'hidden')
            }
          `}>
            {viewMode !== ViewMode.Map && (
              <TableView 
                organizations={filteredOrgs} 
                selectedOrgId={selectedOrgId}
                onSelectOrg={handleOrgSelect}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
                filterCategory={filterCategory}
                onFilterCategoryChange={setFilterCategory}
                availableCategories={availableCategories}
              />
            )}
          </div>

          {/* Map Section */}
          <div className={`
            relative bg-slate-200 transition-all duration-300 ease-in-out
            ${viewMode === ViewMode.Split
               ? (isSidebarOpen ? 'h-1/2 md:h-full w-full md:w-1/2' : 'h-full w-full')
               : (viewMode === ViewMode.Map ? 'h-full w-full' : 'hidden')
            }
          `}>
            {/* Toggle Button for Sidebar (Only in Split View) */}
            {viewMode === ViewMode.Split && (
               <button
                 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                 className={`
                   absolute z-[40] flex items-center justify-center bg-white border border-slate-300 shadow-sm text-slate-500 hover:text-teal-600 hover:bg-slate-50 transition-all focus:outline-none
                   /* Mobile positioning: Top edge, horizontal toggle */
                   left-1/2 -translate-x-1/2 top-0 w-10 h-5 rounded-b-md border-t-0
                   /* Desktop positioning: Left edge, vertical toggle */
                   md:left-0 md:top-1/2 md:-translate-y-1/2 md:w-5 md:h-10 md:rounded-r-md md:rounded-bl-none md:border-l-0
                 `}
                 title={isSidebarOpen ? "Згорнути панель" : "Розгорнути панель"}
               >
                 {/* Icons based on state and screen size (handled via CSS visibility if needed, or JS check) */}
                 <div className="hidden md:block">
                   {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                 </div>
                 <div className="block md:hidden">
                   {isSidebarOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                 </div>
               </button>
            )}

            {viewMode !== ViewMode.Grid && (
               <MapView 
                 organizations={filteredOrgs}
                 selectedOrgId={selectedOrgId}
                 onSelectOrg={handleOrgSelect}
                 center={mapCenter}
                 zoom={mapZoom}
               />
            )}
          </div>

        </div>

        {/* AI Chat Overlay */}
        <GeminiChat 
          organizations={filteredOrgs}
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
        />

      </main>
    </div>
  );
};

export default App;