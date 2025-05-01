# Schemat bazy danych dla aplikacji smaAIcznego

## Definicje typów

### `cuisine_type`

```sql
CREATE TYPE cuisine_type AS ENUM ('polish', 'italian', 'indian', 'asian', 'vegan', 'vegetarian', 'gluten-free', 'keto', 'paleo');
```

## 1. Tabele

### 1.1. Diet

- `id` SERIAL PRIMARY KEY
- `user_id` INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `number_of_days` INTEGER NOT NULL CHECK (number_of_days > 0)
- `calories_per_day` INTEGER NOT NULL
- `preferred_cuisines` cuisine_type[] NOT NULL DEFAULT '{}'
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `end_date` TIMESTAMP NOT NULL -- data zakończenia diety
- **Indeks:** IDX_diet_user_id na kolumnie `user_id`

### 1.2. Meal

- `id` SERIAL PRIMARY KEY
- `diet_id` INTEGER NOT NULL REFERENCES Diet(id) ON DELETE CASCADE
- `day` INTEGER NOT NULL CHECK (day > 0) -- dzień diety
- `meal_type` VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'second breakfast', 'lunch', 'afternoon snack', 'dinner'))
- `instructions` TEXT
- `approx_calories` INTEGER
- **Indeks:** IDX_meal_diet_id na kolumnie `diet_id`

### 1.3. Preferences

- `user_id` INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
- `age` INTEGER
- `gender` TEXT
- `weight` DECIMAL(5,2)
- `allergies` TEXT[] NOT NULL DEFAULT '{}'
- `terms_accepted` BOOLEAN NOT NULL DEFAULT false
- **Indeks:** IDX_preferences_user_id na kolumnie `user_id`

### 1.4. ShoppingList

- `id` SERIAL PRIMARY KEY
- `diet_id` INTEGER NOT NULL REFERENCES Diet(id) ON DELETE CASCADE
- `items` TEXT[] NOT NULL DEFAULT '{}'
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- **Unikalność:** Klucz unikalny na `diet_id` (każda dieta ma jedną listę zakupów)
- **Indeks:** IDX_shoppinglist_diet_id na kolumnie `diet_id`

### 1.5. Recipe

- `id` SERIAL PRIMARY KEY
- `title` VARCHAR(255) NOT NULL
- `description` TEXT
- `instructions` TEXT
- `meal_id` INTEGER UNIQUE REFERENCES Meal(id) ON DELETE SET NULL -- opcjonalne powiązanie z posiłkiem
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- **Indeks:** IDX_recipe_meal_id na kolumnie `meal_id`

### 1.6. Generation

- `id` SERIAL PRIMARY KEY
- `user_id` INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `source_text` TEXT NOT NULL -- tekst wejściowy użytkownika przekazany do AI
- `metadata` JSONB NOT NULL DEFAULT '{}' -- metadane zwrócone przez usługę AI (np. model, tokeny, temperatura, itp.)
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- **Indeks:** IDX_generation_user_id na kolumnie `user_id`

### 1.7. GenerationLog

- `id` SERIAL PRIMARY KEY
- `generation_id` INTEGER NOT NULL REFERENCES Generation(id) ON DELETE CASCADE
- `event_type` VARCHAR(50) NOT NULL CHECK (event_type IN ('request', 'response', 'error')) -- typ zdarzenia logowanego
- `message` TEXT -- treść logu lub komunikatu błędu
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- **Indeks:** IDX_generationlog_generation_id na kolumnie `generation_id`

## 2. Relacje między tabelami

- Jeden użytkownik może mieć wiele diet (`user_id` w tabeli Diet).
- Każda dieta może mieć wiele posiłków (`diet_id` w tabeli Meal).
- Każda dieta ma jedną listę zakupów (`diet_id` w tabeli ShoppingList).
- Opcjonalnie, każdy posiłek może mieć powiązany jeden przepis (`meal_id` w tabeli Recipe).
- Jeden użytkownik może mieć wiele generacji (`user_id` w tabeli Generation).
- Każda generacja może mieć wiele wpisów w logu (`generation_id` w tabeli GenerationLog).

## 3. Indeksy

- `IDX_diet_user_id` na tabeli Diet (kolumna `user_id`).
- `IDX_meal_diet_id` na tabeli Meal (kolumna `diet_id`).
- `IDX_preferences_user_id` na tabeli Preferences (kolumna `user_id`).
- `IDX_shoppinglist_diet_id` na tabeli ShoppingList (kolumna `diet_id`).
- `IDX_recipe_meal_id` na tabeli Recipe (kolumna `meal_id`).
- `IDX_generation_user_id` na tabeli Generation (kolumna `user_id`).
- `IDX_generationlog_generation_id` na tabeli GenerationLog (kolumna `generation_id`).

## 4. Zasady RLS (Row-Level Security)

- W tabelach zawierających kolumnę `user_id` (np. Diet, Preferences) zaleca się włączenie RLS, aby ograniczyć dostęp do danych na poziomie wiersza.
- Przykładowe polecenia:
  - ALTER TABLE Diet ENABLE ROW LEVEL SECURITY;
  - ALTER TABLE Preferences ENABLE ROW LEVEL SECURITY;
- Polityki RLS powinny porównywać wartość `user_id` z identyfikatorem aktualnie zalogowanego użytkownika.

## 5. Dodatkowe uwagi

- Schemat został zaprojektowany zgodnie z zasadami normalizacji (3NF) i jest wystarczający dla MVP.
- Założono, że zaawansowane techniki skalowalności (np. partycjonowanie) nie są wymagane na tym etapie.
- Wszystkie ograniczenia (constraints) oraz indeksy mają na celu zapewnienie integralności danych i optymalizację wydajności zapytań.
