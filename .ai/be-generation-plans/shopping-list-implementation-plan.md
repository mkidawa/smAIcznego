# API Endpoint Implementation Plan: Shopping List Endpoint

## 1. Przegląd punktu końcowego

Punkt końcowy odpowiada za zarządzanie listą zakupów przypisanych do danej diety. Umożliwia utworzenie listy zakupów (POST) oraz pobranie istniejącej listy (GET). Dodatkowo, jeśli zarówno posiłki jak i lista zakupów są obecne, status diety powinien zostać ustawiony na `ready`.

## 2. Szczegóły żądania

- **Metoda HTTP (POST):** POST

  - **URL:** `/diets/{dietId}/shopping-list`
  - **Parametry:**
    - `dietId` (wymagany, w ścieżce URL)
  - **Body (JSON):**
    ```json
    {
      "items": ["eggs", "spinach", "olive oil"]
    }
    ```
  - **Uwaga:** Pole `items` jest wymagane i powinno być tablicą ciągów znaków.

- **Metoda HTTP (GET):** GET
  - **URL:** `/diets/{dietId}/shopping-list`
  - **Parametry:**
    - `dietId` (wymagany, w ścieżce URL)

## 3. Wykorzystywane typy

- `CreateShoppingListCommand` – DTO do tworzenia listy zakupów, zawierający pole `items` (string[]).
- `CreateShoppingListResponse` – DTO zwracana po utworzeniu listy zakupów, zawierająca `shopping_list_id`.
- Dodatkowo, typy związane z aktualizacją statusu diety (np. `DietStatus`) mogą być użyte przy ustawianiu statusu na `ready`.

## 4. Szczegóły odpowiedzi

- **Dla metody POST:**

  - **Status:** HTTP 201 – Lista zakupów została pomyślnie utworzona.
  - **Treść odpowiedzi:** JSON z polem `shopping_list_id`.

- **Dla metody GET:**

  - **Status:** HTTP 200 – Zwraca tablicę przedmiotów zakupowych (items).

- **Obsługa błędów:**
  - 400 – Błędne dane wejściowe.
  - 401 – Nieautoryzowany dostęp.
  - 404 – Nie znaleziono zasobu diety lub listy zakupów.
  - 500 – Błąd serwera.

## 5. Przepływ danych

1. **Odczytanie parametru `dietId`:** Pobrać `dietId` z URL.
2. **Walidacja danych wejściowych:**
   - Sprawdzenie poprawności formatu `dietId`.
   - Dla metody POST: Walidacja obecności i formatu pola `items`.
3. **Przetwarzanie danych:**
   - **POST:**
     - Wstawienie nowej listy zakupów do tabeli `shopping_list` z przypisanym `dietId` oraz `items`.
     - Sprawdzenie, czy istnieją już posiłki dla danej diety. Jeśli tak, zaktualizowanie statusu diety na `ready`.
   - **GET:**
     - Pobranie listy zakupów na podstawie `dietId`.
4. **Zapis i odpowiedź:**
   - Zwrócenie odpowiedzi HTTP z odpowiednim kodem i treścią JSON.

## 6. Względy bezpieczeństwa

- **Autoryzacja:** Upewnić się, że użytkownik wykonujący zapytanie ma odpowiednie uprawnienia do zarządzania daną dietą.
- **Walidacja danych:** Wykorzystanie Zod do walidacji schematów wejściowych, co minimalizuje ryzyko wprowadzenia nieprawidłowych danych.
- **Bezpieczeństwo zapytań:** Użycie bezpiecznych zapytań i mechanizmów zapobiegających SQL Injection, dzięki klientowi Supabase.
- **Rejestracja błędów:** Logowanie błędów do systemu monitorowania (jeśli jest wdrożone) w celu analizy i opanowania problemów.

## 7. Obsługa błędów

- **400 Bad Request:** Gdy dane wejściowe są niepoprawne (np. nieprawidłowy format `items`).
- **401 Unauthorized:** Gdy użytkownik nie jest uwierzytelniony lub nie posiada uprawnień do modyfikacji danej diety.
- **404 Not Found:** Gdy dana dieta lub lista zakupów nie istnieje.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów po stronie serwera.
- **Dodatkowo:** Wykorzystanie wczesnych zwrotów (early returns) w logice aplikacji w celu uproszczenia obsługi błędów.

## 8. Rozważania dotyczące wydajności

- **Indeks na `diet_id`:** Wykorzystanie indeksu (IDX_shoppinglist_diet_id) dla szybkiego wyszukiwania listy zakupów.
- **Optymalizacja zapytań:** Upewnienie się, że zapytania do bazy danych są zoptymalizowane, a operacje wstawiania i aktualizacji odbywają się w ramach transakcji, gdyż może to wpłynąć na wydajność.
- **Integracja logiki:** Rozważenie integracji aktualizacji statusu diety i tworzenia listy zakupów w jednej transakcji w celu zmniejszenia liczby operacji bazy danych.
