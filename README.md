# smaAIcznego

## Spis treści

- [Opis Projektu](#opis-projektu)
- [Stos Technologiczny](#stos-technologiczny)
- [Uruchomienie Lokalnie](#uruchomienie-lokalnie)
- [Dostępne Skrypty](#dostępne-skrypty)
- [Zakres Projektu](#zakres-projektu)
- [Status Projektu](#status-projektu)
- [CI/CD](#cicd)
- [Licencja](#licencja)
- [Testowanie](#testowanie)

## Opis Projektu

Aplikacja **smaAIcznego** to MVP mające na celu pomoc użytkownikom w wyborze i personalizacji diety dostosowanej do indywidualnych potrzeb żywieniowych. Główne funkcjonalności obejmują:

- Generowanie spersonalizowanych planów dietetycznych przy użyciu systemu AI (Openrouter.ai) na podstawie wybranych parametrów (kaloryczność, liczba posiłków, okres trwania diety, rodzaj kuchni).
- Zapisywanie stałych preferencji użytkownika, takich jak alergie, wymagania zdrowotne, wiek czy waga.
- Automatyczne tworzenie statycznej listy zakupów na podstawie wygenerowanego planu diety.
- Bezpieczną rejestrację i logowanie oraz zarządzanie kontem użytkownika.

## Stos Technologiczny

**Frontend:**

- Astro 5
- React 19
- TypeScript 5
- Tailwind CSS 4
- Shadcn/ui

**Backend:**

- Supabase (PostgreSQL, autentykacja użytkowników)
- Integracja z Openrouter.ai

**Testy:**

- Vitest - testy jednostkowe i integracyjne
- MSW (Mock Service Worker) - mockowanie API w testach
- Playwright - testy end-to-end
- Lighthouse CI - testy wydajnościowe
- Codecov - pomiar pokrycia kodu testami

**CI/CD i Hosting:**

- Github Actions
- DigitalOcean

## Uruchomienie Lokalnie

1. Upewnij się, że masz zainstalowaną odpowiednią wersję Node.js (sprawdź zawartość pliku `.nvmrc`).
2. Zainstaluj zależności:

   ```bash
   npm install
   ```

3. Uruchom aplikację w trybie developerskim:

   ```bash
   npm run dev
   ```

## Dostępne Skrypty

- `npm run dev` – Uruchamia serwer developerski Astro.
- `npm run dev:e2e` – Uruchamia serwer developerski Astro w trybie testowym.
- `npm run build` – Buduje aplikację do środowiska produkcyjnego.
- `npm run preview` – Podgląd zbudowanej aplikacji.
- `npm run preview:e2e` – Podgląd zbudowanej aplikacji w trybie testowym.
- `npm run astro` – Uruchamia polecenia CLI Astro.
- `npm run lint` – Sprawdza kod za pomocą ESLint.
- `npm run lint:fix` – Automatycznie naprawia wykryte problemy w kodzie.
- `npm run format` – Formatuje kod przy użyciu Prettier.
- `npm run test` – Uruchamia testy jednostkowe z Vitest (jednokrotnie).
- `npm run test:watch` – Uruchamia testy w trybie watch (ciągłym).
- `npm run test:ui` – Uruchamia testy w interaktywnym interfejsie graficznym.
- `npm run test:coverage` – Generuje raport pokrycia kodu testami.
- `npm run test:e2e` – Uruchamia testy end-to-end z Playwright.
- `npm run test:e2e:ui` – Uruchamia testy e2e w interfejsie graficznym.
- `npm run test:e2e:codegen` – Uruchamia generator testów e2e.

## Zakres Projektu

Projekt skupia się na realizacji następujących funkcjonalności:

- **Generowanie diety:** Użytkownik może wprowadzić parametry takie jak kaloryczność, liczba posiłków, okres trwania diety oraz rodzaj kuchni, na podstawie których system AI generuje plan żywieniowy.
- **Profil użytkownika:** Rejestracja, logowanie oraz możliwość edycji danych profilowych (wiek, waga, alergie, wymagania zdrowotne).
- **Lista zakupów:** Automatyczne generowanie statycznej listy zakupów na podstawie wygenerowanego planu diety.
- **Wyświetlanie diety:** Prezentacja pełnego planu diety wraz z harmonogramem posiłków oraz możliwością podglądu szczegółowych przepisów.

Należy zauważyć, że w ramach MVP:

- Nie implementujemy systemu rekomendacji diet.
- Lista zakupów pozostaje statyczna bez możliwości edycji.

## CI/CD

Projekt wykorzystuje GitHub Actions do automatyzacji procesów CI/CD:

### Workflow `ci.yml`

Uruchamiany przy każdym push na branch `main` oraz manualnie:

- **Lint** - weryfikacja zgodności kodu ze standardami
- **Unit Tests** - wykonanie testów jednostkowych z raportem pokrycia kodu
- **E2E Tests** - wykonanie testów end-to-end w środowisku integracyjnym

### Workflow `main.yml`

Uruchamiany przy tworzeniu nowych tagów oraz manualnie:

- **Lint** - weryfikacja zgodności kodu ze standardami
- **Unit Tests** - wykonanie testów jednostkowych
- **Build and Deploy** - budowanie aplikacji i wdrażanie jej do Cloudflare Pages

### Workflow `pull-request.yml`

Uruchamiany dla każdego pull request do branch `main` oraz manualnie:

- **Lint** - weryfikacja zgodności kodu ze standardami
- **Unit Tests** - wykonanie testów jednostkowych
- **E2E Tests** - wykonanie testów end-to-end
- **Status Comment** - automatyczne dodanie komentarza do PR z podsumowaniem weryfikacji

## Licencja

Projekt jest udostępniany na licencji MIT.

## Testowanie

Aplikacja wykorzystuje dwa główne rodzaje testów:

### Testy jednostkowe i integracyjne (Vitest)

Testy jednostkowe i integracyjne służą do weryfikacji poprawności działania pojedynczych komponentów i ich interakcji.

Dostępne komendy:

- `npm run test` - uruchamia wszystkie testy jednostkowe
- `npm run test:watch` - uruchamia testy w trybie watch
- `npm run test:ui` - uruchamia testy w interaktywnym interfejsie graficznym
- `npm run test:coverage` - generuje raport pokrycia kodu testami

Struktura testów jednostkowych:

- Pliki testowe powinny mieć rozszerzenie `.test.tsx` lub `.test.ts`
- Testy powinny znajdować się obok testowanych plików
- Do mockowania API używamy Mock Service Worker (MSW)

### Testy end-to-end (Playwright)

Testy e2e służą do testowania aplikacji w całości, symulując interakcje użytkownika w przeglądarce.

Dostępne komendy:

- `npm run test:e2e` - uruchamia wszystkie testy e2e
- `npm run test:e2e:ui` - uruchamia testy e2e w interfejsie graficznym
- `npm run test:e2e:codegen` - uruchamia generator testów e2e

Struktura testów e2e:

- Testy znajdują się w katalogu `e2e`
- Wykorzystujemy wzorzec Page Object Model do organizacji kodu testów
- Wykonujemy testy tylko na przeglądarce Chrome zgodnie z wymaganiami projektu
