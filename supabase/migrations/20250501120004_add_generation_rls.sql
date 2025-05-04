-- migracja: dodaje polityki rls dla tabeli generations
-- opis: umożliwia użytkownikom wybór, wstawianie, aktualizowanie i usuwanie rekordów z tabeli generations tylko wtedy, gdy user_id odpowiada auth.uid()
-- data: 2024-03-19 12:05:00 utc

alter table generations enable row level security;

-- polityka: użytkownicy mogą wyświetlać tylko swoje rekordy w generations
create policy "users can view their own generations"
  on generations for select
  using (auth.uid() = user_id);

-- polityka: użytkownicy mogą wstawiać rekordy do generations tylko z poprawnym user_id
create policy "users can insert their own generations"
  on generations for insert
  with check (auth.uid() = user_id);

-- polityka: użytkownicy mogą aktualizować rekordy w generations tylko gdy ich user_id pasuje
create policy "users can update their own generations"
  on generations for update
  using (auth.uid() = user_id);

-- polityka: użytkownicy mogą usuwać rekordy w generations tylko gdy ich user_id pasuje
create policy "users can delete their own generations"
  on generations for delete
  using (auth.uid() = user_id); 