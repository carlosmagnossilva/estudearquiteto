import { renderHook, waitFor } from "@testing-library/react";
import { useBff } from "./useBff";
import { useMsal } from "@azure/msal-react";

// Mock do MSAL
jest.mock("@azure/msal-react");

describe("useBff Hook", () => {
  const mockAccounts = [{ homeAccountId: "123", name: "Guest" }];
  const mockInstance = {
    acquireTokenSilent: jest.fn().mockResolvedValue({ accessToken: "secret_token" }),
  };

  beforeEach(() => {
    (useMsal as jest.Mock).mockReturnValue({
      instance: mockInstance,
      accounts: mockAccounts,
    });
    global.fetch = jest.fn();
    process.env.REACT_APP_BFF_URL = "http://localhost:4000";
    process.env.REACT_APP_AZURE_SCOPE = "api://test-scope";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve carregar dados com sucesso", async () => {
    const mockData = { success: true, items: [] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useBff("/test"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.err).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:4000/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer secret_token",
        }),
      })
    );
  });

  it("deve retornar erro em caso de falha HTTP", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useBff("/test"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.err).toBe("HTTP 404");
  });

  it("deve gerenciar erro 401 (autorização)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useBff("/test"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.err).toContain("Não autorizado");
  });
});
