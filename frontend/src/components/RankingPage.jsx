import { useEffect, useState } from 'react';
import { api } from '../services/api';

const MEDALS = ['🥇', '🥈', '🥉'];

function formatMoeda(valor, moeda = 'R$') {
  return `${moeda} ${Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

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

// Cor de fundo do "chip" do palpite, conforme pontuação
function chipClasses(pontos, temPalpite) {
  if (!temPalpite) return 'bg-white/5 text-slate-600 border-white/5';
  if (pontos === 3) return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
  if (pontos === 1) return 'bg-sky-500/15 text-sky-300 border-sky-400/30';
  return 'bg-white/5 text-slate-400 border-white/10';
}

export default function RankingPage({ refreshKey }) {
  const [ranking, setRanking] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getRanking(), api.getConfig()])
      .then(([rankingData, configData]) => {
        setRanking(rankingData.ranking || []);
        setJogos(rankingData.jogos || []);
        setConfig(configData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          🏆 Tabela de Classificação
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          3 pontos por placar exato • 1 ponto por acertar o vencedor/empate
        </p>
        {config && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            💰 Valor da aposta por pessoa:{' '}
            <strong>{formatMoeda(config.valorAposta, config.moeda)}</strong>
          </p>
        )}
      </div>

      <div className="glass overflow-x-auto rounded-3xl shadow-2xl">
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
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-3 sm:px-4 py-3 text-left w-12">#</th>
                <th className="px-3 sm:px-4 py-3 text-left">Participante</th>
                {jogos.map((jogo) => (
                  <th key={jogo.id} className="px-2 py-3 text-center whitespace-nowrap">
                    {jogo.siglaA} x {jogo.siglaB}
                  </th>
                ))}
                <th className="px-3 py-3 text-center whitespace-nowrap">Apostou</th>
                <th className="px-3 py-3 text-center whitespace-nowrap">Pago</th>
                <th className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ranking.map((p, index) => (
                <tr
                  key={p.id}
                  className={`transition-colors hover:bg-white/[0.03] ${
                    index === 0 ? 'bg-gradient-to-r from-amber-400/10 to-transparent' : ''
                  }`}
                >
                  <td className="px-3 sm:px-4 py-3">
                    <PosicaoBadge index={index} />
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-600 font-display text-sm font-bold text-white">
                        {p.nome.charAt(0).toUpperCase()}
                      </div>
                      <p className="truncate font-display font-bold text-white">{p.nome}</p>
                    </div>
                  </td>

                  {jogos.map((jogo) => {
                    const palpite = p.palpites?.find((pl) => pl.jogoId === jogo.id);
                    const temPalpite =
                      palpite && palpite.placarA !== null && palpite.placarB !== null;
                    return (
                      <td key={jogo.id} className="px-2 py-3 text-center">
                        <span
                          className={`inline-flex min-w-[3.5rem] items-center justify-center rounded-lg border px-2 py-1 font-display text-xs font-bold ${chipClasses(
                            palpite?.pontos,
                            temPalpite
                          )}`}
                        >
                          {temPalpite ? `${palpite.placarA} x ${palpite.placarB}` : '—'}
                        </span>
                      </td>
                    );
                  })}

                  <td className="px-3 py-3 text-center font-semibold text-amber-300 whitespace-nowrap">
                    {formatMoeda(p.valorAposta, p.moeda)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {p.pago ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                        ✓ Pago
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        ⏳ Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right font-display text-xl font-extrabold text-white whitespace-nowrap">
                    {p.pontos}
                    <span className="ml-1 text-xs font-medium text-slate-500">pts</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        🟢 verde = placar exato (3 pts) • 🔵 azul = acertou o resultado (1 pt) • cinza = sem
        pontuação
      </p>
    </div>
  );
}
