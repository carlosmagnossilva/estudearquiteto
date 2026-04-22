import React, { useState } from "react";
import { useBff } from "../../../hooks/useBff";
import { IPPU, IEstaleiro, IBffResponse } from "@hub/shared";

const PPUManager: React.FC = () => {
  const [selectedEstaleiro, setSelectedEstaleiro] = useState<number | null>(null);
  const { data: estaleiros } = useBff<IBffResponse<IEstaleiro>>("/bff/financeiro/estaleiros");
  const { data: ppus, loading } = useBff<IBffResponse<IPPU>>(`/bff/financeiro/ppus${selectedEstaleiro ? `?estaleiroId=${selectedEstaleiro}` : ""}`, [selectedEstaleiro]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Cardápios de Facilidades (PPUs)</h2>
          <p className="text-white/50 text-sm">Gestão de tabelas de preços unitários por estaleiro.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2">
          <span>+</span> Novo Cardápio (PPU)
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar Estaleiros */}
        <div className="w-64 bg-black/20 rounded-2xl border border-white/5 p-4 flex flex-col gap-2 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-white/30 px-2 mb-2">Estaleiros</div>
          <button 
            onClick={() => setSelectedEstaleiro(null)}
            className={`text-left px-4 py-2.5 rounded-lg text-sm transition-all ${!selectedEstaleiro ? "bg-white/10 text-white font-bold" : "text-white/50 hover:bg-white/5"}`}
          >
            Todos os Estaleiros
          </button>
          {estaleiros?.items?.map((e: IEstaleiro) => (
            <button 
              key={e.id}
              onClick={() => setSelectedEstaleiro(e.id)}
              className={`text-left px-4 py-2.5 rounded-lg text-sm transition-all ${selectedEstaleiro === e.id ? "bg-white/10 text-white font-bold border-l-4 border-orange-500" : "text-white/50 hover:bg-white/5"}`}
            >
              {e.nome}
            </button>
          ))}
        </div>

        {/* PPU List */}
        <div className="flex-1 bg-black/10 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-white/20">Carregando cardápios...</div>
          ) : (
            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar">
              {ppus?.items?.length === 0 ? (
                <div className="col-span-2 py-20 text-center text-white/10 italic">Nenhum cardápio cadastrado para este estaleiro.</div>
              ) : (
                ppus?.items?.map((p: IPPU) => (
                  <div key={p.id} className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-orange-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-1">{p.status}</div>
                        <h3 className="text-lg font-bold text-white">{p.codigoPPU}</h3>
                      </div>
                      <button className="text-white/30 hover:text-white transition-colors">•••</button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                      <div>
                        <div className="text-white/30 mb-1">Início Vigência</div>
                        <div className="text-white font-medium">{new Date(p.inicioVigencia).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <div className="text-white/30 mb-1">Fim Vigência</div>
                        <div className="text-white font-medium">{new Date(p.fimVigencia).toLocaleDateString('pt-BR')}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                       <span className="text-[10px] text-white/20 italic font-mono">ID: {p.id}</span>
                       <button className="text-xs text-white/60 hover:text-orange-400 font-bold transition-colors">Visualizar Preços →</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PPUManager;
