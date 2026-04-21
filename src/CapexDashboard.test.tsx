import React from "react";
import { render, screen } from "@testing-library/react";
import CapexDashboard from "./CapexDashboard";
import { useBff } from "./hooks/useBff";

// Mock do hook useBff
jest.mock("./hooks/useBff");

describe("CapexDashboard Component", () => {
  const mockData = {
    meta: { source: "test_db" },
    outlook: { ano: 2026, outlook_brl_m: 265, variacao_orcamento_perc: 3, total_obras: 47, obras_executadas: 23 },
    tipos: [{ id: "A", valor_brl_m: 100, percentual: 30 }],
    composicao: [{ label: "MAT", valor_brl_m: 150, percentual: 60 }],
    subsistemas: [{ nome: "Sub1", valor_brl_m: 50, percentual: 20, codigo: "S1" }],
    historico: [{ year: "2026", value: 200 }]
  };

  it("deve renderizar o estado de carregamento", () => {
    (useBff as jest.Mock).mockReturnValue({ loading: true });
    render(<CapexDashboard />);
    expect(screen.getByText(/Carregando métricas financeiras/i)).toBeInTheDocument();
  });

  it("deve renderizar os dados corretamente", () => {
    (useBff as jest.Mock).mockReturnValue({ loading: false, data: mockData });
    render(<CapexDashboard />);

    expect(screen.getByText(/Outlook de Capex de Obras - 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/265 M/i)).toBeInTheDocument();
    expect(screen.getByText(/Total de Obras/i)).toBeInTheDocument();
    expect(screen.getByText(/Sub1/i)).toBeInTheDocument();
  });

  it("deve exibir mensagem de erro em caso de falha", () => {
    (useBff as jest.Mock).mockReturnValue({ loading: false, err: "Falha na API" });
    render(<CapexDashboard />);
    expect(screen.getByText(/Erro ao carregar Capex: Falha na API/i)).toBeInTheDocument();
  });
});
