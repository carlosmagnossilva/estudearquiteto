import { authMiddleware } from "./authMiddleware";
import { Request, Response, NextFunction } from "express";
import * as jose from "jose";

jest.mock("jose");

describe("authMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.AZURE_TENANT_ID = "test-tenant";
    process.env.AZURE_CLIENT_ID = "test-client";
  });

  it("deve retornar 401 se nenhum token for fornecido", async () => {
    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "No token provided"
    }));
  });

  it("deve chamar next() se o token for válido", async () => {
    mockRequest.headers!.authorization = "Bearer valid-token";
    
    (jose.jwtVerify as jest.Mock).mockResolvedValue({
      payload: { 
        iss: "https://login.microsoftonline.com/test-tenant/v2.0",
        aud: "test-client"
      }
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as any).user).toBeDefined();
  });

  it("deve retornar 401 se o issuer for inválido", async () => {
    mockRequest.headers!.authorization = "Bearer invalid-token";
    
    (jose.jwtVerify as jest.Mock).mockResolvedValue({
      payload: { 
        iss: "https://malicious-site.com",
        aud: "test-client"
      }
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Invalid token"
    }));
  });
});
