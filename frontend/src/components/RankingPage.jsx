import { useEffect, useState } from 'react';
import { api } from '../services/api';

const MEDALS = ['🥇', '🥈', '🥉'];

function PosicaoBadge({ index }) {
  if (index < 3) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-lg shadow-lg shadow-amber-500/30">
        {MEDALS[index]}
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-sm font-bold text-slate-300">
      {index + 1}º
    </span>
  );
}

export default function RankingPage({ refreshKey }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getRanking()
      .then(setRanking)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          🏆 Tabela de Classificação
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          3 pontos por placar exato • 1 ponto por acertar o vencedor/empate
        </p>
      </div>

      <div className="glass overflow-hidden rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_auto_auto_auto] sm:grid-cols-[4rem_1fr_6rem_6rem_6rem] items-center gap-2 sm:gap-4 border-b border-white/10 bg-white/[0.03] px-4 sm:px-6 py-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>#</span>
          <span>Participante</span>
          <span className="text-center hidden sm:inline">Exatos</span>
          <span className="text-center hidden sm:inline">Resultado</span>
          <span className="text-right">Pontos</span>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex flex-col gap-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : ranking.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="text-5xl">📭</span>
            <p className="font-display text-lg font-bold text-white">
              Ninguém apostou ainda
            </p>
            <p className="max-w-sm text-sm text-slate-400">
              Assim que os participantes fizerem seus palpites, eles aparecerão aqui no
              ranking.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {ranking.map((p, index) => (
              <li
                key={p.id}
                className={`grid grid-cols-[3rem_1fr_auto_auto_auto] sm:grid-cols-[4rem_1fr_6rem_6rem_6rem] items-center gap-2 sm:gap-4 px-4 sm:px-6 py-4 transition-colors hover:bg-white/[0.03] ${
                  index === 0 ? 'bg-gradient-to-r from-amber-400/10 to-transparent' : ''
                }`}
              >
                <PosicaoBadge index={index} />
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-600 font-display text-sm font-bold text-white">
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold text-white">{p.nome}</p>
                    <p className="text-xs text-slate-500 sm:hidden">
                      {p.placaresExatos} exatos • {p.acertosResultado} resultados
                    </p>
                  </div>
                </div>
                <span className="hidden sm:block text-center font-semibold text-emerald-400">
                  {p.placaresExatos}
                </span>
                <span className="hidden sm:block text-center font-semibold text-sky-400">
                  {p.acertosResultado}
                </span>
                <span className="text-right font-display text-xl font-extrabold text-white">
                  {p.pontos}
                  <span className="ml-1 text-xs font-medium text-slate-500">pts</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
