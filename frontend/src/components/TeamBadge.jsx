import { useState } from 'react';

// Mapeamento de cores, emoji (fallback) e nome do arquivo por seleção
const TEAM_STYLES = {
  Brasil: {
    gradient: 'from-yellow-400 via-green-500 to-blue-700',
    flag: '🇧🇷',
    file: 'brasil',
    text: 'text-yellow-300',
    ring: 'ring-yellow-400/40',
  },
  Marrocos: {
    gradient: 'from-red-600 via-red-700 to-emerald-700',
    flag: '🇲🇦',
    file: 'marrocos',
    text: 'text-red-400',
    ring: 'ring-red-500/40',
  },
  Haiti: {
    gradient: 'from-blue-700 via-blue-600 to-red-600',
    flag: '🇭🇹',
    file: 'haiti',
    text: 'text-blue-400',
    ring: 'ring-blue-500/40',
  },
  Escócia: {
    gradient: 'from-blue-800 via-blue-600 to-blue-400',
    flag: '🏴',
    file: 'escocia',
    text: 'text-sky-400',
    ring: 'ring-sky-500/40',
  },
};

const DEFAULT_STYLE = {
  gradient: 'from-slate-600 via-slate-500 to-slate-700',
  flag: '🏳️',
  file: null,
  text: 'text-slate-300',
  ring: 'ring-slate-400/40',
};

// Extensões testadas, em ordem de preferência
const EXTENSOES = ['png', 'webp', 'svg', 'jpg', 'jpeg'];

export function getTeamStyle(name) {
  return TEAM_STYLES[name] || DEFAULT_STYLE;
}

/**
 * Tenta carregar /flags/<file>.<ext> testando cada extensão da lista.
 * Se nenhuma existir, exibe o emoji de fallback.
 */
function FlagImage({ file, fallbackEmoji, alt }) {
  const [extIndex, setExtIndex] = useState(0);

  if (!file || extIndex >= EXTENSOES.length) {
    return <span className="drop-shadow-md">{fallbackEmoji}</span>;
  }

  const src = `/flags/${file}.${EXTENSOES[extIndex]}`;

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setExtIndex((i) => i + 1)}
      className="h-full w-full rounded-2xl object-cover"
      draggable={false}
    />
  );
}

export default function TeamBadge({ name, sigla, size = 'md' }) {
  const style = getTeamStyle(name);

  const sizes = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} ${sizes[size]} ring-2 ${style.ring} shadow-lg shrink-0`}
      >
        <FlagImage file={style.file} fallbackEmoji={style.flag} alt={name} />
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/10 mix-blend-overlay" />
      </div>
      <div className="text-center min-w-0 w-full">
        <p className="font-display font-bold text-sm sm:text-base text-white truncate leading-tight">
          {name}
        </p>
        {sigla && (
          <p className={`text-[10px] sm:text-xs font-semibold tracking-widest uppercase ${style.text}`}>
            {sigla}
          </p>
        )}
      </div>
    </div>
  );
}
