# Plan testów dla projektu smaAIcznego

## 1. Wprowadzenie

### Cel planu testów

Celem planu testów jest zapewnienie jakości i stabilności aplikacji smaAIcznego poprzez zaplanowanie, przeprowadzenie i udokumentowanie testów funkcjonalnych, integracyjnych, e2e oraz testów wydajnościowych i bezpieczeństwa.

### Zakres testów

- Testy funkcjonalne wszystkich endpointów API (profil, diety, posiłki, generacje, autentykacja).
- Testy UI dla kluczowych formularzy i widoków (rejestracja, logowanie, profil, generowanie diety, przegląd diety, szczegóły przepisu).
- Testy integracyjne z Supabase Auth i Openrouter.ai.
- Testy bezpieczeństwa i autoryzacji (RLS, JWT, zapobieganie nieautoryzowanemu dostępowi).
- Testy wydajnościowe krytycznych ścieżek (generowanie diety, pobieranie list diet).

## 2. Strategia testowania

### Typy testów do przeprowadzenia

- Testy jednostkowe (TypeScript, logika serwisów, walidacja Zod) z wykorzystaniem **Vitest**.
- Testy integracyjne (API → baza Supabase, middleware) z wykorzystaniem **MSW**.
- Testy end-to-end (**Playwright**) – pełne scenariusze użytkownika.
- Testy bezpieczeństwa (sprawdzanie RLS, nieautoryzowane próby).
- Testy wydajnościowe (**Lighthouse CI**) dla krytycznych ścieżek.

### Priorytety testowania

1. Bezpieczeństwo i autoryzacja (autentykacja, RLS).
2. Funkcjonalność API (profil, diety, posiłki, generacje).
3. Ścieżki asynchroniczne (AI, generowanie diety, pasek postępu).
4. UI i walidacja formularzy.
5. Wydajność i skalowalność (generowanie, paginacja).

## 3. Środowisko testowe

### Wymagania sprzętowe i programowe

- System operacyjny: Windows 10+ / Linux / macOS.
- **Node.js 20+ (LTS)** oraz npm.
- Dostęp do instancji testowej Supabase.
- Klucze testowe Openrouter.ai.
- **MSW** dla mockowania API w testach integracyjnych i jednostkowych.

### Konfiguracja środowiska

1. Sklonować repozytorium projektu.
2. Utworzyć plik `.env.test` z danymi do Supabase (URL, anon key) i Openrouter.ai.
3. Uruchomić `npm install`.
4. Przygotować bazę testową Supabase (migracje, RLS).
5. Uruchomić serwer dev: `npm run dev -- --port 3001`.
6. Uruchomić testy jednostkowe: `npm run test:unit`.
7. Uruchomić testy e2e: `npm run test:e2e`.
8. Skonfigurować **handlers MSW** dla testów API.

## 4. Przypadki testowe

### 4.1 Autentykacja i autoryzacja

#### TC-Auth-01: Rejestracja nowego użytkownika

- Kroki:
  1. Wysłać POST `/api/auth/register` z poprawnym `email` i `password`.
  2. Sprawdzić HTTP 201 oraz utworzenie konta w Supabase.
- Oczekiwany rezultat: Konto utworzone, zwrócony token.
- **Wykorzystanie MSW**: Mockowanie odpowiedzi Supabase dla testów niezależnych od zewnętrznego API.

#### TC-Auth-02: Logowanie użytkownika

- Kroki:
  1. Wysłać POST `/api/auth/login` z prawidłowymi danymi.
  2. Sprawdzić HTTP 200 oraz zwrócony JWT.
- Oczekiwany rezultat: Sesja aktywna, poprawny token.
- **Wykorzystanie MSW**: Symulacja różnych scenariuszy logowania.

#### TC-Auth-03: Próba dostępu do chronionej ścieżki bez JWT

- Kroki:
  1. Wysłać GET `/profile` bez nagłówka `Authorization`.
- Oczekiwany rezultat: HTTP 401 i kod `UNAUTHORIZED`.
- **Testowanie w Playwright**: Sprawdzenie przekierowań w scenariuszach E2E.

### 4.2 Profil użytkownika

#### TC-Profile-01: Pobranie profilu istniejącego użytkownika

- Kroki:
  1. Wysłać GET `/api/profile` z poprawnym JWT.
- Oczekiwany rezultat: HTTP 200 oraz obiekt `Profile`.
- **REST Client/Insomnia**: Dokumentacja testów ręcznych API.

#### TC-Profile-02: Zapis nowego profilu

- Kroki:
  1. Wysłać POST `/api/profile` z danymi {age, weight, gender, allergies, terms_accepted}.
- Oczekiwany rezultat: HTTP 201 i obiekt profilu.
- **Walidacja Zod**: Testy jednostkowe walidacji wejścia.

### 4.3 Generowanie diety i logika AI

#### TC-Gen-01: Inicjalizacja generacji diety

- Kroki:
  1. Wysłać POST `/api/generations` z valid payload.
- Oczekiwany rezultat: HTTP 202 oraz `generation_id`.
- **MSW**: Mockowanie długotrwałych procesów AI dla testów.

#### TC-Gen-02: Symulacja błędu AI

- Kroki:
  1. Skonfigurować testowe wywołanie AI zwracające błąd.
  2. Upewnić się, że logi zawierają event `error` i status `failed`.
- **Testowanie obsługi błędów**: Sprawdzenie w Vitest.

### 4.4 Diety, Posiłki i Lista zakupów

#### TC-Diet-01: Utworzenie szkieletu diety

- Kroki:
  1. POST `/api/diets` z payload {number_of_days, calories_per_day, preferred_cuisines, generation_id}.
- Oczekiwany rezultat: HTTP 201, status `draft`.
- **GitHub Actions**: Automatyczne testy endpointów przy PR.

#### TC-Diet-02: Bulk utworzenie posiłków

- Kroki:
  1. POST `/api/diets/{dietId}/meals` z listą posiłków.
- Oczekiwany rezultat: HTTP 201, odpowiedź z utworzonymi ID.

#### TC-Diet-03: Utworzenie listy zakupów

- Kroki:
  1. POST `/api/diets/{dietId}/shopping-list` z array `items`.
- Oczekiwany rezultat: HTTP 201, unikalne ID listy.

### 4.5 UI Formularze i widoki

#### TC-UI-01: Formularz generowania diety

- Kroki:
  1. Przejść do `/diets/generate`.
  2. Wprowadzić dane i kliknąć „Generuj".
- Oczekiwany rezultat: Widoczny progress bar, przekierowanie do `/diets`.
- **Playwright**: Testowanie widoczności elementów UI.

#### TC-UI-02: Przegląd diety i lista zakupów

- Kroki:
  1. Przejść do `/diets`.
  2. Sprawdzić harmonogram i elementy listy.
- Oczekiwany rezultat: Zgodność z wygenerowanymi danymi.
- **MSW**: Mockowanie odpowiedzi API dla testów komponentów React.

## 5. Harmonogram testów

| Faza                 | Priorytet | Szacowany czas |
| -------------------- | --------- | -------------- |
| Testy bezpieczeństwa | Wysoki    | 2 dni          |
| Testy API - Profil   | Wysoki    | 1 dzień        |
| Testy API - Diety    | Wysoki    | 1.5 dnia       |
| Testy AI i Generacji | Średni    | 1 dzień        |
| Testy UI i E2E       | Średni    | 2 dni          |
| Testy wydajnościowe  | Niski     | 1 dzień        |

## 6. Role i odpowiedzialności

- Test Lead: opracowanie planu testów, nadzór.
- Inżynier testów API: implementacja testów jednostkowych i integracyjnych (Vitest, MSW).
- Inżynier testów E2E: scenariusze Playwright.
- DevOps/TestOps: konfiguracja środowisk testowych, **GitHub Actions CI/CD**.

## 7. Kryteria akceptacji

- Wszystkie testy jednostkowe i integracyjne przechodzą z pokryciem >80% (raportowane przez **Codecov**).
- Brak krytycznych i wysokich błędów otwartych.
- Testy e2e wykonane bez awarii.
- Akceptacyjne testy wydajnościowe spełniają ustalone progi (weryfikowane przez **Lighthouse CI**).

## 8. Raportowanie i śledzenie błędów

- Narzędzie: **Linear lub GitHub Issues**.
- Szablon zgłoszenia: krok odtworzenia, oczekiwany vs. rzeczywisty rezultat, zrzuty ekranu/logi.
- Regularne spotkania daily QA.
- **GitHub Actions**: Automatyczne zgłaszanie błędów przy nieudanych testach.

## 9. Ryzyka i plany awaryjne

- Niewystarczająca stabilność AI → fallback lokalne mocki generacji w **MSW**.
- Problemy z RLS/Supabase → testowe konta serwisowe, analiza logów.
- Błędy środowiskowe CI/CD → możliwość ręcznego uruchomienia testów lokalnie.
- **Testy flaky (niestabilne)** → retries w Playwright, izolacja środowiska testowego.

## 10. Narzędzia i technologie

| Kategoria           | Narzędzia                                               |
| ------------------- | ------------------------------------------------------- |
| Testy jednostkowe   | **Vitest**                                              |
| Testy integracyjne  | **MSW (Mock Service Worker)**, **Insomnia/REST Client** |
| Testy E2E           | **Playwright**                                          |
| Mockowanie API      | **MSW**                                                 |
| CI/CD               | **GitHub Actions**                                      |
| Analiza wydajności  | **Lighthouse CI**                                       |
| Raportowanie błędów | **Linear/GitHub Issues**                                |
| Pokrycie kodu       | **Codecov**                                             |
