# Specyfikacja modułu autentykacji

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Podział widoków i layoutów

- Utworzymy dedykowane strony Astro do obsługi procesów autentykacji: logowania, rejestracji oraz resetowania hasła. Strony te będą wykorzystywały izolowane layouty umożliwiające prezentację widoków "auth" (dla niezalogowanych użytkowników) oraz "non-auth" (dla użytkowników zalogowanych), zgodnie z istniejącą strukturą aplikacji.
- Layouty zostaną rozszerzone o mechanizmy przekierowywania niezalogowanych użytkowników do strony logowania, korzystając z middleware (plik: `./src/middleware/index.ts`).

### Komponenty i odpowiedzialności

- Formularze logowania, rejestracji oraz resetowania hasła zostaną zaimplementowane jako interaktywne komponenty React (umieszczone m.in. w `./src/components` lub `./src/components/ui`), korzystające z Shadcn/ui dla spójnego wyglądu.
- Formularze będą posiadały walidację po stronie klienta (np. z wykorzystaniem React Hook Form i/lub Zod) oraz prezentację komunikatów błędów (np. brak wprowadzenia danych, niepoprawny format email, niespełnienie kryteriów hasła).
- Strony Astro będą odpowiedzialne za integrację komponentów i obsługę nawigacji, wysyłając dane do backendu poprzez odpowiednie endpointy API.

### Przypadki walidacji i obsługa błędów

- Klient: Walidacja formularzy przed wysłaniem (np. pola obowiązkowe, format email, potwierdzenie hasła) oraz wyświetlanie komunikatów błędów w przypadku nieprawidłowych danych.
- Serwer: Dodatkowa walidacja w endpointach API. W przypadku wykrycia błędów zwracane są przyjazne komunikaty, a formularze mogą być dezaktywowane lub informowane o konieczności poprawy danych.
- Scenariusze:
  - Użytkownik próbuje zalogować się z nieprawidłowymi danymi – wyświetlany jest komunikat o błędnym haśle lub braku konta.
  - Podczas rejestracji, jeżeli podane dane są niekompletne lub błędne, system wyświetla szczegółowe wskazówki.
  - W procesie odzyskiwania hasła informujemy użytkownika o wysłaniu linku resetującego, bądź o problemie, jeśli email nie jest zarejestrowany.

## 2. LOGIKA BACKENDOWA

### Struktura endpointów API

- Utworzymy nowy folder `./src/pages/api/auth` zawierający poszczególne endpointy:
  - `register.ts` – obsługa rejestracji użytkownika
  - `login.ts` – obsługa logowania
  - `logout.ts` – proces wylogowania
  - `reset-password.ts` – mechanizm inicjacji procesu resetowania hasła (np. wysłanie emaila z linkiem do resetu)

### Modele danych i walidacja

- Definicja modeli danych i kontraktów (DTO) przy użyciu TypeScript oraz ewentualnie biblioteki Zod dla walidacji:
  - Przykładowy interfejs rejestracji: { email: string, password: string, confirmPassword: string, dodatkowe dane profilowe (opcjonalnie) }.
  - Interfejs logowania: { email: string, password: string }.
- Walidacja wejściowych danych nastąpi w każdym endpointcie, z wykorzystaniem schematów walidacyjnych.

### Obsługa wyjątków i bezpieczeństwo

- Każdy endpoint będzie zabezpieczony przy użyciu bloków try/catch. W przypadku wystąpienia błędu, logujemy zdarzenie i zwracamy przyjazny komunikat dla użytkownika.
- Użyjemy mechanizmu middleware (plik: `./src/middleware/index.ts`) dla stron wymagających autoryzacji, który przechwyci żądania bez ważnej sesji i przekieruje użytkownika do strony logowania.
- Aktualizacja sposobu renderowania stron server-side: strony chronione (dostępne tylko dla zalogowanych użytkowników) będą renderowane po weryfikacji sesji, co uwzględni konfigurację zawartą w `astro.config.mjs`.

## 3. SYSTEM AUTENTYKACJI

### Wykorzystanie Supabase Auth

- System autentykacji zostanie oparty na Supabase Auth, który zapewnia bezpieczne zarządzanie rejestracją, logowaniem, wylogowywaniem oraz resetowaniem hasła.
- Konfiguracja klienta Supabase zostanie umieszczona w katalogu `./src/db`, gdzie znajdą się odpowiednie klucze API oraz skonfigurowany klient Supabase.

### Integracja z front-endem i backendem

- Frontend: Komponenty React będą wykorzystywały instancję klienta Supabase do wysyłania żądań autoryzacyjnych. Stan aplikacji będzie aktualizowany na podstawie odpowiedzi z API (np. sukces logowania, pojawienie się błędów walidacyjnych).
- Backend: Endpointy API będą komunikowały się bezpośrednio z Supabase Auth przy użyciu dedykowanych metod (np. supabase.auth.signUp, supabase.auth.signIn, supabase.auth.signOut, supabase.auth.api.resetPasswordForEmail).
- Middleware: Weryfikacja sesji użytkownika w middleware przed dostępem do chronionych zasobów.

### Bezpieczeństwo i zarządzanie sesją

- Supabase Auth zadba o przechowywanie bezpiecznych haseł oraz zarządzanie tokenami (JWT lub cookie).
- Uwierzytelnianie odbywa się za pomocą bezpiecznego połączenia HTTPS oraz mechanizmu wygaśnięcia sesji.
- System przewiduje automatyczne wylogowanie po upływie ważności sesji oraz umożliwia ręczne wylogowanie poprzez endpoint `logout.ts`.

## Podsumowanie

Kluczowe komponenty i moduły:

- Strony Astro dla widoków autentykacyjnych z dedykowanymi layoutami dla auth i non-auth.
- Dynamiczne komponenty React (z Shadcn/ui) obsługujące formularze i walidację danych.
- Endpointy API w katalogu `./src/pages/api/auth` do obsługi rejestracji, logowania, wylogowywania i resetowania hasła.
- Middleware w `./src/middleware/index.ts` do weryfikacji sesji oraz autoryzacji użytkowników.
- System Supabase Auth zarządzający uwierzytelnieniem, przechowywaniem danych i bezpieczeństwem, integrowany zarówno po stronie frontendu, jak i backendu.
- Mechanizmy walidacji, obsługi wyjątków i logowania błędów, zapewniające stabilność i bezpieczeństwo całej aplikacji.

Ta specyfikacja powinna być zgodna z dotychczasowym działaniem aplikacji opisanym w dokumentacji PRD oraz stackiem technologicznym (Astro 5, TypeScript 5, React 19, Tailwind 4, Shadcn/ui, Supabase).
