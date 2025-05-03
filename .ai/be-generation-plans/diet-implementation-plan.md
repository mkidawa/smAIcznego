/_ Plan wdrożenia punktu końcowego Create Diet endpoint _/

# API Endpoint Implementation Plan: Create Diet Endpoint

## 1. Przegląd punktu końcowego

Endpoint służy do stworzenia "skorupy" diety (Diet shell) przy użyciu danych podglądowych z generacji. W pierwszym kroku nie są dodawane posiłki ani lista zakupów. Dalsze kroki będą uzupełniać pozostałe dane diety.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Ścieżka:** /diets
- **Parametry żądania:**
  - **Wymagane:**
    - `number_of_days` (liczba dni diety, wartość od 1 do 14)
    - `calories_per_day` (liczba kalorii do spożycia dziennie, > 0)
    - `preferred_cuisines` (tablica ulubionych typów kuchni, np. ["italian", "vegetarian"])
    - `generation_id` (identyfikator rekordu generacji; musi istnieć i należeć do bieżącego użytkownika)
- **Request Body:** Przykład:

```json
{
  "number_of_days": 7,
  "calories_per_day": 2200,
  "preferred_cuisines": ["italian", "vegetarian"],
  "generation_id": 456
}
```

## 3. Wykorzystywane typy

- **DTO do żądania:** `CreateDietCommand` (zdefiniowany w `src/types.ts`), zawiera pola: `number_of_days`, `calories_per_day`, `preferred_cuisines`, `generation_id`.
- **DTO do odpowiedzi:** `CreateDietResponse` (zdefiniowany w `src/types.ts`), zawiera pola: `diet_id`, `status` (na początku "draft"), `generation_id`.

## 4. Szczegóły odpowiedzi

- **Sukces:** HTTP 201
  - Odpowiedź:
    ```json
    {
      "diet_id": 123,
      "status": "draft",
      "generation_id": 456
    }
    ```
- **Błędy:**
  - 400 (VALIDATION_FAILED): Nieprawidłowe dane wejściowe
  - 401 (UNAUTHORIZED): Brak lub nieprawidłowy JWT
  - 403 (FORBIDDEN): Ograniczenia RLS lub brak dostępu
  - 404 (GENERATION_NOT_FOUND): Generacja nie istnieje lub nie należy do użytkownika
  - 409 (DIET_ALREADY_EXISTS): Dieta dla podanej generacji już istnieje
  - 500: Błąd serwera

## 5. Przepływ danych

1. Odbiór żądania i walidacja pól zgodnie z ograniczeniami (np. number_of_days <= 14, calories_per_day > 0).
2. Weryfikacja istnienia rekordu generacji w bazie i potwierdzenie, że należy on do bieżącego użytkownika (używając Supabase przy wykorzystaniu kontekstu `context.locals.supabase`).
3. Sprawdzenie, czy dla podanej generacji już nie istnieje rekord diety (zapobieganie duplikatom).
4. Wstawienie nowego rekordu w tabeli `Diet` z ustawionym statusem na "draft" oraz przypisanie odpowiednich wartości.
5. Zwrócenie odpowiedzi z utworzonym identyfikatorem i statusem.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: Sprawdzenie poprawności JWT oraz autoryzacja użytkownika.
- RLS: Wykorzystanie zasad Row-Level Security, aby użytkownik miał dostęp tylko do swoich danych.
- Walidacja: Dokładna walidacja danych wejściowych, aby zapobiec wstrzyknięciom SQL i innym atakom.

## 7. Obsługa błędów

- **400 VALIDATION_FAILED:** Gdy dane wejściowe nie spełniają wymagań (np. number_of_days poza zakresem, calories_per_day <= 0).
- **401 UNAUTHORIZED:** Gdy brakuje JWT lub jest on nieprawidłowy.
- **403 FORBIDDEN:** Gdy polityki RLS lub inne zasady autoryzacji blokują dostęp.
- **404 GENERATION_NOT_FOUND:** Gdy generacja o podanym `generation_id` nie istnieje lub nie należy do bieżącego użytkownika.
- **409 DIET_ALREADY_EXISTS:** Gdy dieta dla danej generacji już istnieje.
- **500:** Błąd serwera lub nieprzewidziany wyjątek – logowanie błędów i zwrócenie komunikatu o błędzie.

## 8. Rozważania dotyczące wydajności

- Zapytania do bazy danych powinny korzystać z indeksów na kolumnach `user_id` i `generation_id` (zgodnie z definicjami w schemacie bazy danych).
- Wczesna walidacja danych wejściowych minimalizuje obciążenie bazy.
- Obsługa równoległych zapytań przy pomocy Supabase i asynchronicznego przetwarzania.

## 9. Etapy wdrożenia

1. **Utworzenie endpointu:** Stworzenie pliku API (np. w `src/pages/api/diets.ts`) dla obsługi żądania POST /diets.
2. **Walidacja danych:** Implementacja walidacji wykorzystującej Zod lub inny mechanizm walidacji danych wejściowych zgodnie z regułami.
3. **Autoryzacja:** Integracja sprawdzania JWT oraz wykorzystanie kontekstu `context.locals.supabase` do autoryzacji.
4. **Logika biznesowa:** Weryfikacja istnienia generacji, sprawdzenie duplikatu diety oraz wstawienie nowego rekordu w tabeli Diet.
5. **Obsługa odpowiedzi:** Odpowiednie zwrócenie odpowiedzi HTTP (201 lub błędy) wraz z komunikatami.
6. **Testy:** Przeprowadzenie testów jednostkowych i integracyjnych, aby potwierdzić poprawność działania endpointu.
7. **Logowanie oraz monitoring:** Implementacja mechanizmu logowania błędów i monitorowania stanu endpointu.

/_ Koniec planu wdrożenia _/
