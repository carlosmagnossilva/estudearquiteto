import { authMiddleware } from "./authMiddleware";
import { Request, Response, NextFunction } from "express";
import * as jose from "jose";

jest.mock("jose");

describe("Hub-Core authMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = { headers: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.AZURE_TENANT_ID = "core-tenant";
    process.env.AZURE_CLIENT_ID = "core-client";
  });

  it("deve bloquear se não houver Authorization header", async () => {
    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
  });

  it("deve permitir se o token e o issuer forem válidos", async () => {
    mockRequest.headers!.authorization = "Bearer valid-core-token";
    (jose.jwtVerify as jest.Mock).mockResolvedValue({
      payload: { 
        iss: "https://login.microsoftonline.com/core-tenant/v2.0",
        aud: "core-client"
      }
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });
});
