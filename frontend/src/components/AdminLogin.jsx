import { useState } from 'react';

const ADMIN_USER = 'renan';
const ADMIN_PASS = '451700';
const SESSION_KEY = 'bolao_admin_auth';

export function isAdminAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function AdminLogin({ onSuccess }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      usuario.trim().toLowerCase() === ADMIN_USER &&
      senha === ADMIN_PASS
    ) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setErro('');
      onSuccess();
    } else {
      setErro('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
      <div className="glass mx-auto max-w-sm rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-2xl shadow-lg shadow-amber-500/30">
            🔒
          </div>
          <h2 className="font-display text-2xl font-bold text-white">Acesso restrito</h2>
          <p className="mt-1 text-sm text-slate-400">
            Faça login para acessar a área administrativa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Usuário
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="usuário"
              className="w-full rounded-2xl border-2 border-white/10 bg-pitch-900/60 px-4 py-3 text-white outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 placeholder:text-slate-500"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••"
              className="w-full rounded-2xl border-2 border-white/10 bg-pitch-900/60 px-4 py-3 text-white outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 placeholder:text-slate-500"
              required
            />
          </div>

          {erro && (
            <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-300">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 font-display font-bold text-pitch-900 shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
