import TeamBadge from './TeamBadge';

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
}

const STATUS_CONFIG = {
  aberto: {
    label: 'Apostas abertas',
    icon: '🟢',
    classes: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
  },
  finalizado: {
    label: 'Finalizado',
    icon: '✓',
    classes: 'bg-sky-500/15 border-sky-400/30 text-sky-300',
  },
  aguardando: {
    label: 'Em breve',
    icon: '⏳',
    classes: 'bg-slate-500/15 border-slate-400/30 text-slate-400',
  },
  encerrado: {
    label: 'Encerrado',
    icon: '🔒',
    classes: 'bg-red-500/15 border-red-400/30 text-red-300',
  },
};

export default function GameCard({ jogo, palpite, onChange }) {
  const placarA = palpite?.placarA ?? '';
  const placarB = palpite?.placarB ?? '';
  const jaJogou = jogo.placarA !== null && jogo.placarB !== null;
  const aberto = jogo.apostasAbertas;

  let statusKey = 'aberto';
  if (jaJogou) statusKey = 'finalizado';
  else if (!aberto && jogo.motivoBloqueio === 'aguardando_jogo_anterior') statusKey = 'aguardando';
  else if (!aberto) statusKey = 'encerrado';

  const status = STATUS_CONFIG[statusKey];
  const bloqueado = !aberto;

  return (
    <div
      className={`glass flex flex-col gap-4 rounded-3xl p-5 shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/30 ${
        bloqueado ? 'opacity-75' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          📅 {formatDate(jogo.data)} • {jogo.hora}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${status.classes}`}
        >
          {status.icon} {status.label}
        </span>
      </div>

      {/* Teams + Score */}
      <div className="grid grid-cols-[2fr_auto_2fr] items-start gap-2">
        <TeamBadge name={jogo.timeA} sigla={jogo.siglaA} size="md" />

        <div className="flex items-center gap-1.5 pt-2.5">
          <input
            type="number"
            min="0"
            max="99"
            value={placarA}
            onChange={(e) => onChange(jogo.id, 'placarA', e.target.value)}
            disabled={bloqueado}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-pitch-900/80 border-2 border-white/10 text-center text-lg sm:text-xl font-extrabold text-white outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            placeholder="-"
          />
          <span className="text-sm font-bold text-slate-600">×</span>
          <input
            type="number"
            min="0"
            max="99"
            value={placarB}
            onChange={(e) => onChange(jogo.id, 'placarB', e.target.value)}
            disabled={bloqueado}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-pitch-900/80 border-2 border-white/10 text-center text-lg sm:text-xl font-extrabold text-white outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            placeholder="-"
          />
        </div>

        <TeamBadge name={jogo.timeB} sigla={jogo.siglaB} size="md" />
      </div>

      {/* Resultado real ou aviso de bloqueio */}
      {jaJogou ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-pitch-900/60 border border-white/5 py-2 text-xs">
          <span className="text-slate-500">Resultado oficial:</span>
          <span className="font-display font-bold text-white">
            {jogo.placarA} × {jogo.placarB}
          </span>
        </div>
      ) : bloqueado ? (
        <p className="text-center text-[11px] text-slate-500 -mt-1">
          {jogo.motivoBloqueio === 'aguardando_jogo_anterior'
            ? 'Libera após o término do jogo anterior'
            : 'Tempo para apostar encerrado'}
        </p>
      ) : null}
    </div>
  );
}
