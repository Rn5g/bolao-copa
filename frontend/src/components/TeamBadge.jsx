import { useState } from 'react';

// Mapeamento de cores, código de país (FlagCDN) e sigla por seleção.
// As bandeiras são carregadas automaticamente via flagcdn.com — não é
// necessário enviar nenhuma imagem manualmente!
const TEAM_STYLES = {
  Brasil: {
    gradient: 'from-yellow-400 via-green-500 to-blue-700',
    countryCode: 'br',
    text: 'text-yellow-300',
    ring: 'ring-yellow-400/40',
  },
  Marrocos: {
    gradient: 'from-red-600 via-red-700 to-emerald-700',
    countryCode: 'ma',
    text: 'text-red-400',
    ring: 'ring-red-500/40',
  },
  Haiti: {
    gradient: 'from-blue-700 via-blue-600 to-red-600',
    countryCode: 'ht',
    text: 'text-blue-400',
    ring: 'ring-blue-500/40',
  },
  Escócia: {
    gradient: 'from-blue-800 via-blue-600 to-blue-400',
    countryCode: 'gb-sct', // bandeira específica da Escócia (Cruz de Santo André)
    text: 'text-sky-400',
    ring: 'ring-sky-500/40',
  },
};

const DEFAULT_STYLE = {
  gradient: 'from-slate-600 via-slate-500 to-slate-700',
  countryCode: null,
  text: 'text-slate-300',
  ring: 'ring-slate-400/40',
};

export function getTeamStyle(name) {
  return TEAM_STYLES[name] || DEFAULT_STYLE;
}

function FlagImage({ countryCode, sigla, alt }) {
  const [erro, setErro] = useState(false);

  if (!countryCode || erro) {
    return <span className="text-[10px] font-black tracking-wide text-white/90">{sigla}</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w160/${countryCode}.png`}
      alt={alt}
      onError={() => setErro(true)}
      className="h-full w-full rounded-xl object-cover"
      draggable={false}
      loading="lazy"
    />
  );
}

export default function TeamBadge({ name, sigla, size = 'md', align = 'left' }) {
  const style = getTeamStyle(name);

  const sizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-16 h-16',
  };

  const alignClasses =
    align === 'right'
      ? 'items-end text-right'
      : align === 'center'
        ? 'items-center text-center'
        : 'items-start text-left';

  return (
    <div className={`flex ${alignClasses} gap-2.5 min-w-0 overflow-hidden`}>
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${style.gradient} ${sizes[size]} ring-2 ${style.ring} shadow-md`}
      >
        <FlagImage countryCode={style.countryCode} sigla={sigla} alt={name} />
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/10 mix-blend-overlay" />
      </div>
      <div className="min-w-0 flex flex-col justify-center overflow-hidden">
        <p className="font-display font-bold text-xs sm:text-sm text-white truncate leading-tight">
          {name}
        </p>
        {sigla && (
          <p className={`text-[10px] font-semibold tracking-widest uppercase truncate ${style.text}`}>
            {sigla}
          </p>
        )}
      </div>
    </div>
  );
}
