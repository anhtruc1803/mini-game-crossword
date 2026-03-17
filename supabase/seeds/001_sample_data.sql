-- ============================================================
-- Seed data for local development
-- ============================================================

-- Theme
insert into public.themes (id, name, primary_color, secondary_color, accent_color)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Default Theme',
  '#6366f1', '#8b5cf6', '#f59e0b'
);

-- Program
insert into public.programs (id, slug, title, description, status, theme_id)
values (
  'b0000000-0000-0000-0000-000000000001',
  'demo-2024',
  'Chương trình Demo 2024',
  'Chương trình ô chữ mẫu để test.',
  'draft',
  'a0000000-0000-0000-0000-000000000001'
);

-- Game
insert into public.games (id, program_id, title, subtitle, final_keyword, total_rows, game_status)
values (
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Ô Chữ Công Nghệ',
  'Chủ đề: Công nghệ thông tin',
  'CODING',
  6,
  'draft'
);

-- Crossword rows
insert into public.crossword_rows (game_id, row_order, clue_text, answer_text, answer_length, highlighted_indexes_json, row_status) values
('c0000000-0000-0000-0000-000000000001', 0, 'Ngôn ngữ lập trình phổ biến nhất thế giới',         'JAVASCRIPT', 10, '[4]',  'hidden'),
('c0000000-0000-0000-0000-000000000001', 1, 'Hệ điều hành mã nguồn mở phổ biến cho server',      'LINUX',      5,  '[0]',  'hidden'),
('c0000000-0000-0000-0000-000000000001', 2, 'Công cụ quản lý phiên bản mã nguồn',                 'GIT',        3,  '[2]',  'hidden'),
('c0000000-0000-0000-0000-000000000001', 3, 'Ngôn ngữ đánh dấu để xây dựng trang web',            'HTML',       4,  '[2]',  'hidden'),
('c0000000-0000-0000-0000-000000000001', 4, 'Framework React phổ biến cho fullstack',              'NEXTJS',     6,  '[0]',  'hidden'),
('c0000000-0000-0000-0000-000000000001', 5, 'Cơ sở dữ liệu quan hệ mã nguồn mở mạnh mẽ nhất',   'POSTGRES',   8,  '[5]',  'hidden');
