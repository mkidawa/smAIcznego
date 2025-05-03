# API Endpoint Implementation Plan: Paginated GET Diets

## 1. Przegląd punktu końcowego

Endpoint ten umożliwia pobieranie listy diet w formie stronicowanej. Użytkownik otrzymuje możliwość przeglądania swoich diet z wykorzystaniem parametrów paginacji, co poprawia wydajność i skalowalność systemu.

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Struktura URL:** /diets
- **Parametry zapytania:**
  - `page` (integer, domyślnie: 1): numer strony do pobrania (wymagany, jeśli nie podany domyślnie przyjmuje wartość 1)
  - `per_page` (integer, domyślnie: 10, maksymalnie: 50): liczba diet na stronę (wymagany, jeśli nie podany domyślnie przyjmuje wartość 10)
- **Request Body:** Brak

## 3. Wykorzystywane typy

- **DTO/Dane wyjściowe:**
  - `DietResponse` – definiujący strukturę pojedynczej diety, zawierającą m.in. `id`, `user_id`, `generation_id`, `number_of_days`, `calories_per_day`, `preferred_cuisines`, `status`, `created_at`, `end_date`.
  - `PaginatedResponse<T>` – generyczny typ odpowiedzi, który zawiera dane w formacie:
    ```json
    {
      "diets": [ ... ],
      "page": 1,
      "per_page": 10,
      "total": 57
    }
    ```

## 4. Szczegóły odpowiedzi

- **Status HTTP:** 200 OK w przypadku powodzenia
- **Struktura odpowiedzi:**
  ```json
  {
    "diets": [
      {
        /* obiekt diety */
      }
    ],
    "page": 1,
    "per_page": 10,
    "total": 57
  }
  ```
- **Kody błędów:**
  - 400 dla nieprawidłowych danych wejściowych
  - 401 w przypadku nieautoryzowanego dostępu
  - 500 dla błędów po stronie serwera

## 5. Przepływ danych

1. **Walidacja danych wejściowych:**
   - Sprawdzenie, czy parametry `page` oraz `per_page` są liczbami całkowitymi.
   - Ustawienie wartości domyślnych, jeśli parametry nie są dostarczone.
   - Walidacja, czy `per_page` nie przekracza maksymalnej dozwolonej wartości (50).
2. **Logika biznesowa:**
   - Obliczenie offsetu: \(offset = (page - 1) \* per_page\).
   - Wykonanie zapytania do bazy danych za pomocą klienta Supabase (korzystając z context.locals.supabase) z wykorzystaniem limitu i offsetu.
   - Pobranie listy diet oraz wykonanie zapytania o łączną liczbę rekordów dla wyliczenia pola `total`.
3. **Odpowiedź:**
   - Zwrócenie danych w odpowiednim formacie JSON.

## 6. Względy bezpieczeństwa

- **Uwierzytelnienie:** Endpoint powinien być dostępny tylko dla autoryzowanych użytkowników.
- **Walidacja parametrów:** Konieczne ograniczenie maksymalnej wartości `per_page` oraz sprawdzenie, czy `page` jest większe od zera.
- **Zapobieganie atakom:** Użycie zapytań parametryzowanych, aby uniknąć SQL Injection.

## 7. Obsługa błędów

- **400 Bad Request:** Zwracany, gdy dane wejściowe są nieprawidłowe (np. niepoprawny format parametrów lub przekroczenie maksymalnej wartości `per_page`).
- **401 Unauthorized:** W przypadku braku autoryzacji lub niewłaściwego tokena sesji.
- **500 Internal Server Error:** Uogólniony błąd serwera przy nieoczekiwanych problemach, takich jak błąd zapytania do bazy danych.
- **Logowanie błędów:** Błędy krytyczne powinny być logowane, aby umożliwić ich późniejszą analizę i poprawę systemu.

## 8. Rozważania dotyczące wydajności

- **Optymalizacja bazy danych:** Wykorzystanie indeksów (IDX_diet_user_id, IDX_diet_generation_id) w celu szybkiego wyszukiwania.
- **Paginacja:** Redukcja obciążenia serwera poprzez limitowanie liczby zwracanych rekordów.
- **Cache:** Opcjonalnie, można wdrożyć mechanizm cache'owania wyników dla często powtarzających się zapytań.
