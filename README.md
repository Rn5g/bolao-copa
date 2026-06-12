# 🏆 Bolão da Copa do Mundo 2026

Aplicativo web para gerenciar o bolão da Copa do Mundo no escritório: apostas,
arrecadação automática, ranking e área administrativa para placares oficiais.

- **Frontend:** React + Vite + Tailwind CSS (dark mode)
- **Backend:** Node.js + Express
- **Persistência:** arquivo JSON local (`backend/db.json`) — sem necessidade de banco de dados

---

## 📁 Estrutura do projeto

```
bolao-copa/
├── backend/
│   ├── server.js      # API Express
│   ├── db.json         # "banco de dados" em JSON (já vem com os jogos do Grupo C)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── services/api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Como rodar (passo a passo)

### 1. Instalar dependências do Backend

Abra um terminal, entre na pasta `backend` e instale as dependências:

```bash
cd bolao-copa/backend
npm install
```

### 2. Rodar o Backend

```bash
npm start
```

Você verá a mensagem:
```
🏆 Servidor do Bolão da Copa rodando em http://localhost:3001
```

> Deixe esse terminal aberto.

### 3. Instalar dependências do Frontend

Abra **outro terminal** (deixe o backend rodando no primeiro), entre na pasta `frontend`:

```bash
cd bolao-copa/frontend
npm install
```

### 4. Rodar o Frontend

```bash
npm run dev
```

O Vite vai mostrar algo como:
```
Local:   http://localhost:5173/
```

### 5. Acessar o sistema

Abra o navegador em **http://localhost:5173**

O frontend já está configurado (via proxy no `vite.config.js`) para conversar com o
backend em `http://localhost:3001` automaticamente.

---

## ⚙️ Funcionalidades

### Para participantes (aba "Minha Aposta")
- Digite seu nome (não precisa de senha/cadastro complexo).
- Preencha o palpite de placar para cada jogo do Grupo C.
- Clique em "Salvar meus palpites".
- O nome fica salvo no navegador (localStorage) para facilitar o retorno.

### Painel de Arrecadação
- Mostra automaticamente o **Valor Acumulado Total** = nº de participantes × valor da aposta.
- Atualiza em tempo real conforme novas pessoas entram no bolão.

### Ranking (aba "Classificação")
- Calcula pontos automaticamente:
  - **3 pontos** — acertou o placar exato.
  - **1 ponto** — acertou apenas o resultado (vencedor ou empate).
  - **0 pontos** — errou.
- Ordenado do maior para o menor pontuador.

### Admin (aba "Admin")
- Define o **valor da aposta por pessoa**.
- Insere o **placar real** de cada jogo — o ranking recalcula automaticamente.

---

## 🗃️ Jogos pré-cadastrados (Grupo C)

| Data       | Hora  | Jogo                  |
|------------|-------|-----------------------|
| 13/06/2026 | 19:00 | Brasil x Marrocos     |
| 19/06/2026 | 21:30 | Brasil x Haiti        |
| 24/06/2026 | 19:00 | Escócia x Brasil      |

Para alterar/adicionar jogos, edite o array `jogos` em `backend/db.json` (ou crie
uma rota administrativa adicional, se desejar).

---

## 🌐 Acesso de outras pessoas na rede (intranet)

Por padrão, o backend escuta em todas as interfaces. Para que colegas acessem pelo
seu IP de rede:

1. Descubra o IP da sua máquina (ex: `10.14.86.250`).
2. No backend, ele já roda em `0.0.0.0:3001` por padrão do Express.
3. No frontend, rode com:
   ```bash
   npm run dev -- --host
   ```
4. Compartilhe o link exibido, algo como `http://10.14.86.250:5173`.

> Obs: se o frontend acessar via IP, ajuste o proxy do `vite.config.js` (target)
> para o mesmo IP, ou rode o backend acessível por `0.0.0.0` (já é o padrão).

---

## 🎨 Customização visual

O tema (cores, fontes, animações) está centralizado em `frontend/src/index.css`,
no bloco `@theme`. As cores de cada seleção (bandeira/gradiente) estão em
`frontend/src/components/TeamBadge.jsx` — fácil de adicionar novos times.

Bom bolão! 🇧🇷⚽🏆

---

## 🆕 Novidades: automações e regras

- **Travamento automático**: as apostas de cada jogo fecham **30 minutos antes** do horário marcado.
- **Liberação sequencial**: o 1º jogo (Brasil x Marrocos) já nasce liberado. Os demais só liberam depois que o jogo anterior tiver o placar real preenchido (manual ou automático).
- **Atualização automática de placar**: o backend verifica a cada 5 minutos (via TheSportsDB, API gratuita) se algum jogo já encerrado teve seu resultado divulgado, e preenche sozinho. O admin pode sempre sobrescrever manualmente.
- **QR Code de pagamento**: na aba Admin, envie uma imagem (PNG/JPG/WEBP/SVG) com seu QR Pix. Ela aparece automaticamente para os participantes na tela de apostas.

> Ajuste a constante `MINUTOS_TRAVA` em `backend/server.js` se quiser mudar o tempo de travamento (padrão: 30).

---

## 🌍 Publicando online (GitHub + Render + Vercel)

### 1. Subir o código no GitHub
1. Crie um repositório novo (ex: `bolao-copa`) em github.com.
2. **Importante:** o arquivo `.env` (com a chave secreta do Supabase) **não deve ir para o GitHub** — ele já está no `.gitignore`.
3. No terminal, dentro da pasta `bolao-copa`:
   ```bash
   git init
   git add .
   git commit -m "Bolão da Copa - versão online"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/bolao-copa.git
   git push -u origin main
   ```

### 2. Backend no Render
1. Em render.com, crie um **New Web Service**, conecte ao repositório GitHub.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Em **Environment**, adicione as variáveis:
   - `SUPABASE_URL` = sua URL do Supabase
   - `SUPABASE_KEY` = sua service_role key (a secreta!)
6. Deploy. Você vai receber uma URL tipo `https://bolao-copa-backend.onrender.com`

### 3. Frontend no Vercel
1. Em vercel.com, importe o mesmo repositório.
2. **Root Directory:** `frontend`
3. Em **Environment Variables**, não precisa nada — mas é necessário ajustar o proxy (veja abaixo).
4. Deploy. Você recebe uma URL tipo `https://bolao-copa.vercel.app`

### 4. Conectar frontend → backend em produção
O proxy do `vite.config.js` só funciona em desenvolvimento local. Para produção, o `api.js` precisa apontar para a URL do Render. Veja o arquivo `src/services/api.js` atualizado (enviado separadamente) que usa uma variável de ambiente `VITE_API_URL`.

No Vercel, adicione a variável de ambiente:
- `VITE_API_URL` = `https://bolao-copa-backend.onrender.com/api`

⚠️ **Sobre o Render free**: o servidor "dorme" após ~15 min sem uso e demora ~30-50s para responder na primeira requisição do dia. Os dados continuam seguros no Supabase.
