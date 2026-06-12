import TeamBadge from './TeamBadge';

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function GameCard({ jogo, palpite, onChange }) {
  const placarA = palpite?.placarA ?? '';
  const placarB = palpite?.placarB ?? '';
  const jaJogou = jogo.placarA !== null && jogo.placarB !== null;
  const aberto = jogo.apostasAbertas;

  let bannerStatus;
  if (jaJogou) {
    bannerStatus = (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
        ✓ Finalizado
      </span>
    );
  } else if (aberto) {
    bannerStatus = (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-400/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">
        🟢 Apostas abertas
      </span>
    );
  } else if (jogo.motivoBloqueio === 'aguardando_jogo_anterior') {
    bannerStatus = (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 border border-slate-400/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        🔒 Aguardando jogo anterior
      </span>
    );
  } else {
    bannerStatus = (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-400/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300">
        🔒 Apostas encerradas
      </span>
    );
  }

  const bloqueado = !aberto;

  return (
    <div
      className={`glass relative rounded-3xl p-5 sm:p-6 shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/30 ${
        bloqueado ? 'opacity-70' : ''
      }`}
    >
      {/* Header info */}
      <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          📅 {formatDate(jogo.data)} • {jogo.hora}
        </span>
        {bannerStatus}
      </div>

      {/* Teams + Score input */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <TeamBadge name={jogo.timeA} sigla={jogo.siglaA} size="lg" />

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <input
            type="number"
            min="0"
            max="99"
            value={placarA}
            onChange={(e) => onChange(jogo.id, 'placarA', e.target.value)}
            disabled={bloqueado}
            className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-pitch-900/80 border-2 border-white/10 text-center text-2xl sm:text-3xl font-extrabold text-white outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            placeholder="0"
          />
          <span className="font-display text-xl sm:text-2xl font-bold text-slate-500">×</span>
          <input
            type="number"
            min="0"
            max="99"
            value={placarB}
            onChange={(e) => onChange(jogo.id, 'placarB', e.target.value)}
            disabled={bloqueado}
            className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-pitch-900/80 border-2 border-white/10 text-center text-2xl sm:text-3xl font-extrabold text-white outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            placeholder="0"
          />
        </div>

        <TeamBadge name={jogo.timeB} sigla={jogo.siglaB} size="lg" />
      </div>

      {/* Real score (if finished) */}
      {jaJogou && (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-pitch-900/60 border border-white/5 py-2 text-sm">
          <span className="text-slate-500">Resultado real:</span>
          <span className="font-display font-bold text-white">
            {jogo.placarA} × {jogo.placarB}
          </span>
        </div>
      )}

      {/* Mensagem de bloqueio */}
      {bloqueado && !jaJogou && (
        <p className="mt-4 text-center text-xs text-slate-500">
          {jogo.motivoBloqueio === 'aguardando_jogo_anterior'
            ? 'Este jogo libera após o término do jogo anterior.'
            : 'O tempo para apostar neste jogo já encerrou.'}
        </p>
      )}
    </div>
  );
}
