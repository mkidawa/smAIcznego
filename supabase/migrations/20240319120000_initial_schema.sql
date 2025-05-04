-- Migracja: Utworzenie początkowego schematu bazy danych
-- Opis: Definiuje podstawowe typy i tabele dla aplikacji smaAIcznego
-- Data: 2024-03-19

-- Utworzenie typów wyliczeniowych
create type meal_type as enum (
  'breakfast',
  'second breakfast',
  'lunch',
  'afternoon snack',
  'dinner'
);

-- Utworzenie typu wyliczeniowego dla rodzajów kuchni
create type cuisine_type as enum (
  'polish',
  'italian',
  'indian',
  'asian',
  'vegan',
  'vegetarian',
  'gluten-free',
  'keto',
  'paleo'
);

-- Tabela Diets
create table diets (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  number_of_days integer not null check (number_of_days > 0),
  calories_per_day integer not null,
  preferred_cuisines cuisine_type[] not null default '{}',
  created_at timestamp not null default now(),
  end_date timestamp not null
);

create index idx_diets_user_id on diets(user_id);

-- Tabela Meals
create table meals (
  id serial primary key,
  diet_id integer not null references diets(id) on delete cascade,
  day integer not null check (day >= 0),
  meal_type meal_type not null,
  instructions text,
  approx_calories integer
);

create index idx_meals_diet_id on meals(diet_id);

-- Tabela Profiles
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age integer,
  gender text,
  weight decimal(5,2),
  allergies text[] not null default '{}',
  terms_accepted boolean not null default false
);

create index idx_profiles_user_id on profiles(user_id);

-- Tabela ShoppingLists
create table shopping_lists (
  id serial primary key,
  diet_id integer not null references diets(id) on delete cascade,
  items text[] not null default '{}',
  created_at timestamp not null default now(),
  constraint unique_diet_shopping_list unique (diet_id)
);

create index idx_shoppinglists_diet_id on shopping_lists(diet_id);

-- Tabela Recipes
create table recipes (
  id serial primary key,
  title varchar(255) not null,
  description text,
  instructions text,
  meal_id integer unique references meals(id) on delete set null,
  created_at timestamp not null default now()
);

create index idx_recipes_meal_id on recipes(meal_id);

-- Włączenie Row Level Security (RLS)
alter table diets enable row level security;
alter table meals enable row level security;
alter table profiles enable row level security;
alter table shopping_lists enable row level security;
alter table recipes enable row level security;

-- Polityki RLS dla tabeli Diets
create policy "Users can view their own diets"
  on diets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own diets"
  on diets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own diets"
  on diets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own diets"
  on diets for delete
  using (auth.uid() = user_id);

-- Polityki RLS dla tabeli Profiles
create policy "Users can view their own profiles"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profiles"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profiles"
  on profiles for update
  using (auth.uid() = user_id);

-- Polityki RLS dla tabeli Meals (poprzez diets.user_id)
create policy "Users can view meals from their diets"
  on meals for select
  using (exists (
    select 1 from diets
    where diets.id = meals.diet_id
    and diets.user_id = auth.uid()
  ));

create policy "Users can insert meals to their diets"
  on meals for insert
  with check (exists (
    select 1 from diets
    where diets.id = meals.diet_id
    and diets.user_id = auth.uid()
  ));

create policy "Users can update meals from their diets"
  on meals for update
  using (exists (
    select 1 from diets
    where diets.id = meals.diet_id
    and diets.user_id = auth.uid()
  ));

create policy "Users can delete meals from their diets"
  on meals for delete
  using (exists (
    select 1 from diets
    where diets.id = meals.diet_id
    and diets.user_id = auth.uid()
  ));

-- Polityki RLS dla tabeli ShoppingLists (poprzez diets.user_id)
create policy "Users can view shopping lists from their diets"
  on shopping_lists for select
  using (exists (
    select 1 from diets
    where diets.id = shopping_lists.diet_id
    and diets.user_id = auth.uid()
  ));

create policy "Users can insert shopping lists to their diets"
  on shopping_lists for insert
  with check (exists (
    select 1 from diets
    where diets.id = shopping_lists.diet_id
    and diets.user_id = auth.uid()
  ));

create policy "Users can update shopping lists from their diets"
  on shopping_lists for update
  using (exists (
    select 1 from diets
    where diets.id = shopping_lists.diet_id
    and diets.user_id = auth.uid()
  ));

-- Polityki RLS dla tabeli Recipes (poprzez meals.diet_id)
create policy "Users can view recipes from their meals"
  on recipes for select
  using (exists (
    select 1 from meals
    join diets on diets.id = meals.diet_id
    where meals.id = recipes.meal_id
    and diets.user_id = auth.uid()
  ));

create policy "Users can insert recipes to their meals"
  on recipes for insert
  with check (exists (
    select 1 from meals
    join diets on diets.id = meals.diet_id
    where meals.id = recipes.meal_id
    and diets.user_id = auth.uid()
  ));

create policy "Users can update recipes from their meals"
  on recipes for update
  using (exists (
    select 1 from meals
    join diets on diets.id = meals.diet_id
    where meals.id = recipes.meal_id
    and diets.user_id = auth.uid()
  )); 