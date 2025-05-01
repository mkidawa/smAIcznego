# API Endpoint Implementation Plan: Profile Endpoint

## 1. Przegląd punktu końcowego

Endpoint służy do zarządzania profilem użytkownika. Umożliwia pobieranie (GET), tworzenie (POST) oraz aktualizację (PUT) danych profilu. Głównym celem jest zapewnienie spójnego interfejsu dostępu do danych profilu, przy jednoczesnym zachowaniu wysokich standardów bezpieczeństwa oraz walidacji danych.

## 2. Szczegóły żądania

- **Metody HTTP:**
  - GET - pobieranie profilu
  - POST - tworzenie początkowego profilu (błąd 409, gdy profil już istnieje)
  - PUT - aktualizacja istniejącego profilu
- **Struktura URL:** `/profile`
- **Parametry:**
  - Żądania GET: brak dodatkowych parametrów
  - Żądania POST/PUT (Request Body):
    - `age` (number, wymagane)
    - `gender` (string: 'male', 'female', 'other', wymagane)
    - `weight` (number, wymagane)
    - `allergies` (string[], wymagane)
    - `termsAccepted` (boolean, wymagane - musi być true przy pierwszej rejestracji)

## 3. Wykorzystywane typy

- **CreateProfileCommand**: DTO używane przy tworzeniu profilu, zawiera: `age`, `gender`, `weight`, `allergies`, `termsAccepted`.
- **UpdateProfileCommand**: DTO używane przy aktualizacji profilu, wszystkie pola są opcjonalne.
- **ProfileResponse**: DTO odpowiedzi, zawiera: `id`, `age`, `gender`, `weight`, `allergies`, `termsAccepted`, `createdAt`, oraz opcjonalnie `updatedAt`.

## 4. Szczegóły odpowiedzi

- **Udane operacje:**
  - POST: HTTP 201 Created, zwraca obiekt profilu typu ProfileResponse
  - PUT: HTTP 200 OK, zwraca obiekt profilu z opcjonalnym polem `updatedAt`
  - GET: HTTP 200 OK, zwraca obiekt profilu
- **Błędy:**
  - 400 (VALIDATION_FAILED): Nieprawidłowe dane wejściowe
  - 401 (UNAUTHORIZED): Brak lub nieważny token JWT
  - 403 (FORBIDDEN): Blokada dostępu przez RLS lub inne reguły autoryzacji
  - 404 (PROFILE_NOT_FOUND): Profil nie został znaleziony (np. przy GET lub PUT przed utworzeniem profilu)
  - 409 (PROFILE_ALREADY_EXISTS): Próba utworzenia profilu, gdy już istnieje

## 5. Przepływ danych

1. Klient wysyła żądanie na endpoint `/profile` z odpowiednią metodą HTTP.
2. Middleware weryfikuje token JWT i ustawia informacje o użytkowniku w `context.locals`.
3. Kontroler przekazuje dane do warstwy serwisowej.
4. Serwis:
   - Waliduje dane wejściowe zgodnie z wymaganiami DTO.
   - Dla POST: sprawdza, czy profil już istnieje w tabeli `Profile` (klucz główny `user_id`).
   - Dla PUT/GET: weryfikuje istnienie profilu.
5. Po komunikacji z bazą danych (Supabase) zwraca przetworzone dane lub odpowiedni błąd do klienta.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Wszystkie żądania muszą zawierać poprawny token JWT.
- **Autoryzacja:** Dostęp do danych jest zabezpieczony poprzez mechanizmy RLS w bazie danych (user_id musi odpowiadać tokenowi JWT).
- **Walidacja danych:** Wszystkie dane wejściowe są weryfikowane pod kątem poprawności (np. `age` >= 0, `weight` >= 0, `termsAccepted` musi być true przy pierwszym zapisie).
- **Bezpieczna transmisja:** Zapewnienie komunikacji poprzez HTTPS.

## 7. Obsługa błędów

- **Walidacja:** Zwracanie błędu 400, gdy dane wejściowe nie spełniają wymagań (np. niewłaściwa wartość `age`, `weight` lub `gender`).
- **Autoryzacja:** Zwracanie błędu 401 przy niepoprawnym lub brakującym tokenie JWT.
- **Dostęp do zasobów:** Zwracanie błędu 403, gdy operacja zostanie zablokowana przez reguły RLS.
- **Nieznalezienie zasobu:** Zwracanie błędu 404, gdy profil nie istnieje w przypadku operacji GET lub PUT.
- **Konflikty:** Zwracanie błędu 409 przy próbie utworzenia profilu, który już istnieje (POST).
- **Błędy serwera:** Zwracanie błędu 500 dla nieoczekiwanych problemów, z odpowiednim logowaniem błędów.

## 8. Rozważania dotyczące wydajności

- **Skalowalność:** Upewnienie się, że proces walidacji i autoryzacji nie wprowadza nadmiernych opóźnień.

## 9. Etapy wdrożenia

1. Aktualizacja lub utworzenie DTOs w `src/types.ts` zgodnie z wymaganiami (CreateProfileCommand, UpdateProfileCommand, ProfileResponse).
2. Implementacja middleware do uwierzytelniania i autoryzacji (weryfikacja tokena JWT).
3. Utworzenie kontrolera dla endpointu `/profile` obsługującego metody GET, POST, PUT.
4. Implementacja logiki serwisowej:
   - Walidacja danych wejściowych
   - Sprawdzenie istnienia profilu przed utworzeniem (POST)
   - Aktualizacja danych profilu (PUT)
5. Integracja z bazą danych Supabase, szczególnie z tabelą `Profile`.
6. Implementacja obsługi błędów z odpowiednimi kodami statusu (400, 401, 403, 404, 409, 500).
7. Testowanie jednostkowe i integracyjne endpointu.
8. Monitorowanie i optymalizacja wydajności na produkcji.
