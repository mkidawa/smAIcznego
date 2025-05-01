# API Endpoint Implementation Plan: Generations

## 1. Przegląd punktu końcowego

Endpointy umożliwiają generowanie planu diety przy użyciu AI oraz pobieranie stanu generacji i logów związanych z danym żądaniem. Punkt końcowy obsługuje:

- Tworzenie rekordu generacji z parametrami diety (POST /generations),
- Pobieranie stanu generacji wraz z podglądem diety (GET /generations/{id}),
- Pobieranie paginowanych logów zdarzeń dla generacji (GET /generations/{id}/logs).

## 2. Szczegóły żądania

### POST /generations

- **Metoda:** POST
- **URL:** /generations
- **Request Body:**
  ```json
  {
    "number_of_days": 7, // liczba dni - wymagana, maksymalnie 14
    "calories_per_day": 2200, // kalorie na dzień - wymagana, wartość > 0
    "meals_per_day": 5, // liczba posiłków na dzień - wymagana, wartość > 0
    "preferred_cuisines": ["italian", "vegetarian"] // lista preferowanych kuchni - wymagana
  }
  ```

### GET /generations/{id}

- **Metoda:** GET
- **URL:** /generations/{id}
- **Parametry ścieżki:**
  - id: identyfikator rekordu generacji

### GET /generations/{id}/logs

- **Metoda:** GET
- **URL:** /generations/{id}/logs
- **Parametry ścieżki:**
  - id: identyfikator rekordu generacji
- **Opcjonalne parametry zapytania:**
  - page, limit (dla paginacji)

## 3. Wykorzystywane typy

- `CreateGenerationCommand` (DTO dla tworzenia rekordu generacji)
- `CreateGenerationResponse` (DTO dla odpowiedzi na utworzenie generacji)
- `GenerationResponse` (DTO dla odpowiedzi przy pobieraniu stanu generacji)
- Dodatkowo: struktura logów generacji (GenerationLog), zawierająca pola `id`, `generation_id`, `event_type` oraz `message`.

## 4. Szczegóły odpowiedzi

### POST /generations

- **Kod statusu:** 202 Accepted
- **Response Body:**
  ```json
  {
    "generation_id": 456,
    "status": "pending"
  }
  ```

### GET /generations/{id}

- **Kod statusu:** 200 OK
- **Response Body:**
  ```json
  {
    "generation_id": 456,
    "status": "completed",
    "preview": {
      /* podgląd diety */
    },
    "created_at": "2024-06-01T10:00:00Z"
  }
  ```

### GET /generations/{id}/logs

- **Kod statusu:** 200 OK
- **Response Body:** Lista logów w formacie np.:
  ```json
  [
    {
      "id": 1,
      "generation_id": 456,
      "event_type": "request",
      "message": "...",
      "created_at": "2024-06-01T10:00:00Z"
    },
    ...
  ]
  ```

## 5. Przepływ danych

1. Klient wysyła żądanie POST z parametrami diety.
2. Endpoint waliduje dane wejściowe przy użyciu np. Zod.
3. Po walidacji:
   - Tworzony jest rekord w tabeli `Generation` z odpowiednimi polami (user_id, source_text, status ustawiony na 'pending', itp.).
   - Rekord jest logowany w tabeli `GenerationLog` z event_type 'request'.
4. Uruchamiany jest background worker, który:
   - Wywołuje usługę Openrouter.ai, pobiera odpowiedzi w strumieniu.
   - Aktualizuje rekord `Generation` ustawiając status na 'completed' oraz zapisuje podgląd diety w `metadata.preview`.
   - Loguje zdarzenia (event_type: 'response') lub błędy (event_type: 'error').
5. Klienci mogą pobierać stan generacji lub logi na żądanie GET.

## 6. Względy bezpieczeństwa

- **Autentykacja i autoryzacja:**
  - Endpointy powinny korzystać z mechanizmów uwierzytelniania (np. Supabase Auth), aby upewnić się, że użytkownik posiada uprawnienia do odczytu/modyfikacji danych.
  - Użycie `supabase` z `context.locals` zamiast bezpośredniego importu klienta.
- **Walidacja wejścia:**
  - Dane muszą być walidowane przy użyciu bibliotek takich jak Zod, aby zapobiec wstrzyknięciom i błędnym danym.
- **Bezpieczeństwo bazy:**
  - Odpowiednie indeksy w bazie (IDX_generation_user_id, IDX_generationlog_generation_id) zapewniają wydajność i spójność.

## 7. Obsługa błędów

- **400 Bad Request:** Nieprawidłowe dane wejściowe (np. liczba dni > 14, kalorie <= 0).
- **401 Unauthorized:** Próba dostępu bez koniecznych uprawnień lub nieautoryzowany użytkownik.
- **404 Not Found:** Nie znaleziono rekordu generacji lub logów dla podanego identyfikatora.
- **500 Internal Server Error:** Błędy po stronie serwera, np. problemy z połączeniem do bazy lub wywołaniem AI.

## 8. Rozważania dotyczące wydajności

- **Background Processing:**
  - Użycie mechanizmu kolejkowania do obsługi asynchronicznych wywołań AI minimalizuje czas odpowiedzi w głównym wątku.
- **Indeksy bazy danych:**
  - Zapewnienie prawidłowych indeksów w tabelach `Generation` i `GenerationLog` dla szybkiego dostępu do danych.
- **Paginacja:**
  - Wyniki logów powinny być paginowane, aby uniknąć dużych odpowiedzi i nadmiernego obciążenia.

## 9. Etapy wdrożenia

1. Utworzenie schematu walidacji danych wejściowych (Zod) dla `CreateGenerationCommand`.
2. Implementacja logiki w warstwie serwisowej (np. w `src/lib/generationService.ts`):
   - Funkcja tworząca rekord generacji.
   - Funkcja obsługująca wywołanie usługi AI i aktualizację rekordu.
   - Funkcje logowania zdarzeń w tabeli `GenerationLog`.
3. Implementacja endpointu POST w `src/pages/api/generations/index.ts`:
   - Walidacja danych.
   - Tworzenie rekordu w bazie danych.
   - Enqueue background worker i logowanie zdarzenia.
4. Implementacja endpointu GET w `src/pages/api/generations/[id].ts`:
   - Pobieranie rekordu generacji oraz zabezpieczenie przed nieautoryzowanym dostępem.
5. Implementacja endpointu GET dla logów w `src/pages/api/generations/[id]/logs.ts`:
   - Pobieranie logów z uwzględnieniem paginacji.
6. Testowanie wszystkich scenariuszy:
   - Sukces: poprawne dane wejściowe i odpowiedzi.
   - Błędy: walidacja wejścia, nieautoryzowany dostęp, rekord nie istnieje.
7. Audyt bezpieczeństwa i optymalizacja wydajnościowe.
8. Dokumentacja i wdrożenie na środowisko produkcyjne.
