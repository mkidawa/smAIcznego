-- migracja: zmiana nazwy tabeli preferences na profile
-- opis: zmiana nazwy tabeli preferences na profile, aktualizacja nazw indeksów oraz polityk rls
-- data: 2024-09-06

-- zmiana nazwy tabeli z preferences na profile
alter table preferences rename to profile;

-- zmiana nazwy indeksu idx_preferences_user_id na idx_profile_user_id
alter index idx_preferences_user_id rename to idx_profile_user_id;

-- usunięcie starych polityk rls związanych z tabelą preferences (teraz profile)
drop policy if exists "users can view their own preferences" on profile;
drop policy if exists "users can insert their own preferences" on profile;
drop policy if exists "users can update their own preferences" on profile;

-- utworzenie nowych polityk rls dla tabeli profile
create policy "users can view their own profile"
  on profile
  for select
  using (auth.uid() = user_id);

create policy "users can insert their own profile"
  on profile
  for insert
  with check (auth.uid() = user_id);

create policy "users can update their own profile"
  on profile
  for update
  using (auth.uid() = user_id);

-- migracja zakończona pomyślnie 