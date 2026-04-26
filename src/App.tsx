import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";

import logoOPC from "./assets/logo.png";
import parcelDosReisImg from "./assets/parcel-dos-reis.png";
import LoginPage from "./LoginPage";
import CapexDashboard from "./CapexDashboard";
import IntegrationSimulationsPage from "./IntegrationSimulationsPage";
import FinanceiroModule from "./modules/financeiro/FinanceiroModule";
import PublishSgoPage from "./PublishSgoPage";

import { DataStatusBadge } from "./components/DataStatusBadge";
import { UpdateList } from "./components/UpdateList";
import { HeroRotativo } from "./components/HeroRotativo";
import { BackgroundImageTreatment } from "./components/BackgroundImageTreatment";
import { PendenciasModal } from "./components/PendenciasModal";
import {
  IconHome, IconDoc, IconBell, IconCheck, IconGear,
  IconUser, IconExit, IconUsers, IconBoat, IconGrid, IconMoney,
  IconDocEdit, IconX
} from "./components/icons";
import { useResponsive } from "./hooks/useResponsive";

const NAV_TABS = ["Visão Geral", "Obras em Andamento", "Obras Futuras", "Obras Finalizadas"] as const;
type NavTab = typeof NAV_TABS[number];

export default function App() {
  const [updatesTab, setUpdatesTab] = useState("geral");
  const [page, setPage] = useState<"home" | "simulations" | "financeiro" | "setup">("home");
  const [activeTab, setActiveTab] = useState<NavTab>("Visão Geral");
  const [pinned, setPinned] = useState(false);
  const [dataSource, setDataSource] = useState<string | null>(null);
  const [globalToast, setGlobalToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const searchParams = new URLSearchParams(window.location.search);
  const isBypass = searchParams.get("bypass") === "true";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(true);
  const [isPendenciasOpen, setIsPendenciasOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const { isLessThanTablet, isLessThanDesktop } = useResponsive();

  // Efeito para fechar painéis automaticamente ao cruzar breakpoints
  useEffect(() => {
    if (isLessThanTablet) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isLessThanTablet]);

  useEffect(() => {
    if (isLessThanDesktop) {
      setIsNotificationsOpen(false);
    } else {
      setIsNotificationsOpen(true);
    }
  }, [isLessThanDesktop]);

  // SSE - Escuta notificações de sincronização do SGO
  useEffect(() => {
    const bffUrl = process.env.REACT_APP_BFF_URL || "";
    const evtSource = new EventSource(`${bffUrl}/events`);

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setGlobalToast({ message: data.message, type: "success" });
        setTimeout(() => setGlobalToast(null), 10000);
      } catch { /* ignorar */ }
    };

    return () => evtSource.close();
  }, []);

  if (!isAuthenticated && !isBypass) return <LoginPage />;

  return (
    <div className="relative h-screen w-full overflow-hidden font-[var(--font-inter)] bg-[var(--bg-app)] transition-colors duration-1000" data-theme={theme}>
      {/* NOTIFICAÇÃO GLOBAL FLUTUANTE (Camada superior) */}
      {globalToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-slide-down">
          <div className="bg-[#003D5B] text-white px-8 py-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[var(--accent)]/30 flex items-center gap-5 backdrop-blur-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20 shadow-inner shadow-black/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6 text-[var(--accent)] animate-pulse"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div>
              <p className="text-[var(--text-dim)] text-[11px] uppercase tracking-[2px] font-black opacity-60">Sistema SGO / Integrator</p>
              <h4 className="text-[15px] font-bold text-white mt-1">{globalToast.message}</h4>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-full w-full text-[var(--text-main)]">

        {/* OVERLAY MOBILE SIDEBAR */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* BACKDROP FOR MOBILE (SIDEBAR) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* BACKDROP FOR MOBILE (NOTIFICATIONS) */}
        {isNotificationsOpen && !isFullScreen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] xl:hidden animate-fade-in"
            onClick={() => setIsNotificationsOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        {!isFullScreen && (
          <aside className={`
            fixed inset-y-0 left-0 z-[70] lg:relative lg:z-20
            ${isSidebarOpen ? "w-[240px]" : "w-[0px] lg:w-[80px]"} bg-[var(--sidebar-bg)] flex flex-col justify-between shrink-0 border-r border-[var(--border-nav)]
            transition-all duration-300 transform overflow-visible
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}>
            {/* MOBILE CLOSE BUTTON */}
            <button
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <IconX className="w-5 h-5" />
            </button>

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
                  className={`w-full flex items-center gap-4 py-3 rounded-xl transition-all duration-300 ${isSidebarOpen ? "px-4" : "justify-center"} ${page === "home" ? "bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20" : "text-[var(--text-nav-dim)] hover:bg-white/5 hover:text-[var(--text-nav)]"}`}
                  onClick={() => { setPage("home"); if (!isSidebarOpen) setIsSidebarOpen(true); }}
                  title="Início"
                >
                  <IconHome className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Início</span>}
                </button>

                <button
                  className={`w-full flex items-center gap-4 py-3 rounded-xl transition-all duration-300 ${isSidebarOpen ? "px-4" : "justify-center"} ${page === "financeiro" ? "bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20" : "text-[var(--text-nav-dim)] hover:bg-white/5 hover:text-[var(--text-nav)]"}`}
                  onClick={() => { setPage("financeiro"); if (!isSidebarOpen) setIsSidebarOpen(true); }}
                  title="Financeiro"
                >
                  <IconMoney className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Financeiro</span>}
                </button>

                <a className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`} href="/obras" title="Obras">
                  <IconGrid className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Obras</span>}
                </a>

                <a className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`} href="/gmuds" title="GMUDs">
                  <IconDocEdit className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">GMUDs</span>}
                </a>

                <a className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`} href="/equipes" title="Equipes">
                  <IconUsers className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Equipes</span>}
                </a>

                <a className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`} href="/embarcacoes" title="Embarcações">
                  <IconBoat className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Embarcações</span>}
                </a>

                <a className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`} href="/relatorios" title="Relatórios">
                  <IconDoc className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Relatórios</span>}
                </a>

                <div className={`h-px bg-[var(--border-nav)] my-6 opacity-50 ${isSidebarOpen ? "mx-4" : "mx-2"}`} />

                <button
                  className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all justify-between text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`}
                  onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); }}
                  title="Notificações"
                >
                  <div className="flex items-center gap-4">
                    <IconBell className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Notificações</span>}
                  </div>
                  {isSidebarOpen && <span className="bg-[#f87171] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-fade-in">4</span>}
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

                <button className={`w-full flex items-center gap-4 py-3 rounded-lg hover:bg-black/5 transition-all text-[var(--text-nav-dim)] hover:text-[var(--text-nav)] ${isSidebarOpen ? "px-4" : "justify-center"}`} title="Painel de Controle">
                  <IconGear className="w-[18px] h-[18px] shrink-0" /> {isSidebarOpen && <span className="animate-fade-in">Painel de Controle</span>}
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
        )}

        {/* MAIN */}
        <main className="flex-1 flex flex-col relative h-full min-w-0 p-2 sm:p-4 gap-4 overflow-hidden">
          {/* TOP BAR */}
          {!isFullScreen && (
            <header className="h-16 flex justify-between items-center px-4 sm:px-6 shrink-0 border border-[var(--border-nav)] bg-[var(--bg-card)] backdrop-blur-xl z-30 transition-all rounded-2xl shadow-2xl">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden p-2 bg-[var(--bg-mini-card)] rounded-lg text-[var(--text-nav)] hover:bg-black/10 transition-colors"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <IconGrid className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-px bg-[var(--border-mini)] mx-2 hidden sm:block opacity-50"></div>
                  <h1 className="text-[17px] font-bold text-[var(--text-main)] tracking-tight">
                    {page === "home" ? "Capex Dashboard" : page === "financeiro" ? "Financeiro" : page === "setup" ? "Setup / Integrações" : "Simulações"}
                  </h1>
                </div>
              </div>

              <div className="flex justify-end gap-3 sm:gap-5 items-center text-[var(--text-nav-dim)]">
                <div className="hidden sm:block">
                  <DataStatusBadge source={dataSource} />
                </div>
                <div className="hidden md:flex gap-4 text-xs font-bold border-r border-[var(--border-nav)] pr-5 items-center">
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-9 h-9 rounded-full bg-[var(--bg-mini-card)] border border-[var(--border-mini)] flex items-center justify-center hover:bg-black/10 transition-all text-lg shadow-sm"
                  >
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </button>
                  <button className="hover:text-[var(--text-nav)] transition-colors">A-</button>
                  <button className="hover:text-[var(--text-nav)] transition-colors">A+</button>
                </div>
                <button
                  className="hover:text-[var(--text-nav)] text-[var(--text-nav-dim)] hidden sm:block transition-all hover:scale-110"
                  onClick={() => setIsPendenciasOpen(true)}
                  title="Pendências"
                >
                  <IconCheck className="w-5 h-5" />
                </button>
                <button
                  className={`relative hover:scale-110 transition-transform xl:cursor-default ${isNotificationsOpen ? "text-[var(--text-nav)]" : ""}`}
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <IconBell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-[#f87171] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full border-2 border-[var(--sidebar-bg)]">4</span>
                </button>
                <button
                  className={`relative hover:scale-110 transition-transform ${page === "setup" ? "text-[var(--accent)]" : ""}`}
                  onClick={() => setPage("setup")}
                  title="Setup / Integrações"
                >
                  <IconGear className="w-5 h-5" />
                </button>
                <button className="relative hover:scale-110 transition-transform">
                  <IconUser className="w-5 h-5" />
                </button>
                <button
                  className="hover:text-[var(--text-nav)] text-lg hidden sm:block transition-colors"
                  onClick={() => setIsFullScreen(true)}
                  title="Modo Cinema"
                >
                  ⛶
                </button>
              </div>
            </header>
          )}

          {/* CONTENT */}
          <div className="flex-1 p-0 lg:overflow-hidden overflow-y-auto flex flex-col min-h-0">
            {page === "home" ? (
              <div className="flex-1 w-full relative lg:overflow-hidden overflow-y-auto flex flex-col h-full min-h-0">
                <div className="relative z-10 flex-1 lg:overflow-hidden overflow-y-auto flex flex-col h-full min-h-0 animate-fade-in">
                  {/* 🎯 4. TAB BAR & FILTERS (High Fidelity) */}
                  <header className="flex flex-col gap-4 mb-8 w-full shrink-0 relative z-30 no-print">
                    <div className="flex flex-row gap-3 items-center justify-between">
                      <div className="flex-1 flex bg-[var(--bg-card)] backdrop-blur-xl p-1.5 rounded-2xl border border-[var(--border-card)] shadow-xl overflow-x-auto no-scrollbar">
                        {NAV_TABS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`px-6 py-2.5 rounded-xl transition-all duration-300 text-[13px] font-bold whitespace-nowrap ${activeTab === t ? "bg-[var(--text-main)] text-[var(--bg-app)] shadow-lg" : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-white/5"}`}
                            onClick={() => setActiveTab(t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {activeTab !== "Visão Geral" && (
                        <button
                          type="button"
                          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-card)] text-[var(--text-main)] hover:bg-white/5 transition-all shadow-xl shrink-0"
                          onClick={() => setPinned(!pinned)}
                          title="Fixar/Soltar Hero"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={pinned ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-300 ${pinned ? "rotate-45 text-[var(--accent)]" : "rotate-0"}`}
                          >
                            <line x1="12" y1="17" x2="12" y2="22" />
                            <path d="M5 17h14v-2l-1.5-1.5V6a2 2 0 0 0-2-2H9.5a2 2 0 0 0-2 2v7.5L6 15v2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </header>

                  <div className="flex-1 lg:overflow-hidden overflow-y-auto flex flex-col w-full h-full min-h-0">
                    {activeTab === "Visão Geral" && (
                      <BackgroundImageTreatment src={parcelDosReisImg}
                        overlayOpacity={50}
                        vignetteOpacity={70}
                        brightness={120}
                        glowOpacity={100}

                      >
                        <CapexDashboard onSourceChange={setDataSource} />
                      </BackgroundImageTreatment>
                    )}
                    {(activeTab === "Obras em Andamento" || activeTab === "Obras Futuras" || activeTab === "Obras Finalizadas") && (
                      <HeroRotativo pinned={pinned} setPinned={setPinned} activeTab={activeTab} onSourceChange={setDataSource} />
                    )}
                  </div>
                </div>
              </div>
            ) : page === "financeiro" ? (
              <FinanceiroModule />
            ) : page === "setup" ? (
              <PublishSgoPage />
            ) : (
              <IntegrationSimulationsPage />
            )}
          </div>
        </main>

        {/* RIGHT PANEL (Notifications) */}
        {isNotificationsOpen && !isFullScreen && (
          <aside
            id="notification-panel"
            className={`
              print:hidden no-print
              fixed inset-y-0 right-0 z-[70] xl:relative xl:z-20
              w-[320px] bg-[var(--sidebar-bg)] border-l border-[var(--border-card)] flex flex-col shrink-0
              transition-all duration-500 transform
            `}
          >
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

            <button className="absolute bottom-8 right-8 w-14 h-14 bg-[var(--accent)] text-black rounded-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(56,189,248,0.4)] transition-all hover:scale-110 active:scale-95 z-[80] hover:brightness-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </button>
          </aside>
        )}

        {isFullScreen && (
          <button
            className="fixed top-4 right-4 z-[100] w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110"
            onClick={() => setIsFullScreen(false)}
            title="Sair do Modo Cinema"
          >
            ✕
          </button>
        )}
        <PendenciasModal isOpen={isPendenciasOpen} onClose={() => setIsPendenciasOpen(false)} />
      </div>
    </div>
  );
}
