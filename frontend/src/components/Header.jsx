export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'apostas', label: 'Minha Aposta', icon: '⚽' },
    { id: 'ranking', label: 'Classificação', icon: '🏆' },
    { id: 'admin', label: 'Admin', icon: '⚙️' },
  ];

  return (
    <header className="relative overflow-hidden">
      {/* Glow decorations */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-300">
            🇧🇷 Grupo C • Copa do Mundo 2026
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight">
            <span className="shimmer-text">Bolão da Copa</span>
          </h1>
          <p className="max-w-xl text-sm sm:text-base text-slate-400">
            Faça seu palpite, acompanhe o ranking em tempo real e dispute o maior
            prêmio do escritório!
          </p>
        </div>

        {/* Nav tabs */}
        <nav className="mt-8 flex justify-center">
          <div className="glass inline-flex rounded-2xl p-1.5 gap-1 shadow-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-4 sm:px-6 py-2.5 text-sm font-semibold transition-all duration-300
                  ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-pitch-900 shadow-lg shadow-emerald-500/30 scale-[1.03]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
