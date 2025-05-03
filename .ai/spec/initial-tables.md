# Database Schema for Diet Application

Below is an example table structure for a relational database, using an ENUM type for preferred cuisine.

```sql
-- ENUM type definition for preferred cuisine
CREATE TYPE cuisine_type AS ENUM ('polish', 'italian', 'indian', 'asian', 'vegan', 'vegetarian', 'gluten-free', 'keto', 'paleo');

-------------------------------------------------
-- Diet table
-------------------------------------------------
CREATE TABLE Diet (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    number_of_days INTEGER NOT NULL,
    calories_per_day INTEGER NOT NULL,
    preferred_cuisines cuisine_type[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-------------------------------------------------
-- Meal table
-------------------------------------------------
CREATE TABLE Meal (
    id SERIAL PRIMARY KEY,
    diet_id INTEGER NOT NULL,
    day INTEGER NOT NULL, -- day of the diet
    meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'second breakfast', 'lunch', 'afternoon snack', 'dinner')),
    instructions TEXT,
    approx_calories INTEGER,
    FOREIGN KEY (diet_id) REFERENCES Diet(id)
);

-------------------------------------------------
-- Preferences table
-------------------------------------------------
CREATE TABLE Preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users (id),
    age INTEGER,
    weight DECIMAL(5,2),
    gender TEXT,
    allergies TEXT[] NOT NULL DEFAULT '{}',
    terms_accepted BOOLEAN NOT NULL DEFAULT false
);
```

Additional notes:

- One user can have only one active diet at a time but can have many completed diets.
- One diet can have many meals.
