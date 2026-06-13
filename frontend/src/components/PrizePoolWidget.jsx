import { useEffect, useState } from 'react';
import { api } from '../services/api';

function formatMoeda(valor, moeda = 'R$') {
  return `${moeda} ${Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PrizePoolWidget({ refreshKey }) {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getResumo()
      .then((data) => active && setResumo(data))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-2 mb-10">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-pitch-800 to-amber-500/10 p-6 sm:p-10 shadow-2xl shadow-emerald-950/50 animate-pulse-glow">
        {/* Decorative floating elements */}
        <div className="pointer-events-none absolute -right-10 -top-10 text-[8rem] opacity-10 select-none animate-float">
          🏆
        </div>
        <div className="pointer-events-none absolute -left-8 -bottom-8 text-[6rem] opacity-5 select-none animate-float" style={{ animationDelay: '1.5s' }}>
          ⚽
        </div>

        <div className="relative flex flex-col items-center text-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            💰 Valor Acumulado Total
          </span>

          {loading || !resumo ? (
            <div className="h-16 sm:h-20 w-64 rounded-xl bg-white/5 animate-pulse mt-2" />
          ) : (
            <>
              <p className="font-display text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-emerald-300 via-emerald-200 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
                {formatMoeda(resumo.totalArrecadado, resumo.moeda)}
              </p>
              <p className="text-xs text-slate-400">
                ✅ Confirmado (pago):{' '}
                <strong className="text-emerald-300">
                  {formatMoeda(resumo.totalConfirmado ?? 0, resumo.moeda)}
                </strong>{' '}
                ({resumo.totalPagos ?? 0}/{resumo.totalParticipantes})
              </p>
            </>
          )}

          {!loading && resumo && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                <span className="text-lg">👥</span>
                <span className="text-slate-300">
                  <strong className="text-white">{resumo.totalParticipantes}</strong>{' '}
                  participante{resumo.totalParticipantes === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                <span className="text-lg">🎟️</span>
                <span className="text-slate-300">
                  <strong className="text-white">
                    {formatMoeda(resumo.valorAposta, resumo.moeda)}
                  </strong>{' '}
                  por pessoa
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                <span className="text-lg">⚽</span>
                <span className="text-slate-300">
                  <strong className="text-white">{resumo.totalJogos}</strong> jogos
                  (Grupo C)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
