import { useEffect, useState } from 'react';
import { api } from '../services/api';
import GameCard from './GameCard';

export default function ApostasPage({ onPalpiteSalvo }) {
  const [nome, setNome] = useState('');
  const [nomeConfirmado, setNomeConfirmado] = useState(null); // {id, nome}
  const [jogos, setJogos] = useState([]);
  const [palpites, setPalpites] = useState({}); // jogoId -> {placarA, placarB}
  const [config, setConfig] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  // Carrega jogos e config
  const carregarJogos = () => {
    api.getJogos().then(setJogos).catch(() => {});
  };

  useEffect(() => {
    carregarJogos();
    api.getConfig().then(setConfig).catch(() => {});

    // Atualiza status dos jogos periodicamente (travas por horário)
    const interval = setInterval(carregarJogos, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Tenta recuperar participante salvo no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bolao_participante');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNomeConfirmado(parsed);
        setNome(parsed.nome);
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Carrega palpites existentes quando o participante é identificado
  useEffect(() => {
    if (!nomeConfirmado) return;
    setCarregando(true);
    api
      .getPalpitesDoParticipante(nomeConfirmado.id)
      .then((data) => {
        const map = {};
        data.forEach((p) => {
          map[p.jogoId] = { placarA: p.placarA, placarB: p.placarB };
        });
        setPalpites(map);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [nomeConfirmado]);

  const handleEntrar = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setCarregando(true);
    try {
      const participante = await api.criarParticipante(nome.trim());
      setNomeConfirmado(participante);
      localStorage.setItem('bolao_participante', JSON.stringify(participante));
      setMensagem({ tipo: 'sucesso', texto: `Bem-vindo(a), ${participante.nome}! 🎉` });
      onPalpiteSalvo?.();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setCarregando(false);
      setTimeout(() => setMensagem(null), 4000);
    }
  };

  const handleTrocarUsuario = () => {
    localStorage.removeItem('bolao_participante');
    setNomeConfirmado(null);
    setPalpites({});
    setNome('');
  };

  const handleChangePalpite = (jogoId, campo, valor) => {
    const numero = valor === '' ? '' : Math.max(0, Math.min(99, Number(valor)));
    setPalpites((prev) => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], [campo]: numero },
    }));
  };

  const handleSalvarTodos = async () => {
    if (!nomeConfirmado) return;
    setSalvando(true);
    setMensagem(null);
    try {
      // Apenas jogos com apostas abertas e palpite preenchido
      const jogosAbertos = new Set(jogos.filter((j) => j.apostasAbertas).map((j) => j.id));

      const entradas = Object.entries(palpites).filter(
        ([jogoId, v]) =>
          jogosAbertos.has(Number(jogoId)) &&
          v?.placarA !== '' &&
          v?.placarB !== '' &&
          v?.placarA !== undefined &&
          v?.placarB !== undefined
      );

      if (entradas.length === 0) {
        setMensagem({
          tipo: 'erro',
          texto: 'Preencha pelo menos um palpite (em um jogo com apostas abertas) antes de salvar.',
        });
        setSalvando(false);
        return;
      }

      const erros = [];
      for (const [jogoId, p] of entradas) {
        try {
          await api.salvarPalpite({
            participanteId: nomeConfirmado.id,
            jogoId: Number(jogoId),
            placarA: p.placarA,
            placarB: p.placarB,
          });
        } catch (err) {
          erros.push(err.message);
        }
      }

      if (erros.length > 0) {
        setMensagem({ tipo: 'erro', texto: erros[0] });
      } else {
        setMensagem({ tipo: 'sucesso', texto: '✅ Palpites salvos com sucesso! Boa sorte!' });
      }

      carregarJogos();
      onPalpiteSalvo?.();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagem(null), 5000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      {/* Identificação do participante */}
      {!nomeConfirmado ? (
        <div className="glass mx-auto max-w-md rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl shadow-lg shadow-emerald-500/30">
              👤
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Quem é você?</h2>
            <p className="mt-1 text-sm text-slate-400">
              Digite seu nome para começar a apostar
            </p>
          </div>
          <form onSubmit={handleEntrar} className="flex flex-col gap-4">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full rounded-2xl border-2 border-white/10 bg-pitch-900/60 px-5 py-3.5 text-center text-lg font-medium text-white outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 placeholder:text-slate-500"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 font-display font-bold text-pitch-900 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:shadow-emerald-500/50 active:scale-[0.98] disabled:opacity-50"
            >
              {carregando ? 'Entrando...' : 'Entrar no bolão →'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Banner do usuário */}
          <div className="glass mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 font-display text-lg font-bold text-pitch-900 shadow-lg shadow-emerald-500/30">
                {nomeConfirmado.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Apostando como</p>
                <p className="font-display text-lg font-bold text-white">{nomeConfirmado.nome}</p>
              </div>
            </div>
            <button
              onClick={handleTrocarUsuario}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Trocar usuário
            </button>
          </div>

          {/* QR Code de pagamento */}
          {config?.qrCodeUrl && (
            <div className="glass mb-8 flex flex-col sm:flex-row items-center gap-5 rounded-3xl p-5 sm:p-6">
              <img
                src={config.qrCodeUrl}
                alt="QR Code para pagamento"
                className="h-32 w-32 sm:h-36 sm:w-36 rounded-2xl border-2 border-white/10 object-cover shrink-0"
              />
              <div className="text-center sm:text-left">
                <h3 className="font-display text-lg font-bold text-white">
                  💳 Pagamento da aposta
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Escaneie o QR Code acima para realizar o pagamento de{' '}
                  <strong className="text-emerald-300">
                    {config.moeda} {Number(config.valorAposta).toFixed(2)}
                  </strong>{' '}
                  referente à sua participação no bolão.
                </p>
              </div>
            </div>
          )}

          {/* Mensagem de feedback */}
          {mensagem && (
            <div
              className={`mb-6 rounded-2xl border px-5 py-3 text-sm font-semibold ${
                mensagem.tipo === 'sucesso'
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                  : 'border-red-400/30 bg-red-400/10 text-red-300'
              }`}
            >
              {mensagem.texto}
            </div>
          )}

          {/* Jogos */}
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              ⚽ Seus Palpites
            </h2>
          </div>
          <p className="mb-6 text-sm text-slate-400">
            Cada jogo libera para apostas após o término do anterior, e fecha {' '}
            <strong className="text-amber-300">30 minutos antes</strong> do início.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jogos.map((jogo) => (
              <GameCard
                key={jogo.id}
                jogo={jogo}
                palpite={palpites[jogo.id]}
                onChange={handleChangePalpite}
              />
            ))}
          </div>

          {/* Botão salvar */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSalvarTodos}
              disabled={salvando}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 px-10 py-4 font-display text-lg font-extrabold text-pitch-900 shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/50 active:scale-95 disabled:opacity-50"
            >
              <span className="relative z-10">
                {salvando ? '💾 Salvando...' : '💾 Salvar meus palpites'}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
