-- migracja: aktualizacja nazw indeksów oraz polityk rls
-- opis: aktualizacja nazw indeksów oraz polityk rls
-- data: 2024-09-06

-- utworzenie nowych polityk rls dla tabeli profiles
create policy "users can view their own profiles"
  on profiles
  for select
  using (auth.uid() = user_id);

create policy "users can insert their own profiles"
  on profiles
  for insert
  with check (auth.uid() = user_id);

create policy "users can update their own profiles"
  on profiles
  for update
  using (auth.uid() = user_id);

-- migracja zakończona pomyślnie 