# API Endpoint Implementation Plan: Bulk Create Meals

## 1. Przegląd punktu końcowego

Endpoint umożliwia hurtowe tworzenie rekordów posiłków w określonej diecie. Po poprawnym dodaniu wszystkich posiłków, status diety zostaje zaktualizowany do `meals_ready`. Endpoint jest częścią systemu zarządzania dietą, który pozwala użytkownikom łatwo i szybko dodawać wiele posiłków w jednym żądaniu.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Ścieżka URL:** /diets/{dietId}/meals
- **Parametry URL:**
  - `dietId` (wymagany): identyfikator diety, do której mają zostać dodane posiłki
- **Body żądania:** Tablica obiektów reprezentujących posiłki, gdzie każdy obiekt powinien zawierać:
  - `day` (liczba, wymagany): numer dnia diety (wartość > 0 i ≤ liczba dni diety)
  - `meal_type` (ciąg znaków, wymagany): typ posiłku, dozwolone wartości: "breakfast", "second breakfast", "lunch", "afternoon snack", "dinner"
  - `instructions` (ciąg znaków, opcjonalny): instrukcje dotyczące przygotowania posiłku
  - `approx_calories` (liczba, opcjonalny): przybliżona liczba kalorii
  - `recipe` (obiekt, opcjonalny): szczegóły przepisu, jeśli posiłek ma powiązany przepis, zawierający:
    - `title` (ciąg znaków, wymagany): tytuł przepisu
    - `description` (ciąg znaków, opcjonalny): opis przepisu
    - `instructions` (ciąg znaków, wymagany): instrukcje przygotowania przepisu

## 3. Wykorzystywane typy

- **DTO dla posiłku:** `CreateMealCommand` zdefiniowany w typach (zawiera właściwości: `day`, `meal_type`, `instructions`, `approx_calories`, oraz opcjonalnie `recipe`)
- **DTO dla przepisu:** `CreateRecipeCommand`
- **DTO dla grupowego tworzenia posiłków:** `BulkCreateMealsCommand` (zawiera tablicę `meals`)
- **Odpowiedź:** `BulkCreateMealsResponse` (tablica identyfikatorów utworzonych posiłków)

## 4. Szczegóły odpowiedzi

- **Sukces:**
  - Kod statusu: 201 (Created)
  - Body: Tablica identyfikatorów posiłków, np. `[1, 2, 3]`
- **Błędy:**
  - 400: Nieprawidłowe dane wejściowe (np. walidacja nie powiodła się)
  - 401: Brak autoryzacji (użytkownik nie jest zalogowany lub nie ma dostępu do diety)
  - 404: Dieta o podanym `dietId` nie została znaleziona
  - 500: Błąd po stronie serwera

## 5. Przepływ danych

1. Klient wysyła żądanie zawierające `dietId` w ścieżce oraz tablicę obiektów posiłków w body.
2. Warstwa autoryzacji sprawdza, czy użytkownik jest zalogowany i ma dostęp do danej diety.
3. Dane wejściowe są walidowane przy użyciu schematów Zod w celu zapewnienia poprawności:
   - Walidacja struktury każdego obiektu w tablicy
   - Sprawdzenie zakresów oraz dozwolonych wartości (np. `meal_type`)
4. W ramach transakcji:
   - Wstawiane są rekordy do tabeli `meal` w bazie danych (wszystkie operacje wykonywane przy użyciu klienta Supabase z `context.locals`)
   - Po poprawnym dodaniu posiłków, aktualizowany jest rekord diety (ustawienie `status` na `meals_ready`)
5. Transakcja jest zatwierdzana; w przypadku błędów następuje rollback.
6. Response zawiera identyfikatory utworzonych rekordów posiłków.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja:**
  - Upewnienie się, że użytkownik jest poprawnie uwierzytelniony
  - Weryfikacja, czy dieta (`dietId`) należy do zalogowanego użytkownika
- **Walidacja danych:**
  - Użycie Zod do walidacji struktury oraz wartości wejściowych
- **Transakcje:**
  - Stosowanie transakcji w celu zapewnienia spójności danych
- **SQL Injection:**
  - Używanie parametrów zapytań przy komunikacji z bazą danych

## 7. Obsługa błędów

- **Walidacja:**
  - Błędy walidacji danych wejściowych zwracają status 400 z odpowiednim komunikatem
- **Autoryzacja:**
  - W przypadku braku dostępu zwracany jest status 401
- **Brak zasobu:**
  - Jeśli dieta o podanym `dietId` nie istnieje, zwracany jest status 404
- **Błędy serwera:**
  - Nieprzewidziane wyjątki skutkują statusem 500 i odpowiednim logowaniem błędu

## 8. Rozważania dotyczące wydajności

- **Batch Insert:**
  - Użycie jednej operacji wstawiania dla całej partii rekordów, aby zmniejszyć liczbę zapytań do bazy
- **Indeksy:**
  - Wykorzystanie istniejącego indeksu `IDX_meal_diet_id` w tabeli `meal` poprawia wydajność wyszukiwania
- **Limit wielkości partii:**
  - Ustalenie maksymalnej liczby posiłków, które mogą zostać wysłane w jednym żądaniu, aby zapobiec przeciążeniu systemu

## 9. Etapy wdrożenia

1. **Przygotowanie środowiska:**
   - Upewnij się, że middleware uwierzytelniające jest aktywne i poprawnie sprawdza dostęp użytkownika.
2. **Walidacja danych:**
   - Implementacja schematów walidacji Zod dla `CreateMealCommand` i `CreateRecipeCommand`.
3. **Transakcja:**
   - Utworzenie serwisu (np. `MealService`), który będzie zarządzał transakcją: wstawianiem rekordu do `meal` oraz aktualizacją rekordu diety.
4. **Integracja z Supabase:**
   - Upewnij się, że operacje na bazie danych używają klienta Supabase z `context.locals`.
5. **Logika biznesowa:**
   - Dodanie logiki warunkowej do aktualizacji statusu diety (ustawienie na `meals_ready` po pomyślnym dodaniu wszystkich posiłków).
