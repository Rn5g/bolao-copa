-- Tabela de configuração (valor da aposta etc)
create table config (
  id int primary key default 1,
  valor_aposta numeric not null default 50,
  moeda text not null default 'R$',
  constraint single_row check (id = 1)
);

insert into config (id, valor_aposta, moeda) values (1, 50, 'R$');

-- Tabela de jogos
create table jogos (
  id serial primary key,
  time_a text not null,
  time_b text not null,
  sigla_a text,
  sigla_b text,
  data date not null,
  hora text not null,
  grupo text,
  placar_a int,
  placar_b int
);

insert into jogos (time_a, time_b, sigla_a, sigla_b, data, hora, grupo, placar_a, placar_b) values
  ('Brasil', 'Marrocos', 'BRA', 'MAR', '2026-06-13', '19:00', 'C', null, null),
  ('Brasil', 'Haiti', 'BRA', 'HAI', '2026-06-19', '21:30', 'C', null, null),
  ('Escócia', 'Brasil', 'SCO', 'BRA', '2026-06-24', '19:00', 'C', null, null);

-- Tabela de participantes
create table participantes (
  id serial primary key,
  nome text not null unique
);

-- Tabela de palpites
create table palpites (
  id serial primary key,
  participante_id int not null references participantes(id) on delete cascade,
  jogo_id int not null references jogos(id) on delete cascade,
  placar_a int not null,
  placar_b int not null,
  unique (participante_id, jogo_id)
);
