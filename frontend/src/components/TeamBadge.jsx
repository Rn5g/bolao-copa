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

/**
 * Exibe a bandeira em cima e o nome/sigla abaixo, centralizados.
 * Layout vertical evita que nomes longos (ex: "Marrocos", "Escócia")
 * fiquem cortados ou vazem do card.
 */
export default function TeamBadge({ name, sigla, size = 'md' }) {
  const style = getTeamStyle(name);

  const sizes = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0 w-full">
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${style.gradient} ${sizes[size]} ring-2 ${style.ring} shadow-md`}
      >
        <FlagImage countryCode={style.countryCode} sigla={sigla} alt={name} />
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/10 mix-blend-overlay" />
      </div>
      <div className="flex flex-col items-center text-center w-full px-0.5">
        <p className="font-display font-bold text-[11px] sm:text-xs text-white leading-tight break-words">
          {name}
        </p>
        {sigla && (
          <p className={`text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase ${style.text}`}>
            {sigla}
          </p>
        )}
      </div>
    </div>
  );
}
