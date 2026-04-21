import React, { useState } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";

import logoOPC from "./assets/logo.png";
//import fundoVisaoGeral from "./assets/parcel-dos-reis.png";
import fundoAvif from "./assets/fundo.avif";
import LoginPage from "./LoginPage";
import CapexDashboard from "./CapexDashboard";
import PublishSgoPage from "./PublishSgoPage";

import { DataStatusBadge } from "./components/DataStatusBadge";
import { UpdateList } from "./components/UpdateList";
import { HeroRotativo } from "./components/HeroRotativo";
import { PendenciasModal } from "./components/PendenciasModal";
import {
  IconHome, IconDoc, IconBell, IconCheck, IconGear,
  IconUser, IconExit, IconUsers, IconBoat, IconGrid, IconMoney,
} from "./components/icons";

const NAV_TABS = ["Visão Geral", "Obras em Andamento", "Obras Futuras", "Obras Finalizadas"] as const;
type NavTab = typeof NAV_TABS[number];

export default function App() {
  const [updatesTab, setUpdatesTab] = useState("geral");
  const [page, setPage] = useState<"home" | "publish-sgo">("home");
  const [activeTab, setActiveTab] = useState<NavTab>("Visão Geral");
  const [pinned, setPinned] = useState(false);
  const [dataSource, setDataSource] = useState<string | null>(null);

  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const searchParams = new URLSearchParams(window.location.search);
  const isBypass = searchParams.get("bypass") === "true";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPendenciasOpen, setIsPendenciasOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  if (!isAuthenticated && !isBypass) return <LoginPage />;

  return (
    <div className="relative h-screen w-full overflow-hidden font-[var(--font-inter)]" data-theme={theme}>
      {/* 🎯 1. BACKGROUND */}
      <img
        src={theme === 'dark' ? "/background-water.jpg" : fundoAvif}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000"
        alt="Background"
      />
      <div className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-[2px] transition-colors duration-1000" />

      <div className="relative z-10 flex h-full w-full text-[var(--text-main)]">

        {/* OVERLAY MOBILE SIDEBAR */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
          <aside className={`
        fixed inset-y-0 left-0 z-[70] lg:relative lg:z-20
        ${isSidebarOpen ? "w-[240px]" : "w-[0px] lg:w-[80px]"} bg-[var(--sidebar-bg)] flex flex-col justify-between shrink-0 border-r border-[var(--border-nav)]
        transition-all duration-300 transform overflow-visible
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* COLLAPSE/EXPAND BUTTON (High Fidelity) */}
        <button 
          className="absolute -right-3 top-20 w-6 h-10 bg-[var(--sidebar-bg)] border border-[var(--border-nav)] rounded-lg hidden lg:flex items-center justify-center text-[var(--text-nav-dim)] shadow-sm z-50 hover:bg-black/5"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <span className="text-xs transition-transform duration-300" style={{ transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}>‹</span>
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden">
          <div className={`px-6 py-10 mb-2 flex items-center ${isSidebarOpen ? "justify-start" : "justify-center"}`}>
            {isSidebarOpen ? (
              <img src={logoOPC} alt="HUB de OBRAS" className="h-10 object-contain animate-fade-in" />
            ) : (
              <div className="w-10 h-10 bg-[#003D5B] rounded-lg flex items-center justify-center text-white font-bold text-xl">H</div>
            )}
          </div>

          <nav className={`space-y-2 text-[14px] font-medium transition-all ${isSidebarOpen ? "px-4" : "px-3"}`}>
            <button
              className={`w-full flex items-center gap-4 py-3 rounded-lg transition-all duration-300 ${isSidebarOpen ? "px-4" : "justify-center"} ${page === "home" ? "bg-[#003D5B] text-white shadow-md" : "text-[var(--text-nav-dim)] hover:bg-black/5 hover:text-[var(--text-nav)]"}`}
              onClick={() => { setPage("home"); if(!isSidebarOpen) setIsSidebarOpen(true); }}
              title="Início"
            >
              <IconHome className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Início</span>}
            </button>

            <a className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`} href="/financeiro" title="Financeiro">
              <IconMoney className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Financeiro</span>}
            </a>
            
            <a className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`} href="/obras" title="Obras">
              <IconGrid className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Obras</span>}
            </a>

            <div className={`h-px bg-[var(--border-nav)] my-6 opacity-50 ${isSidebarOpen ? "mx-4" : "mx-2"}`} />

            <button
              className={`w-full flex items-center gap-4 py-3 rounded-lg transition-all ${isSidebarOpen ? "px-4" : "justify-center"} ${page === "publish-sgo" ? "bg-[#003D5B] text-white shadow-md" : "text-[var(--text-nav-dim)] hover:bg-black/5 hover:text-[var(--text-nav)]"}`}
              onClick={() => { setPage("publish-sgo"); if(!isSidebarOpen) setIsSidebarOpen(true); }}
              title="Publicar na fila SGO"
            >
              <IconDoc className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in whitespace-nowrap">Publicar na fila SGO</span>}
            </button>

            <button 
              className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all justify-between text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`}
              onClick={() => { setIsPendenciasOpen(true); }}
              title="Pendências"
            >
              <div className="flex items-center gap-4">
                <IconCheck className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Pendências</span>}
              </div>
              {isSidebarOpen && <span className="bg-[#f87171] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-fade-in">2</span>}
            </button>

            <div className={`h-px bg-[var(--border-nav)] my-6 opacity-50 ${isSidebarOpen ? "mx-4" : "mx-2"}`} />

            <button className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`} title="Meu Perfil">
              <IconUser className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Meu Perfil</span>}
            </button>
            <button className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`} onClick={() => instance.logoutRedirect()} title="Sair">
              <IconExit className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Sair</span>}
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[var(--border-nav)] bg-black/[0.02]">
          <div className={`flex items-center gap-3 py-2 ${isSidebarOpen ? "px-2" : "justify-center"}`}>
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-[var(--border-nav)] shadow-sm overflow-hidden shrink-0">
              <img src="https://i.pravatar.cc/100" alt="Junior P. Santos" className="w-full h-full object-cover" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col animate-fade-in">
                <span className="text-[13px] font-bold text-[var(--text-nav)] leading-none">Junior P. Santos</span>
                <span className="text-[11px] text-[var(--text-nav-dim)] mt-1">Financeiro</span>
              </div>
            )}
          </div>
        </div>
      </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col relative h-full min-w-0">
          {/* TOP BAR */}
          <header className="h-14 flex justify-between items-center px-4 md:px-6 shrink-0 border-b border-[var(--border-nav)] bg-[var(--header-bg)] backdrop-blur-md z-30 transition-all">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 bg-[var(--bg-mini-card)] rounded-lg text-[var(--text-nav)]"
                onClick={() => setIsSidebarOpen(true)}
              >
                <IconGrid className="w-5 h-5" />
              </button>
              <button className="hidden sm:flex w-7 h-7 bg-white/5 rounded text-white/40 items-center justify-center hover:bg-white/10 transition-colors">‹</button>
            </div>

            <div className="flex justify-end gap-3 sm:gap-5 items-center text-[var(--text-nav-dim)]">
              <div className="hidden sm:block">
                <DataStatusBadge source={dataSource} />
              </div>
              <div className="hidden md:flex gap-4 text-xs font-bold border-r border-[var(--border-card)] pr-5 items-center">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-8 h-8 rounded-full bg-[var(--bg-mini-card)] border border-[var(--border-mini)] flex items-center justify-center hover:bg-white/10 transition-all text-lg"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button className="hover:text-[var(--text-main)] transition-colors">A-</button>
                <button className="hover:text-[var(--text-main)] transition-colors">A+</button>
              </div>
              <button className="hover:text-white font-bold text-white/40 hidden sm:block">?</button>
              <button
                className="relative hover:scale-110 transition-transform xl:cursor-default"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <IconBell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-[#f87171] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full border-2 border-[var(--sidebar-bg)]">4</span>
              </button>
              <button className="relative hover:scale-110 transition-transform">
                <IconUser className="w-5 h-5" />
              </button>
              <button className="hover:text-white text-lg hidden sm:block transition-colors">⛶</button>
            </div>
          </header>

          {/* CONTENT */}
          <div className="flex-1 p-4 pt-0 lg:overflow-hidden overflow-y-auto flex flex-col min-h-0">
            {page === "home" ? (
              <div className="flex-1 w-full relative lg:overflow-hidden flex flex-col h-full min-h-0">
                <div className="relative z-10 flex-1 lg:overflow-hidden flex flex-col h-full min-h-0 animate-fade-in">
                  {/* 🎯 4. TAB BAR (High Fidelity) */}
                  <header className="flex flex-nowrap items-center justify-between mb-4 w-full shrink-0 relative z-30">
                    <div className="flex bg-[#0B1F2E]/90 backdrop-blur-md p-1 rounded-xl border border-white/5">
                      {NAV_TABS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`px-5 py-2.5 rounded-lg transition-all duration-300 text-[13px] font-bold ${activeTab === t ? "bg-[#E2E8F0] text-[#0B1F2E] shadow-lg" : "text-white/70 hover:text-white"}`}
                          onClick={() => setActiveTab(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0B1F2E]/90 backdrop-blur-md border border-white/5 text-white hover:bg-[#0F2332] transition-all shadow-lg shrink-0 mr-[1px]"
                      onClick={() => setPinned(!pinned)}
                      title="Fixar/Soltar Hero"
                    >
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill={pinned ? "currentColor" : "none"} 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className={`transition-transform duration-300 ${pinned ? "rotate-45" : "rotate-0"}`}
                      >
                        <line x1="12" y1="17" x2="12" y2="22" />
                        <path d="M5 17h14v-2l-1.5-1.5V6a2 2 0 0 0-2-2H9.5a2 2 0 0 0-2 2v7.5L6 15v2z" />
                      </svg>
                    </button>
                  </header>

                  <div className="flex-1 overflow-hidden flex flex-col w-full h-full min-h-0">
                    {activeTab === "Visão Geral" && <CapexDashboard onSourceChange={setDataSource} />}
                    {(activeTab === "Obras em Andamento" || activeTab === "Obras Futuras" || activeTab === "Obras Finalizadas") && (
                      <HeroRotativo pinned={pinned} setPinned={setPinned} activeTab={activeTab} onSourceChange={setDataSource} />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto no-scrollbar animate-fade-in">
                <PublishSgoPage />
              </div>
            )}
          </div>
        </main>

        {/* RIGHT PANEL (Notifications) */}
        <aside className={`
        fixed inset-y-0 right-0 z-[70] xl:relative xl:z-20
        w-[320px] bg-[var(--sidebar-bg)] border-l border-[var(--border-card)] flex flex-col shrink-0
        transition-all duration-500 transform
        ${isNotificationsOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
      `}>
          <div className="pt-7 px-6 pb-0 flex justify-between items-start shrink-0">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[14px] font-semibold text-[var(--text-nav)] tracking-tight">Notificações</h2>
                <button className="xl:hidden p-2 text-[var(--text-nav-dim)] hover:bg-black/5 rounded-lg transition-colors" onClick={() => setIsNotificationsOpen(false)}>✕</button>
              </div>
              <div className="flex gap-6 border-b border-[var(--border-nav)] text-[12px] font-medium">
                <button
                  className={`pb-3 border-b-2 transition-all duration-300 ${updatesTab === "geral" ? "border-[var(--accent)] text-[var(--text-nav)]" : "border-transparent text-[var(--text-nav-dim)] hover:text-[var(--text-nav)]"}`}
                  onClick={() => setUpdatesTab("geral")}
                >Geral</button>
                <button
                  className={`pb-3 border-b-2 transition-all duration-300 ${updatesTab === "minhas" ? "border-[var(--accent)] text-[var(--text-nav)]" : "border-transparent text-[var(--text-nav-dim)] hover:text-[var(--text-nav)]"}`}
                  onClick={() => setUpdatesTab("minhas")}
                >Minhas</button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pl-6 pr-4 pt-4 pb-20 card-scrollbar mt-2">
            <UpdateList tab={updatesTab} onSourceChange={setDataSource} />
          </div>

          <button className="absolute bottom-8 right-8 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-[80] border border-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </button>
        </aside>

        <PendenciasModal isOpen={isPendenciasOpen} onClose={() => setIsPendenciasOpen(false)} />
      </div>
    </div>
  );
}
