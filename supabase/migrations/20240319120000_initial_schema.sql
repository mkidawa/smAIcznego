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

-- Tabela Diet
create table diet (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  number_of_days integer not null check (number_of_days > 0),
  calories_per_day integer not null,
  preferred_cuisines cuisine_type[] not null default '{}',
  created_at timestamp not null default now(),
  end_date timestamp not null
);

create index idx_diet_user_id on diet(user_id);

-- Tabela Meal
create table meal (
  id serial primary key,
  diet_id integer not null references diet(id) on delete cascade,
  day integer not null check (day >= 0),
  meal_type meal_type not null,
  instructions text,
  approx_calories integer
);

create index idx_meal_diet_id on meal(diet_id);

-- Tabela Preferences
create table preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age integer,
  gender text,
  weight decimal(5,2),
  allergies text[] not null default '{}',
  terms_accepted boolean not null default false
);

create index idx_preferences_user_id on preferences(user_id);

-- Tabela ShoppingList
create table shopping_list (
  id serial primary key,
  diet_id integer not null references diet(id) on delete cascade,
  items text[] not null default '{}',
  created_at timestamp not null default now(),
  constraint unique_diet_shopping_list unique (diet_id)
);

create index idx_shoppinglist_diet_id on shopping_list(diet_id);

-- Tabela Recipe
create table recipe (
  id serial primary key,
  title varchar(255) not null,
  description text,
  instructions text,
  meal_id integer unique references meal(id) on delete set null,
  created_at timestamp not null default now()
);

create index idx_recipe_meal_id on recipe(meal_id);

-- Włączenie Row Level Security (RLS)
alter table diet enable row level security;
alter table meal enable row level security;
alter table preferences enable row level security;
alter table shopping_list enable row level security;
alter table recipe enable row level security;

-- Polityki RLS dla tabeli Diet
create policy "Users can view their own diets"
  on diet for select
  using (auth.uid() = user_id);

create policy "Users can insert their own diets"
  on diet for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own diets"
  on diet for update
  using (auth.uid() = user_id);

create policy "Users can delete their own diets"
  on diet for delete
  using (auth.uid() = user_id);

-- Polityki RLS dla tabeli Preferences
create policy "Users can view their own preferences"
  on preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on preferences for update
  using (auth.uid() = user_id);

-- Polityki RLS dla tabeli Meal (poprzez diet.user_id)
create policy "Users can view meals from their diets"
  on meal for select
  using (exists (
    select 1 from diet
    where diet.id = meal.diet_id
    and diet.user_id = auth.uid()
  ));

create policy "Users can insert meals to their diets"
  on meal for insert
  with check (exists (
    select 1 from diet
    where diet.id = meal.diet_id
    and diet.user_id = auth.uid()
  ));

create policy "Users can update meals from their diets"
  on meal for update
  using (exists (
    select 1 from diet
    where diet.id = meal.diet_id
    and diet.user_id = auth.uid()
  ));

create policy "Users can delete meals from their diets"
  on meal for delete
  using (exists (
    select 1 from diet
    where diet.id = meal.diet_id
    and diet.user_id = auth.uid()
  ));

-- Polityki RLS dla tabeli ShoppingList (poprzez diet.user_id)
create policy "Users can view shopping lists from their diets"
  on shopping_list for select
  using (exists (
    select 1 from diet
    where diet.id = shopping_list.diet_id
    and diet.user_id = auth.uid()
  ));

create policy "Users can insert shopping lists to their diets"
  on shopping_list for insert
  with check (exists (
    select 1 from diet
    where diet.id = shopping_list.diet_id
    and diet.user_id = auth.uid()
  ));

create policy "Users can update shopping lists from their diets"
  on shopping_list for update
  using (exists (
    select 1 from diet
    where diet.id = shopping_list.diet_id
    and diet.user_id = auth.uid()
  ));

-- Polityki RLS dla tabeli Recipe (poprzez meal.diet_id)
create policy "Users can view recipes from their meals"
  on recipe for select
  using (exists (
    select 1 from meal
    join diet on diet.id = meal.diet_id
    where meal.id = recipe.meal_id
    and diet.user_id = auth.uid()
  ));

create policy "Users can insert recipes to their meals"
  on recipe for insert
  with check (exists (
    select 1 from meal
    join diet on diet.id = meal.diet_id
    where meal.id = recipe.meal_id
    and diet.user_id = auth.uid()
  ));

create policy "Users can update recipes from their meals"
  on recipe for update
  using (exists (
    select 1 from meal
    join diet on diet.id = meal.diet_id
    where meal.id = recipe.meal_id
    and diet.user_id = auth.uid()
  )); 