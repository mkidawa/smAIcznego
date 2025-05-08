-- Dodanie kolumny dietary_preferences do tabeli profiles
ALTER TABLE profiles
ADD COLUMN dietary_preferences VARCHAR(100);

-- Aktualizacja polityk bezpieczeństwa dla nowej kolumny
CREATE POLICY "Users can update their own dietary_preferences"
ON profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);