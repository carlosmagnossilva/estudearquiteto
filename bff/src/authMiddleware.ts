import { Request, Response, NextFunction } from "express";
import * as jose from "jose";

const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;

// O Azure AD pode gerar tokens v1.0 ou v2.0 dependendo da configuração do App Registration.
// Devemos aceitar ambos os formatos de issuer como válidos.
const issuers = [
  `https://login.microsoftonline.com/${tenantId}/v2.0`,
  `https://sts.windows.net/${tenantId}/`
];

const jwks = jose.createRemoteJWKSet(new URL(jwksUri));

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {


    const { payload } = await jose.jwtVerify(token, jwks, {
      audience: [clientId!, `api://${clientId}`],
    });

    // Validando o Issuer manualmente já que array de issuers só é suportado em versões mais novas
    if (!payload.iss || !issuers.includes(payload.iss)) {
      throw new Error(`Invalid issuer: ${payload.iss}`);
    }

    (req as any).user = payload;
    next();
  } catch (err: any) {
    console.error(`[Auth Error] ${req.method} ${req.url}: ${err.message}`);
    res.status(401).json({
      error: "Invalid token",
      message: err.message,
      clientId: clientId,
      tenantId: tenantId
    });
  }
};