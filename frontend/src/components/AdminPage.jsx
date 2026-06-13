import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import TeamBadge from './TeamBadge';

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

const STATUS_LABEL = {
  aguardando_jogo_anterior: '🔒 Aguardando jogo anterior',
  tempo_esgotado: '🔒 Apostas encerradas',
};

export default function AdminPage({ onChange }) {
  const [config, setConfig] = useState(null);
  const [valorAposta, setValorAposta] = useState('');
  const [qrPreview, setQrPreview] = useState(null);
  const [pixCode, setPixCode] = useState('');
  const [salvandoPix, setSalvandoPix] = useState(false);
  const [jogos, setJogos] = useState([]);
  const [placares, setPlacares] = useState({});
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [salvandoPlacar, setSalvandoPlacar] = useState({});
  const [participantes, setParticipantes] = useState([]);
  const [atualizandoPart, setAtualizandoPart] = useState({});
  const [verificando, setVerificando] = useState(false);
  const [logVerificacao, setLogVerificacao] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const fileInputRef = useRef(null);

  const carregar = () => {
    api.getConfig().then((c) => {
      setConfig(c);
      setValorAposta(c.valorAposta);
      setQrPreview(c.qrCodeUrl || null);
      setPixCode(c.pixCode || '');
    });
    api.getJogos().then((data) => {
      setJogos(data);
      const map = {};
      data.forEach((j) => {
        map[j.id] = {
          placarA: j.placarA ?? '',
          placarB: j.placarB ?? '',
        };
      });
      setPlacares(map);
    });
    api.getParticipantes().then(setParticipantes);
  };

  useEffect(() => {
    carregar();
    const interval = setInterval(() => api.getJogos().then(setJogos), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSalvarConfig = async (e) => {
    e.preventDefault();
    setSalvandoConfig(true);
    try {
      await api.updateConfig({ valorAposta: Number(valorAposta) });
      setMensagem({ tipo: 'sucesso', texto: '✅ Configuração salva com sucesso!' });
      onChange?.();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setSalvandoConfig(false);
      setTimeout(() => setMensagem(null), 3000);
    }
  };

  // Converte a imagem escolhida para base64 e salva direto no config
  const handleImagemSelecionada = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setMensagem({ tipo: 'erro', texto: 'Imagem muito grande (máx. 4MB).' });
      setTimeout(() => setMensagem(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setQrPreview(base64);
      try {
        await api.updateConfig({ qrCodeUrl: base64 });
        setMensagem({ tipo: 'sucesso', texto: '✅ QR Code de pagamento atualizado!' });
        onChange?.();
      } catch (err) {
        setMensagem({ tipo: 'erro', texto: err.message });
      } finally {
        setTimeout(() => setMensagem(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoverQr = async () => {
    setQrPreview(null);
    try {
      await api.updateConfig({ qrCodeUrl: null });
      onChange?.();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
      setTimeout(() => setMensagem(null), 3000);
    }
  };

  const handleVerificarPlacares = async () => {
    setVerificando(true);
    setLogVerificacao(null);
    try {
      const resultado = await api.verificarPlacaresAgora();
      setLogVerificacao(resultado.log || []);
      carregar();
      onChange?.();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
      setTimeout(() => setMensagem(null), 3000);
    } finally {
      setVerificando(false);
    }
  };

  const handleTogglePago = async (id, pagoAtual) => {
    setAtualizandoPart((prev) => ({ ...prev, [id]: true }));
    try {
      await api.marcarPagamento(id, !pagoAtual);
      setParticipantes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, pago: !pagoAtual } : p))
      );
      onChange?.();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
      setTimeout(() => setMensagem(null), 3000);
    } finally {
      setAtualizandoPart((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleExcluirParticipante = async (id, nome) => {
    if (!window.confirm(`Remover "${nome}" e todos os seus palpites? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setAtualizandoPart((prev) => ({ ...prev, [id]: true }));
    try {
      await api.excluirParticipante(id);
      setParticipantes((prev) => prev.filter((p) => p.id !== id));
      setMensagem({ tipo: 'sucesso', texto: `✅ ${nome} removido(a).` });
      onChange?.();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setAtualizandoPart((prev) => ({ ...prev, [id]: false }));
      setTimeout(() => setMensagem(null), 3000);
    }
  };

  const handleSalvarPix = async (e) => {    e.preventDefault();
    setSalvandoPix(true);
    try {
      await api.updateConfig({ pixCode: pixCode.trim() });
      setMensagem({ tipo: 'sucesso', texto: '✅ Código Pix salvo com sucesso!' });
      onChange?.();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setSalvandoPix(false);
      setTimeout(() => setMensagem(null), 3000);
    }
  };

  const handleChangePlacar = (jogoId, campo, valor) => {
    const numero = valor === '' ? '' : Math.max(0, Math.min(99, Number(valor)));
    setPlacares((prev) => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], [campo]: numero },
    }));
  };

  const handleSalvarPlacar = async (jogoId) => {
    const p = placares[jogoId];
    setSalvandoPlacar((prev) => ({ ...prev, [jogoId]: true }));
    try {
      await api.updatePlacar(jogoId, p.placarA, p.placarB);
      setMensagem({ tipo: 'sucesso', texto: '✅ Placar atualizado! Ranking recalculado.' });
      carregar();
      onChange?.();
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setSalvandoPlacar((prev) => ({ ...prev, [jogoId]: false }));
      setTimeout(() => setMensagem(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          ⚙️ Área Administrativa
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Configure o valor da aposta, o QR Code de pagamento e os placares dos jogos
        </p>
      </div>

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

      {/* Config do valor da aposta */}
      <div className="glass mb-8 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-xl shadow-lg shadow-amber-500/30">
            💰
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Valor da Aposta
            </h3>
            <p className="text-xs text-slate-400">
              Valor cobrado de cada participante
            </p>
          </div>
        </div>
        <form onSubmit={handleSalvarConfig} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Valor por pessoa (R$)
            </label>
            <div className="flex items-center rounded-2xl border-2 border-white/10 bg-pitch-900/60 px-4 py-3 transition-all focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/20">
              <span className="mr-2 font-display font-bold text-amber-400">R$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valorAposta}
                onChange={(e) => setValorAposta(e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-white outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={salvandoConfig}
            className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 font-display font-bold text-pitch-900 shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
          >
            {salvandoConfig ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>

      {/* QR Code de pagamento */}
      <div className="glass mb-8 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 text-xl shadow-lg shadow-sky-500/30">
            📱
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              QR Code de Pagamento
            </h3>
            <p className="text-xs text-slate-400">
              Essa imagem aparece para os participantes na tela de apostas
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex h-32 w-32 sm:h-36 sm:w-36 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-pitch-900/40 overflow-hidden">
            {qrPreview ? (
              <img src={qrPreview} alt="QR Code" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl text-slate-600">📷</span>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={handleImagemSelecionada}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 px-6 py-3 font-display font-bold text-pitch-900 shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.03] active:scale-95"
            >
              {qrPreview ? 'Trocar imagem' : 'Enviar QR Code (PIX)'}
            </button>
            {qrPreview && (
              <button
                onClick={handleRemoverQr}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Remover QR Code
              </button>
            )}
            <p className="text-xs text-slate-500">
              Formatos aceitos: PNG, JPG, WEBP, SVG. Tamanho máximo: 4MB.
            </p>
          </div>
        </div>
      </div>

      {/* Código Pix Copia e Cola */}
      <div className="glass mb-8 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xl shadow-lg shadow-emerald-500/30">
            🔑
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Código Pix (Copia e Cola)
            </h3>
            <p className="text-xs text-slate-400">
              Os participantes poderão copiar esse código com um clique
            </p>
          </div>
        </div>

        <form onSubmit={handleSalvarPix} className="flex flex-col gap-4">
          <textarea
            value={pixCode}
            onChange={(e) => setPixCode(e.target.value)}
            placeholder="00020101021226820014BR.GOV.BCB.PIX..."
            rows={3}
            className="w-full resize-none rounded-2xl border-2 border-white/10 bg-pitch-900/60 px-4 py-3 text-sm font-mono text-white outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={salvandoPix}
            className="self-start rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 font-display font-bold text-pitch-900 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
          >
            {salvandoPix ? 'Salvando...' : 'Salvar código Pix'}
          </button>
        </form>
      </div>

      {/* Controle de Pagamentos */}
      <div className="glass mb-8 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 text-xl shadow-lg shadow-fuchsia-500/30">
            💳
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Controle de Pagamentos
            </h3>
            <p className="text-xs text-slate-400">
              Marque manualmente quem já pagou. Quem não pagar pode ser removido.
            </p>
          </div>
        </div>

        {participantes.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-6">
            Nenhum participante cadastrado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {participantes.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-pitch-900/40 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-600 font-display text-sm font-bold text-white">
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
                  <p className="truncate font-display font-bold text-white">{p.nome}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePago(p.id, p.pago)}
                    disabled={atualizandoPart[p.id]}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
                      p.pago
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'
                        : 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                    }`}
                  >
                    {p.pago ? '✓ Pago' : '⏳ Pendente'}
                  </button>
                  <button
                    onClick={() => handleExcluirParticipante(p.id, p.nome)}
                    disabled={atualizandoPart[p.id]}
                    className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs font-bold text-red-300 transition-all hover:bg-red-400/20 disabled:opacity-50"
                    title="Remover participante"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placares reais */}
      <div className="glass rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-xl shadow-lg shadow-emerald-500/30">
            ⚽
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Placares Oficiais
            </h3>
            <p className="text-xs text-slate-400">
              Insira o resultado real para calcular os pontos automaticamente. O
              sistema também tenta preencher automaticamente após o jogo terminar.
            </p>
          </div>
        </div>

        {/* Verificação manual de placares automáticos */}
        <div className="mb-5 flex flex-col gap-3">
          <button
            onClick={handleVerificarPlacares}
            disabled={verificando}
            className="self-start rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-2.5 text-sm font-display font-bold text-emerald-300 transition-all hover:bg-emerald-400/20 disabled:opacity-50"
          >
            {verificando ? '🔄 Verificando...' : '🔄 Verificar placares agora'}
          </button>

          {logVerificacao && (
            <div className="rounded-2xl border border-white/5 bg-pitch-900/40 p-4 text-xs text-slate-400">
              <p className="mb-2 font-bold text-slate-300">Resultado da verificação:</p>
              <ul className="flex flex-col gap-1">
                {logVerificacao.map((item, i) => (
                  <li key={i}>
                    <span className="text-slate-300">{item.jogo}</span>: {item.status}
                    {item.placar && (
                      <span className="text-emerald-300"> → {item.placar}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {jogos.map((jogo) => (
            <div
              key={jogo.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-white/5 bg-pitch-900/40 p-4"
            >
              <div className="flex flex-1 items-center justify-between gap-3 sm:gap-6">
                <TeamBadge name={jogo.timeA} sigla={jogo.siglaA} size="sm" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(jogo.data)} • {jogo.hora}
                  </span>
                  {!jogo.apostasAbertas && jogo.placarA === null && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 whitespace-nowrap">
                      {STATUS_LABEL[jogo.motivoBloqueio]}
                    </span>
                  )}
                  {jogo.apostasAbertas && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 whitespace-nowrap">
                      🟢 Apostas abertas
                    </span>
                  )}
                </div>
                <TeamBadge name={jogo.timeB} sigla={jogo.siglaB} size="sm" />
              </div>

              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={placares[jogo.id]?.placarA ?? ''}
                  onChange={(e) => handleChangePlacar(jogo.id, 'placarA', e.target.value)}
                  placeholder="-"
                  className="w-12 h-12 rounded-xl bg-pitch-900 border-2 border-white/10 text-center text-lg font-bold text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
                <span className="text-slate-500">×</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={placares[jogo.id]?.placarB ?? ''}
                  onChange={(e) => handleChangePlacar(jogo.id, 'placarB', e.target.value)}
                  placeholder="-"
                  className="w-12 h-12 rounded-xl bg-pitch-900 border-2 border-white/10 text-center text-lg font-bold text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>

              <button
                onClick={() => handleSalvarPlacar(jogo.id)}
                disabled={salvandoPlacar[jogo.id]}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2.5 text-sm font-display font-bold text-pitch-900 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                {salvandoPlacar[jogo.id] ? 'Salvando...' : 'Salvar placar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
