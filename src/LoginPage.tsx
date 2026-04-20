import React, { useState } from 'react';
import './LoginPage.css';
import logoOPC from './assets/logo.png';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

export default function LoginPage() {
  const { instance } = useMsal();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Inicia o login real via redirecionamento da Microsoft
    instance.loginRedirect({
      ...loginRequest,
      scopes: loginRequest.scopes as string[],
      loginHint: email // Passa o e-mail preenchido como sugestão para a Microsoft
    }).catch((e: any) => {
      console.error(e);
      setLoading(false);
    });
  };

  return (
    <div className="login-container">
      <div className="login-overlay" />

      <div className="login-card">
        <img src={logoOPC} alt="OceanPact Logo" className="login-logo" />

        <div className="login-header">
          <h1>Hub de Obras</h1>
          <p>Gestão Integrada de Obras das embarcações</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">E-mail Corporativo</label>
            <input
              id="email"
              type="email"
              placeholder="seu.nome@dc.srv.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Redirecionando...' : 'Acessar Hub de Obras'}
          </button>
        </form>

        <div className="login-footer">
          <div className="microsoft-auth-notif">
            <svg width="16" height="16" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1h9v9H1z" fill="#f25022" /><path d="M11 1h9v9h-9z" fill="#7fbb00" /><path d="M11 11h9v9h-9z" fill="#00a4ef" /><path d="M1 11h9v9H1z" fill="#ffb900" />
            </svg>
            <span>Autenticação protegida via Microsoft Azure</span>
          </div>
          <p>Dúvidas? <button type="button" className="support-link" onClick={() => window.open('https://suporte.dc.srv.br', '_blank')}>Acessar Suporte de TI</button></p>
        </div>
      </div>
    </div>
  );
}
