-- Adiciona campo para URL da imagem do QR Code de pagamento
alter table config add column if not exists qr_code_url text;
