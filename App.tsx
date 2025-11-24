import React, { useState } from 'react';
import { LayoutGrid, Map as MapIcon, Table as TableIcon, Search, Settings, FileSpreadsheet, HardDrive, Sparkles, HeartHandshake } from 'lucide-react';
import { MapView } from './components/MapView';
import { TableView } from './components/TableView';
import { GeminiChat } from './components/GeminiChat';
import { INITIAL_ORGANIZATIONS, SHEET_URL, DRIVE_URL } from './constants';
import { Organization, ViewMode } from './types';

const App: React.FC = () => {
  const [organizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Split);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const filteredOrgs = organizations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-teal-200">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-800 leading-none">
              SocialMap <span className="text-teal-600">Інтегратор</span>
            </h1>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mt-1">
              Одеса • Миколаїв • Херсон
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук (назва, послуги, адреса)..."
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
              onClick={() => setViewMode(ViewMode.Grid)}
              className={`p-2 rounded-md transition ${viewMode === ViewMode.Grid ? 'bg-white shadow text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Таблиця"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode(ViewMode.Split)}
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
            <span className="hidden sm:inline">AI Аналітик</span>
          </button>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            title="Налаштування інтеграції"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Conditional Rendering based on View Mode */}
        <div className={`flex-1 flex ${viewMode === ViewMode.Split ? 'flex-col md:flex-row' : 'flex-col'}`}>
          
          {/* Table Section */}
          {(viewMode === ViewMode.Grid || viewMode === ViewMode.Split) && (
            <div className={`${viewMode === ViewMode.Split ? 'h-1/2 md:h-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200' : 'h-full w-full'} transition-all`}>
              <TableView 
                organizations={filteredOrgs} 
                selectedOrgId={selectedOrgId}
                onSelectOrg={setSelectedOrgId}
              />
            </div>
          )}

          {/* Map Section */}
          {(viewMode === ViewMode.Map || viewMode === ViewMode.Split) && (
             <div className={`${viewMode === ViewMode.Split ? 'h-1/2 md:h-full md:w-1/2' : 'h-full w-full'} bg-slate-200 transition-all relative`}>
               <MapView 
                 organizations={filteredOrgs}
                 selectedOrgId={selectedOrgId}
                 onSelectOrg={setSelectedOrgId}
               />
             </div>
          )}

        </div>

        {/* AI Chat Overlay */}
        <GeminiChat 
          organizations={filteredOrgs}
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
        />

      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Інтеграція Даних</h2>
              <p className="text-sm text-slate-500 mt-1">
                Підключені джерела даних для реєстру.
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Google Таблиця (Джерело: Актори, Послуги, Контакти)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly
                    value={SHEET_URL}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none truncate"
                  />
                  <a 
                    href={SHEET_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 transition"
                  >
                    Відкрити
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  Google Drive (Папка документів)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly
                    value={DRIVE_URL}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none truncate"
                  />
                  <a 
                    href={DRIVE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 transition"
                  >
                    Відкрити
                  </a>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-teal-800 mb-2">Статус синхронізації</h4>
                <ul className="text-xs text-teal-700 space-y-1 list-disc list-inside">
                  <li>Регіони: Одеська, Миколаївська, Херсонська</li>
                  <li>Поля: Актори, Послуги, Телефон, Пошта</li>
                  <li>Зв'язок з Drive: Активний</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end border-t border-slate-100">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium text-sm"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;