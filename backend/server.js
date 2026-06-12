require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Defina SUPABASE_URL e SUPABASE_KEY no arquivo .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json({ limit: '5mb' })); // limite maior por causa da imagem do QR Code (base64)

// Minutos de antecedência para travar apostas antes do jogo começar
const MINUTOS_TRAVA = 30;

// ----------------- Helpers de conversão (snake_case <-> camelCase) -----------------
function configToApi(c) {
  return {
    valorAposta: Number(c.valor_aposta),
    moeda: c.moeda,
    qrCodeUrl: c.qr_code_url || null,
  };
}

function calcularPontos(palpiteA, palpiteB, placarA, placarB) {
  if (placarA === null || placarB === null) return 0;
  if (palpiteA === placarA && palpiteB === placarB) return 3;
  const resultadoPalpite = Math.sign(palpiteA - palpiteB);
  const resultadoReal = Math.sign(placarA - placarB);
  if (resultadoPalpite === resultadoReal) return 1;
  return 0;
}

// Calcula o horário (Date) do início do jogo, assumindo fuso de Brasília (UTC-3)
function getKickoff(jogo) {
  // jogo.data = 'YYYY-MM-DD', jogo.hora = 'HH:MM'
  return new Date(`${jogo.data}T${jogo.hora}:00-03:00`);
}

/**
 * Decide se as apostas de um jogo estão liberadas, considerando:
 * 1. O jogo precisa estar "na vez" — ou é o 1º jogo, ou o jogo anterior já tem placar definido.
 * 2. Não pode estar a menos de MINUTOS_TRAVA minutos do início (ou já ter começado).
 */
function calcularStatusJogos(jogosOrdenados) {
  const agora = new Date();

  return jogosOrdenados.map((jogo, index) => {
    const kickoff = getKickoff(jogo);
    const limiteTrava = new Date(kickoff.getTime() - MINUTOS_TRAVA * 60 * 1000);

    const anterior = index > 0 ? jogosOrdenados[index - 1] : null;
    const anteriorFinalizado =
      !anterior || (anterior.placar_a !== null && anterior.placar_b !== null);

    const dentroDoPrazo = agora < limiteTrava;

    const apostasAbertas = anteriorFinalizado && dentroDoPrazo;

    let motivoBloqueio = null;
    if (!apostasAbertas) {
      if (!anteriorFinalizado) {
        motivoBloqueio = 'aguardando_jogo_anterior';
      } else if (!dentroDoPrazo) {
        motivoBloqueio = 'tempo_esgotado';
      }
    }

    return {
      id: jogo.id,
      timeA: jogo.time_a,
      timeB: jogo.time_b,
      siglaA: jogo.sigla_a,
      siglaB: jogo.sigla_b,
      data: jogo.data,
      hora: jogo.hora,
      grupo: jogo.grupo,
      placarA: jogo.placar_a,
      placarB: jogo.placar_b,
      apostasAbertas,
      motivoBloqueio,
    };
  });
}

// ----------------- Rotas: Config -----------------
app.get('/api/config', async (req, res) => {
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(configToApi(data));
});

app.put('/api/config', async (req, res) => {
  const { valorAposta, moeda, qrCodeUrl } = req.body;
  const updates = {};
  if (valorAposta !== undefined) updates.valor_aposta = Number(valorAposta);
  if (moeda !== undefined) updates.moeda = moeda;
  if (qrCodeUrl !== undefined) updates.qr_code_url = qrCodeUrl;

  const { data, error } = await supabase
    .from('config')
    .update(updates)
    .eq('id', 1)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(configToApi(data));
});

// ----------------- Rotas: Jogos -----------------
app.get('/api/jogos', async (req, res) => {
  const { data, error } = await supabase
    .from('jogos')
    .select('*')
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(calcularStatusJogos(data));
});

app.put('/api/jogos/:id/placar', async (req, res) => {
  const id = Number(req.params.id);
  const { placarA, placarB } = req.body;

  const updates = {
    placar_a: placarA === '' || placarA === null ? null : Number(placarA),
    placar_b: placarB === '' || placarB === null ? null : Number(placarB),
  };

  const { data, error } = await supabase
    .from('jogos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Jogo não encontrado' });

  const { data: todos } = await supabase.from('jogos').select('*').order('id', { ascending: true });
  const [jogoAtualizado] = calcularStatusJogos(todos).filter((j) => j.id === id);

  res.json(jogoAtualizado);
});

// ----------------- Rotas: Participantes -----------------
app.get('/api/participantes', async (req, res) => {
  const { data, error } = await supabase
    .from('participantes')
    .select('*')
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/participantes', async (req, res) => {
  const { nome } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }
  const nomeNormalizado = nome.trim();

  const { data: existente, error: errBusca } = await supabase
    .from('participantes')
    .select('*')
    .ilike('nome', nomeNormalizado)
    .maybeSingle();

  if (errBusca) return res.status(500).json({ error: errBusca.message });
  if (existente) return res.json(existente);

  const { data, error } = await supabase
    .from('participantes')
    .insert({ nome: nomeNormalizado })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/participantes/:id/palpites', async (req, res) => {
  const participanteId = Number(req.params.id);

  const { data, error } = await supabase
    .from('palpites')
    .select('*')
    .eq('participante_id', participanteId);

  if (error) return res.status(500).json({ error: error.message });

  res.json(
    data.map((p) => ({
      id: p.id,
      participanteId: p.participante_id,
      jogoId: p.jogo_id,
      placarA: p.placar_a,
      placarB: p.placar_b,
    }))
  );
});

// ----------------- Rotas: Palpites -----------------
app.post('/api/palpites', async (req, res) => {
  const { participanteId, jogoId, placarA, placarB } = req.body;

  if (
    participanteId === undefined ||
    jogoId === undefined ||
    placarA === undefined ||
    placarB === undefined ||
    placarA === '' ||
    placarB === ''
  ) {
    return res.status(400).json({ error: 'Dados incompletos para o palpite' });
  }

  // Verifica se as apostas para esse jogo ainda estão abertas
  const { data: jogo, error: errJogo } = await supabase
    .from('jogos')
    .select('*')
    .eq('id', Number(jogoId))
    .single();

  if (errJogo) return res.status(500).json({ error: errJogo.message });
  if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });

  const { data: todos } = await supabase.from('jogos').select('*').order('id', { ascending: true });
  const [status] = calcularStatusJogos(todos).filter((j) => j.id === Number(jogoId));

  if (!status.apostasAbertas) {
    return res.status(403).json({ error: 'As apostas para este jogo estão fechadas.' });
  }

  const { data, error } = await supabase
    .from('palpites')
    .upsert(
      {
        participante_id: Number(participanteId),
        jogo_id: Number(jogoId),
        placar_a: Number(placarA),
        placar_b: Number(placarB),
      },
      { onConflict: 'participante_id,jogo_id' }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    id: data.id,
    participanteId: data.participante_id,
    jogoId: data.jogo_id,
    placarA: data.placar_a,
    placarB: data.placar_b,
  });
});

// ----------------- Rota: Ranking -----------------
app.get('/api/ranking', async (req, res) => {
  const [
    { data: participantes, error: e1 },
    { data: palpites, error: e2 },
    { data: jogos, error: e3 },
    { data: config, error: e4 },
  ] = await Promise.all([
    supabase.from('participantes').select('*'),
    supabase.from('palpites').select('*'),
    supabase.from('jogos').select('*').order('id', { ascending: true }),
    supabase.from('config').select('*').eq('id', 1).single(),
  ]);

  if (e1) return res.status(500).json({ error: e1.message });
  if (e2) return res.status(500).json({ error: e2.message });
  if (e3) return res.status(500).json({ error: e3.message });
  if (e4) return res.status(500).json({ error: e4.message });

  const ranking = participantes.map((participante) => {
    const palpitesDoParticipante = palpites.filter(
      (p) => p.participante_id === participante.id
    );

    let pontos = 0;
    let placaresExatos = 0;
    let acertosResultado = 0;
    let jogosPalpitados = palpitesDoParticipante.length;

    // Palpites detalhados, na ordem dos jogos, para exibir no ranking
    const palpitesPorJogo = jogos.map((jogo) => {
      const palpite = palpitesDoParticipante.find((p) => p.jogo_id === jogo.id);
      if (!palpite) {
        return { jogoId: jogo.id, placarA: null, placarB: null, pontos: 0 };
      }
      const pts = calcularPontos(
        palpite.placar_a,
        palpite.placar_b,
        jogo.placar_a,
        jogo.placar_b
      );
      pontos += pts;
      if (pts === 3) placaresExatos++;
      if (pts === 1) acertosResultado++;

      return {
        jogoId: jogo.id,
        placarA: palpite.placar_a,
        placarB: palpite.placar_b,
        pontos: pts,
      };
    });

    return {
      id: participante.id,
      nome: participante.nome,
      pontos,
      placaresExatos,
      acertosResultado,
      jogosPalpitados,
      valorAposta: Number(config.valor_aposta),
      moeda: config.moeda,
      palpites: palpitesPorJogo,
    };
  });

  ranking.sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.placaresExatos !== a.placaresExatos) return b.placaresExatos - a.placaresExatos;
    return a.nome.localeCompare(b.nome);
  });

  res.json({
    jogos: jogos.map((j) => ({
      id: j.id,
      timeA: j.time_a,
      timeB: j.time_b,
      siglaA: j.sigla_a,
      siglaB: j.sigla_b,
    })),
    ranking,
  });
});

// ----------------- Rota: Resumo / Arrecadação -----------------
app.get('/api/resumo', async (req, res) => {
  const [{ count: totalParticipantes, error: e1 }, { data: config, error: e2 }, { count: totalJogos, error: e3 }] =
    await Promise.all([
      supabase.from('participantes').select('*', { count: 'exact', head: true }),
      supabase.from('config').select('*').eq('id', 1).single(),
      supabase.from('jogos').select('*', { count: 'exact', head: true }),
    ]);

  if (e1) return res.status(500).json({ error: e1.message });
  if (e2) return res.status(500).json({ error: e2.message });
  if (e3) return res.status(500).json({ error: e3.message });

  const valorAposta = Number(config.valor_aposta);
  const totalArrecadado = totalParticipantes * valorAposta;

  res.json({
    totalParticipantes,
    valorAposta,
    totalArrecadado,
    moeda: config.moeda,
    totalJogos,
  });
});

// ----------------- Atualização automática de placares -----------------
// Mapa de nomes em português -> inglês, usado para consultar a TheSportsDB
const NOME_API = {
  Brasil: 'Brazil',
  Marrocos: 'Morocco',
  Haiti: 'Haiti',
  Escócia: 'Scotland',
};

// Usa a API gratuita TheSportsDB (chave de teste pública "3") para tentar
// localizar o placar de um confronto específico em uma determinada data.
async function buscarPlacarAutomatico(jogo) {
  const timeA = NOME_API[jogo.time_a] || jogo.time_a;
  const timeB = NOME_API[jogo.time_b] || jogo.time_b;

  const url = `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encodeURIComponent(
    `${timeA}_vs_${timeB}`
  )}&s=2026`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();
    const evento = json?.event?.[0];
    if (!evento) return null;

    // A API retorna intHomeScore / intAwayScore quando o jogo termina
    if (evento.intHomeScore === null || evento.intAwayScore === null) return null;
    if (evento.intHomeScore === undefined || evento.intAwayScore === undefined) return null;

    // Verifica se o "home" da API corresponde ao timeA do nosso jogo
    const homeIsTimeA = (evento.strHomeTeam || '').toLowerCase().includes(timeA.toLowerCase());

    return homeIsTimeA
      ? { placarA: Number(evento.intHomeScore), placarB: Number(evento.intAwayScore) }
      : { placarA: Number(evento.intAwayScore), placarB: Number(evento.intHomeScore) };
  } catch (err) {
    console.error('Erro ao buscar placar automático:', err.message);
    return null;
  }
}

async function atualizarPlacaresAutomaticamente() {
  const { data: jogos, error } = await supabase.from('jogos').select('*').order('id', { ascending: true });
  if (error) return;

  const agora = new Date();

  for (const jogo of jogos) {
    // Só tenta atualizar jogos que já começaram e ainda não têm placar
    const kickoff = getKickoff(jogo);
    if (jogo.placar_a !== null || jogo.placar_b !== null) continue;
    if (agora < kickoff) continue;

    const resultado = await buscarPlacarAutomatico(jogo);
    if (resultado) {
      await supabase
        .from('jogos')
        .update({ placar_a: resultado.placarA, placar_b: resultado.placarB })
        .eq('id', jogo.id);

      console.log(
        `✅ Placar atualizado automaticamente: ${jogo.time_a} ${resultado.placarA} x ${resultado.placarB} ${jogo.time_b}`
      );
    }
  }
}

// Roda a verificação a cada 5 minutos
const CINCO_MINUTOS = 5 * 60 * 1000;
setInterval(atualizarPlacaresAutomaticamente, CINCO_MINUTOS);
// Roda uma vez já no início também
atualizarPlacaresAutomaticamente();

app.listen(PORT, () => {
  console.log(`🏆 Servidor do Bolão da Copa rodando em http://localhost:${PORT}`);
  console.log(`⏱️  Apostas travam ${MINUTOS_TRAVA} minutos antes de cada jogo.`);
  console.log(`🔄 Verificação automática de placares a cada 5 minutos.`);
});
