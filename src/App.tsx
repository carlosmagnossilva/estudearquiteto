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

  if (!isAuthenticated && !isBypass) return <LoginPage />;

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#f3f6f9] overflow-hidden text-slate-800 font-sans relative">

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
        w-[260px] bg-[#f8fafc] flex flex-col justify-between shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)]
        transition-transform duration-300 transform
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-5 py-6 mb-2 flex items-center justify-between gap-3">
            <img className="w-40 h-10 object-contain" src={logoOPC} alt="OceanPact" />
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>

          <nav className="px-3 space-y-1 text-[13px] font-semibold text-[#00425C]/80">
            <button
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-[14px] transition-all ${page === "home" ? "bg-[#00425C] text-white shadow-md" : "hover:bg-slate-200"}`}
              onClick={() => { setPage("home"); setIsSidebarOpen(false); }}
            >
              <IconHome className="w-[18px] h-[18px]" /> <span>Início</span>
            </button>

            <a className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all text-[#00425C]" href="/financeiro"><IconMoney className="w-[18px] h-[18px]" /> <span>Financeiro</span></a>
            <a className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all text-[#00425C]" href="/obras"><IconGrid className="w-[18px] h-[18px]" /> <span>Obras</span></a>
            <a className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all text-[#00425C]" href="/gmuds"><IconDoc className="w-[18px] h-[18px]" /> <span>GMUDs</span></a>
            <a className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all text-[#00425C]" href="/equipes"><IconUsers className="w-[18px] h-[18px]" /> <span>Equipes</span></a>
            <a className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all text-[#00425C]" href="/embarcacoes"><IconBoat className="w-[18px] h-[18px]" /> <span>Embarcações</span></a>
            <a className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all text-[#00425C]" href="/relatorios"><IconDoc className="w-[18px] h-[18px]" /> <span>Relatórios</span></a>

            <button
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-[14px] mb-2 transition-all ${page === "publish-sgo" ? "bg-[#00425C] text-white" : "hover:bg-slate-200 text-[#00425C]"}`}
              onClick={() => { setPage("publish-sgo"); setIsSidebarOpen(false); }}
            >
              <IconDoc className="w-[18px] h-[18px]" /> <span>Publicar na fila SGO</span>
            </button>

            <div className="h-px bg-slate-200 my-4 mx-4" />

            <button 
              className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all justify-between text-[#00425C] xl:hidden"
              onClick={() => { setIsNotificationsOpen(true); setIsSidebarOpen(false); }}
            >
              <div className="flex items-center gap-4"><IconBell className="w-[18px] h-[18px]" /> <span>Notificações</span></div>
              <span className="bg-[#e11d48] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">4</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all justify-between text-[#00425C]">
              <div className="flex items-center gap-4"><IconCheck className="w-[18px] h-[18px]" /> <span>Pendências</span></div>
              <span className="bg-[#e11d48] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all text-[#00425C]">
              <IconGear className="w-[18px] h-[18px]" /> <span>Painel de Controle</span>
            </button>

            <div className="h-px bg-slate-200 my-4 mx-4" />

            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all text-[#00425C]">
              <IconUser className="w-[18px] h-[18px]" /> <span>Meu Perfil</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-[14px] hover:bg-slate-200 transition-all text-[#00425C]" onClick={() => instance.logoutRedirect()}>
              <IconExit className="w-[18px] h-[18px]" /> <span>Sair</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200/60 bg-[#f8fafc]">
          <div className="flex items-center gap-3 px-2 py-2">
            <img src="https://i.pravatar.cc/100" alt="Junior P. Santos" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#00425C] leading-none">Junior P. Santos</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Financeiro</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative h-full min-w-0">
        {/* TOP BAR */}
        <header className="h-14 flex justify-between items-center px-4 md:px-6 shrink-0 bg-white/50 backdrop-blur-sm border-b border-slate-200 lg:bg-transparent lg:border-none lg:backdrop-blur-none transition-all">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 bg-slate-100 rounded-lg text-[#00425C]"
              onClick={() => setIsSidebarOpen(true)}
            >
              <IconGrid className="w-5 h-5" />
            </button>
            <button className="hidden sm:flex w-7 h-7 bg-slate-200 rounded text-slate-500 items-center justify-center hover:bg-slate-300 transition-colors">‹</button>
          </div>

          <div className="flex justify-end gap-3 sm:gap-5 items-center text-[#00425C]">
            <div className="hidden sm:block">
              <DataStatusBadge source={dataSource} />
            </div>
            <div className="hidden md:flex gap-4 text-xs font-bold border-r border-[#00425C]/20 pr-5">
              <button className="hover:text-[#00425C]/70 transition-colors">A-</button>
              <button className="hover:text-[#00425C]/70 transition-colors">A+</button>
            </div>
            <button className="hover:text-[#00425C]/70 font-bold text-slate-500 hidden sm:block">?</button>
            <button 
              className="relative hover:text-[#00425C]/70 xl:cursor-default"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              🔔
              <span className="absolute -top-1 -right-1 bg-[#e11d48] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full border-2 border-[#f3f6f9]">4</span>
            </button>
            <button className="relative hover:text-[#00425C]/70">
              👤
            </button>
            <button className="hover:text-[#00425C]/70 text-lg hidden sm:block">⛶</button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-3 sm:p-4 pt-0 overflow-hidden flex flex-col min-h-0">
          {page === "home" ? (
            <div className="flex-1 w-full relative rounded-2xl sm:rounded-[32px] overflow-hidden flex flex-col shadow-xl">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-[1.05]"
                style={{ backgroundImage: `url(${fundoVisaoGeral})` }}
              />

              <div className="absolute inset-0 bg-[#081824]/60 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#081824]/50 via-transparent to-[#00425C]/40" />

              <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex-1 overflow-hidden flex flex-col h-full min-h-0">
                {/* TAB BAR */}
                <header className="flex flex-wrap items-center justify-between mb-4 sm:mb-6 w-full shrink-0 relative z-30 gap-4">
                  <div className="flex bg-[#0A1A2A]/85 p-1 rounded-full shadow-2xl border border-white/[0.04] overflow-x-auto no-scrollbar max-w-full">
                    <div className="flex gap-0.5 whitespace-nowrap">
                      {NAV_TABS.map(t => (
                        <button
                          key={t}
                          type="button"
                          className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[13px] font-bold transition-all ${activeTab === t ? "bg-white text-[#0A1A2A] shadow-lg scale-[1.02]" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                          onClick={() => setActiveTab(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-[#0A1A2A]/90 hover:bg-[#0A1A2A] text-[#e11d48] transition-all shadow-md border border-white/[0.04] shrink-0"
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
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <PublishSgoPage />
            </div>
          )}
        </div>
      </main>

      {/* RIGHT PANEL */}
      <aside className={`
        fixed inset-y-0 right-0 z-[70] xl:relative xl:z-20
        w-[320px] sm:w-[340px] bg-[#eef3f6] border-l border-slate-200 flex flex-col shrink-0 shadow-[-2px_0_15px_rgba(0,0,0,0.05)]
        transition-transform duration-300 transform
        ${isNotificationsOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
      `}>
        <div className="pt-7 px-6 pb-0 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-bold text-[#00425C] tracking-tight">Notificações</h2>
              <button className="xl:hidden p-2 text-slate-400" onClick={() => setIsNotificationsOpen(false)}>✕</button>
            </div>
            <div className="flex gap-6 border-b border-[#cbd5e1] text-[13px] font-bold">
              <button
                className={`pb-3 border-b-2 transition-all ${updatesTab === "geral" ? "border-[#00425C] text-[#00425C]" : "border-transparent text-[#55788a] hover:text-[#00425C]"}`}
                onClick={() => setUpdatesTab("geral")}
              >Geral</button>
              <button
                className={`pb-3 border-b-2 transition-all ${updatesTab === "minhas" ? "border-[#00425C] text-[#00425C]" : "border-transparent text-[#55788a] hover:text-[#00425C]"}`}
                onClick={() => setUpdatesTab("minhas")}
              >Minhas</button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pl-6 pr-4 pt-4 pb-20 card-scrollbar mt-2">
          <UpdateList tab={updatesTab} onSourceChange={setDataSource} />
        </div>

        <button className="absolute bottom-8 right-8 w-14 h-14 sm:w-[60px] sm:h-[60px] bg-[#00425C] hover:bg-[#002f42] text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 z-[80]">
          <svg width="24" height="24" className="sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </button>
      </aside>
    </div>
  );
}
