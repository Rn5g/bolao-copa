// Em produção (Vercel), defina VITE_API_URL = https://seu-backend.onrender.com/api
// Em desenvolvimento local, deixa em branco e o proxy do vite.config.js cuida do resto.
const API_URL = import.meta.env.VITE_API_URL || '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(err.error || 'Erro na requisição');
  }
  return res.json();
}

export const api = {
  // Config
  getConfig: () => fetch(`${API_URL}/config`).then(handleResponse),
  updateConfig: (data) =>
    fetch(`${API_URL}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Jogos
  getJogos: () => fetch(`${API_URL}/jogos`).then(handleResponse),
  updatePlacar: (id, placarA, placarB) =>
    fetch(`${API_URL}/jogos/${id}/placar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placarA, placarB }),
    }).then(handleResponse),

  // Participantes
  getParticipantes: () => fetch(`${API_URL}/participantes`).then(handleResponse),
  criarParticipante: (nome) =>
    fetch(`${API_URL}/participantes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    }).then(handleResponse),
  getPalpitesDoParticipante: (id) =>
    fetch(`${API_URL}/participantes/${id}/palpites`).then(handleResponse),
  marcarPagamento: (id, pago) =>
    fetch(`${API_URL}/participantes/${id}/pagamento`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pago }),
    }).then(handleResponse),
  excluirParticipante: (id) =>
    fetch(`${API_URL}/participantes/${id}`, { method: 'DELETE' }).then(handleResponse),
  verificarPlacaresAgora: () =>
    fetch(`${API_URL}/admin/verificar-placares`, { method: 'POST' }).then(handleResponse),

  // Palpites
  salvarPalpite: (data) =>
    fetch(`${API_URL}/palpites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Ranking
  getRanking: () => fetch(`${API_URL}/ranking`).then(handleResponse),

  // Resumo
  getResumo: () => fetch(`${API_URL}/resumo`).then(handleResponse),
};
