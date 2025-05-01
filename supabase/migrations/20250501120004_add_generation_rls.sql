-- migracja: dodaje polityki rls dla tabeli generation
-- opis: umożliwia użytkownikom wybór, wstawianie, aktualizowanie i usuwanie rekordów z tabeli generation tylko wtedy, gdy user_id odpowiada auth.uid()
-- data: 2024-03-19 12:05:00 utc

alter table generation enable row level security;

-- polityka: użytkownicy mogą wyświetlać tylko swoje rekordy w generation
create policy "users can view their own generations"
  on generation for select
  using (auth.uid() = user_id);

-- polityka: użytkownicy mogą wstawiać rekordy do generation tylko z poprawnym user_id
create policy "users can insert their own generations"
  on generation for insert
  with check (auth.uid() = user_id);

-- polityka: użytkownicy mogą aktualizować rekordy w generation tylko gdy ich user_id pasuje
create policy "users can update their own generations"
  on generation for update
  using (auth.uid() = user_id);

-- polityka: użytkownicy mogą usuwać rekordy w generation tylko gdy ich user_id pasuje
create policy "users can delete their own generations"
  on generation for delete
  using (auth.uid() = user_id); 