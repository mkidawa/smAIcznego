# Plan implementacji widoku Ekran Generowania Diety

## 1. Przegląd

Widok służy do wprowadzenia przez użytkownika parametrów diety (kaloryczność, liczba dni, liczba posiłków, preferowane kuchnie) oraz uruchomienia procesu generowania spersonalizowanego planu dietetycznego przy użyciu AI. Widok umożliwia wyświetlenie statusu generowania poprzez loader w formie paska postępu, informuje o błędach oraz umożliwia anulowanie operacji.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/diet/generate`.

## 3. Struktura komponentów

- **DietGenerateView** (główny komponent widoku)
  - **DietForm** – formularz do wprowadzania parametrów diety (używający React Hook Form i Zod do walidacji)
  - **ProgressBar** – wizualizacja postępu generowania diety
  - **ErrorAlert** – komponent do wyświetlania komunikatów o błędach (opcjonalnie)
  - Wbudowane komponenty UI z Shadcn/ui: Input, Select, Button

## 4. Szczegóły komponentów

### DietGenerateView

- **Opis:** Główny kontener widoku, łączący formularz wprowadzania danych oraz wizualizację postępu.
- **Główne elementy:**
  - Renderowanie komponentu `DietForm`
  - Renderowanie komponentu `ProgressBar` w trakcie generowania
  - Ewentualnie `ErrorAlert` dla komunikatów o błędach
- **Obsługiwane interakcje:** Przekazywanie danych z formularza do hooka odpowiedzialnego za wywołanie API
- **Typy:** Wykorzystuje typy DTO z `types.ts` (np. `CreateGenerationCommand` i `CreateGenerationResponse`)
- **Propsy:** Może przyjmować dodatkowe ustawienia konfiguracyjne (opcjonalnie)

### DietForm

- **Opis:** Formularz umożliwiający użytkownikowi wprowadzenie parametrów diety.
- **Główne elementy:**
  - Pola formularza: `calories_per_day` (input liczbowy), `number_of_days` (input liczbowy, zakres 1-14), `meals_per_day` (input liczbowy), `preferred_cuisines` (select wielokrotny)
  - Przycisk do uruchomienia generowania (Button z trybem loading)
- **Obsługiwane interakcje:** Walidacja na bieżąco przy użyciu React Hook Form i Zod, zdarzenie submitu
- **Obsługiwana walidacja:**
  - `number_of_days`: liczba z zakresu 1-14
  - `calories_per_day`: liczba dodatnia
  - `meals_per_day`: liczba większa od 0
  - `preferred_cuisines`: wartości muszą należeć do dozwolonego zbioru (np. "polish", "italian", "indian", "asian", "vegan", "vegetarian", "gluten-free", "keto", "paleo")
- **Typy:** Własny typ `GenerationFormValues` (rozszerzenie `CreateGenerationCommand`)
- **Propsy:** Funkcja `onSubmit` przekazana przez rodzica

### ProgressBar

- **Opis:** Komponent wizualizujący postęp generowania diety.
- **Główne elementy:** Pasek postępu z dynamicznie aktualizowaną wartością
- **Obsługiwane interakcje:** Brak bezpośredniej interakcji; tylko aktualizacja stanu na podstawie postępu operacji
- **Typy:** Prostą strukturę stanu (np. wartość procentowa postępu)

### ErrorAlert (opcjonalnie)

- **Opis:** Komponent do wyświetlania komunikatów o błędach
- **Główne elementy:** Tekst błędu, przycisk zamknięcia
- **Obsługiwane interakcje:** Kliknięcie przycisku zamknięcia ukrywa alert
- **Typy:** Prosty typ zawierający komunikat błędu

## 5. Typy

- **GenerationFormValues:**
  ```typescript
  interface GenerationFormValues {
    number_of_days: number;
    calories_per_day: number;
    meals_per_day: number;
    preferred_cuisines: string[]; // wartości zgodne z enum: 'polish', 'italian', 'indian', 'asian', 'vegan', 'vegetarian', 'gluten-free', 'keto', 'paleo'
  }
  ```
- **DTO:** Korzystamy z typu `CreateGenerationCommand` jako danych wejściowych oraz `CreateGenerationResponse` jako typ odpowiedzi z API

## 6. Zarządzanie stanem

- Użycie **React Hook Form** do zarządzania formularzem i walidacji danych.
- Użycie hooka **useState** do przechowywania stanu operacji, np. `isLoading`, `progress`, `error`.
- Możliwy customowy hook **useGenerateDiet** odpowiedzialny za wywołanie API i aktualizację stanu generowania

## 7. Integracja API

- **Endpoint:** POST `/generations`
- **Request:** Wysyłamy obiekt typu `CreateGenerationCommand`:
  ```json
  {
    "number_of_days": 7,
    "calories_per_day": 2200,
    "meals_per_day": 5,
    "preferred_cuisines": ["italian", "vegetarian"]
  }
  ```
- **Response:** Oczekujemy odpowiedzi w formacie:
  ```json
  {
    "generation_id": 456,
    "status": "pending"
  }
  ```
- **Integracja:** Po poprawnym wysłaniu formularza wywołujemy API, ustawiamy stan `isLoading`, wyświetlamy `ProgressBar` podczas przetwarzania oraz obsługujemy ewentualne błędy (VALIDATION_FAILED, SERVER_ERROR)

## 8. Interakcje użytkownika

- Użytkownik wypełnia formularz parametrami diety.
- Po kliknięciu przycisku generowania formularz jest walidowany i wysyłany do API.
- W trakcie oczekiwania wyświetlany jest progres lub loader.
- W przypadku błędu użytkownik otrzymuje odpowiedni komunikat i możliwość poprawienia danych.
- Opcjonalnie: możliwość anulowania operacji, np. przycisk "Anuluj".

## 9. Warunki i walidacja

- Walidacja danych we frontendzie za pomocą Zod przed wysłaniem do backendu:
  - `number_of_days`: musi być liczbą w zakresie 1-14
  - `calories_per_day`: liczba dodatnia
  - `meals_per_day`: liczba większa od 0
  - `preferred_cuisines`: wybór spośród predefiniowanych wartości
- Walidacja odpowiedzi API: w przypadku wystąpienia błędów wyświetlanie komunikatów opartych na strukturze błędu (VALIDATION_FAILED, SERVER_ERROR)

## 10. Obsługa błędów

- Wyświetlanie komunikatów dla błędów walidacji po stronie klienta oraz serwera.
- Użycie komponentu `ErrorAlert` do prezentacji komunikatów o błędach.
- Logowanie błędów w konsoli dla celów debugowania.
- Obsługa sytuacji, gdy API nie odpowiada lub zwraca status inny niż oczekiwany.

## 11. Kroki implementacji

1. Utworzenie nowej strony widoku pod ścieżką `/diet/generate` (plik w `src/pages/diet/generate.astro`).
2. Stworzenie głównego komponentu `DietGenerateView` w `src/components`.
3. Implementacja `DietForm` z użyciem React Hook Form i Zod, wraz z polami: inputy dla kaloryczności, liczby dni, liczby posiłków oraz select dla preferowanych kuchni.
4. Integracja komponentów UI z Shadcn/ui (Input, Select, Button) oraz utworzenie komponentu `ProgressBar`.
5. Utworzenie custom hooka `useGenerateDiet` do wywołania API (POST `/generations`) i obsługi stanu generowania.
6. Podpięcie logiki formularza: walidacja, wysyłanie danych, aktualizacja stanu `isLoading`, `progress` oraz obsługa błędów.
7. Dodanie obsługi interakcji użytkownika (np. kliknięcie przycisku, wyświetlanie komunikatów, opcjonalne anulowanie operacji).
8. Przeprowadzenie testów funkcjonalnych: walidacja formularza, integracja z API, poprawność wyświetlania paska postępu i komunikatów o błędach.
9. Weryfikacja responsywności widoku oraz zgodności z wytycznymi UX i dostępności.
10. Uzupełnienie komentarzy w kodzie oraz dokumentacji, aby inni programiści mogli łatwo wdrożyć widok.
