import React, { useState } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";

import logoOPC from "./assets/logo.png";
import fundoVisaoGeral from "./assets/parcel-dos-reis.png";
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

const NAV_TABS = ["Visão Geral", "Em andamento", "Obras futuras", "Obras encerradas"] as const;
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

  if (!isAuthenticated && !isBypass) return <LoginPage />;

  return (
    <div className="relative h-screen w-full overflow-hidden font-[var(--font-inter)] text-white">
      {/* 🎯 1. BACKGROUND */}
      <img 
        src="/background-water.jpg" 
        className="absolute inset-0 w-full h-full object-cover"
        alt="Background"
      />
      <div className="absolute inset-0 bg-[#0B1F2E]/85 backdrop-blur-[2px]" />

      <div className="relative z-10 flex h-full w-full">

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
        w-[240px] bg-[var(--ocean-dark)] flex flex-col justify-between shrink-0 border-r border-[var(--glass-stroke)]
        transition-transform duration-300 transform
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-5 py-6 mb-2 flex items-center justify-between gap-3">
            <h1 className="text-[15px] font-semibold tracking-wide text-white uppercase">HUB de OBRAS</h1>
            <button className="lg:hidden p-2 text-white/40" onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>

          <nav className="px-3 space-y-1 text-[13px] font-medium text-[var(--text-secondary)]">
            <button
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-300 ${page === "home" ? "bg-white/10 text-white shadow-sm border-l-[3px] border-[#22d3ee] !rounded-l-none" : "hover:bg-white/5"}`}
              onClick={() => { setPage("home"); setIsSidebarOpen(false); }}
            >
              <IconHome className="w-[18px] h-[18px]" /> <span>Início</span>
            </button>

            <a className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-inherit" href="/financeiro"><IconMoney className="w-[18px] h-[18px]" /> <span>Financeiro</span></a>
            <a className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-inherit" href="/obras"><IconGrid className="w-[18px] h-[18px]" /> <span>Obras</span></a>
            <a className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-inherit" href="/gmuds"><IconDoc className="w-[18px] h-[18px]" /> <span>GMUDs</span></a>
            <a className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-inherit" href="/equipes"><IconUsers className="w-[18px] h-[18px]" /> <span>Equipes</span></a>
            <a className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-inherit" href="/embarcacoes"><IconBoat className="w-[18px] h-[18px]" /> <span>Embarcações</span></a>
            <a className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-inherit" href="/relatorios"><IconDoc className="w-[18px] h-[18px]" /> <span>Relatórios</span></a>

            <button
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg mb-2 transition-all ${page === "publish-sgo" ? "bg-white/10 text-white border-l-[3px] border-[#22d3ee] !rounded-l-none" : "hover:bg-white/5"}`}
              onClick={() => { setPage("publish-sgo"); setIsSidebarOpen(false); }}
            >
              <IconDoc className="w-[18px] h-[18px]" /> <span>Publicar na fila SGO</span>
            </button>

            <div className="h-px bg-white/10 my-4 mx-4" />

            <button 
              className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all justify-between text-inherit xl:hidden"
              onClick={() => { setIsNotificationsOpen(true); setIsSidebarOpen(false); }}
            >
              <div className="flex items-center gap-4"><IconBell className="w-[18px] h-[18px]" /> <span>Notificações</span></div>
              <span className="bg-[#f87171] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">4</span>
            </button>
            <button 
              className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all justify-between text-inherit"
              onClick={() => { setIsPendenciasOpen(true); setIsSidebarOpen(false); }}
            >
              <div className="flex items-center gap-4"><IconCheck className="w-[18px] h-[18px]" /> <span>Pendências</span></div>
              <span className="bg-[#f87171] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-inherit">
              <IconGear className="w-[18px] h-[18px]" /> <span>Painel de Controle</span>
            </button>

            <div className="h-px bg-white/10 my-4 mx-4" />

            <button className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-inherit">
              <IconUser className="w-[18px] h-[18px]" /> <span>Meu Perfil</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-inherit" onClick={() => instance.logoutRedirect()}>
              <IconExit className="w-[18px] h-[18px]" /> <span>Sair</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/10 shadow-sm overflow-hidden">
               <img src="https://i.pravatar.cc/100" alt="Junior P. Santos" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white leading-none">Junior P. Santos</span>
              <span className="text-[11px] text-[var(--text-secondary)] mt-0.5">Financeiro</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative h-full min-w-0">
        {/* TOP BAR */}
        <header className="h-14 flex justify-between items-center px-4 md:px-6 shrink-0 border-b border-white/5 xl:border-none transition-all">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 bg-white/5 rounded-lg text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <IconGrid className="w-5 h-5" />
            </button>
            <button className="hidden sm:flex w-7 h-7 bg-white/5 rounded text-white/40 items-center justify-center hover:bg-white/10 transition-colors">‹</button>
          </div>

          <div className="flex justify-end gap-3 sm:gap-5 items-center text-white/70">
            <div className="hidden sm:block">
              <DataStatusBadge source={dataSource} />
            </div>
            <div className="hidden md:flex gap-4 text-xs font-bold border-r border-white/10 pr-5">
              <button className="hover:text-white transition-colors">A-</button>
              <button className="hover:text-white transition-colors">A+</button>
            </div>
            <button className="hover:text-white font-bold text-white/40 hidden sm:block">?</button>
            <button 
              className="relative hover:scale-110 transition-transform xl:cursor-default"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <IconBell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#f87171] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full border-2 border-[var(--ocean-dark)]">4</span>
            </button>
            <button className="relative hover:scale-110 transition-transform">
              <IconUser className="w-5 h-5" />
            </button>
            <button className="hover:text-white text-lg hidden sm:block transition-colors">⛶</button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
          {page === "home" ? (
            <div className="flex-1 w-full relative overflow-hidden flex flex-col h-full min-h-0">
              <div className="relative z-10 flex-1 overflow-hidden flex flex-col h-full min-h-0 animate-fade-in">
                {/* 🎯 4. TAB BAR */}
                <header className="flex flex-wrap items-center justify-between mb-4 w-full shrink-0 relative z-30 gap-4">
                  <div className="flex gap-2 text-[13px]">
                    {NAV_TABS.map((t, i) => (
                      <button
                        key={t}
                        type="button"
                        className={`px-4 py-2 rounded-md transition-all duration-300 font-medium ${activeTab === t ? "bg-white/15 text-white shadow-sm" : "bg-white/5 text-[#94A3B8] hover:text-white"}`}
                        onClick={() => setActiveTab(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-[#0A1A2A]/80 backdrop-blur-xl hover:bg-[#0A1A2A] text-[#e11d48] transition-all shadow-lg border border-white/[0.05] shrink-0"
                    onClick={() => setPinned(!pinned)}
                  >
                    📌
                  </button>
                </header>

                <div className="flex-1 overflow-hidden flex flex-col w-full h-full min-h-0">
                  {activeTab === "Visão Geral" && <CapexDashboard onSourceChange={setDataSource} />}
                  {(activeTab === "Em andamento" || activeTab === "Obras futuras" || activeTab === "Obras encerradas") && (
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
        w-[320px] bg-[var(--ocean-dark)] border-l border-[var(--glass-stroke)] flex flex-col shrink-0
        transition-transform duration-300 transform
        ${isNotificationsOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
      `}>
        <div className="pt-7 px-6 pb-0 flex justify-between items-start shrink-0">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[14px] font-semibold text-white tracking-tight">Notificações</h2>
              <button className="xl:hidden p-2 text-white/40 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsNotificationsOpen(false)}>✕</button>
            </div>
            <div className="flex gap-6 border-b border-white/10 text-[12px] font-medium">
              <button
                className={`pb-3 border-b-2 transition-all duration-300 ${updatesTab === "geral" ? "border-white text-white" : "border-transparent text-[var(--text-secondary)] hover:text-white"}`}
                onClick={() => setUpdatesTab("geral")}
              >Geral</button>
              <button
                className={`pb-3 border-b-2 transition-all duration-300 ${updatesTab === "minhas" ? "border-white text-white" : "border-transparent text-[var(--text-secondary)] hover:text-white"}`}
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
