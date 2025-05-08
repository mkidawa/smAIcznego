# Wdrożenie do projektu: smaAIcznego

## Witamy!

Witaj w zespole pracującym nad projektem **smaAIcznego**! Jest to aplikacja typu MVP (Minimum Viable Product), której celem jest pomoc użytkownikom w wyborze i personalizacji diety dostosowanej do ich indywidualnych potrzeb żywieniowych. Aplikacja wykorzystuje sztuczną inteligencję (za pośrednictwem OpenRouter.ai) do generowania planów dietetycznych, pozwala na zapisywanie preferencji użytkownika, automatyczne tworzenie list zakupów oraz bezpieczne zarządzanie kontem.

Mamy nadzieję, że to podsumowanie pomoże Ci szybko wdrożyć się w projekt.

## Przegląd i Struktura Projektu

Projekt **smaAIcznego** zbudowany jest w oparciu o nowoczesny stos technologiczny, obejmujący Astro, React, TypeScript, Tailwind CSS oraz Supabase jako backend. Struktura katalogów jest następująca i zgodna z przyjętymi w firmie standardami:

- `src/`: Główny katalog z kodem źródłowym.
  - `assets/`: Statyczne zasoby wewnętrzne.
  - `components/`: Komponenty UI (Astro statyczne, React dynamiczne).
    - `ui/`: Komponenty z biblioteki Shadcn/ui.
  - `db/`: Klienty Supabase i typy bazy danych.
  - `layouts/`: Layouty stron Astro.
  - `lib/`: Serwisy i funkcje pomocnicze.
  - `middleware/`: Middleware Astro.
  - `modules/`: Główne moduły biznesowe aplikacji.
  - `pages/`: Strony Astro (w tym `api/` dla endpointów API).
  - `styles/`: Globalne style.
  - `types.ts`: Współdzielone typy TypeScript.
- `public/`: Zasoby publiczne.
- `docs/`: Dokumentacja i zrzuty ekranu.
- `e2e/`: Testy End-to-End (Playwright).
- `supabase/`: Migracje i konfiguracja Supabase.
- `scripts/`: Skrypty pomocnicze.

Projekt wykorzystuje również Vitest do testów jednostkowych i integracyjnych, ESLint i Prettier do utrzymania jakości kodu, oraz GitHub Actions do CI/CD.

## Główne Moduły

Poniżej przedstawiamy kluczowe moduły aplikacji:

### `auth` (src/modules/auth, src/pages/api/auth)

- **Rola:** Odpowiada za cały proces uwierzytelniania i autoryzacji użytkowników, w tym rejestrację, logowanie, wylogowywanie, zarządzanie sesjami, resetowanie hasła i weryfikację tokenów.
- **Kluczowe Pliki/Obszary:**
  - `src/modules/auth/components/` (np. `NewPasswordForm.tsx`, formularze logowania/rejestracji)
  - `src/modules/auth/hooks/` (np. `useNewPassword.ts`)
  - `src/lib/services/auth.service.ts` (logika biznesowa)
  - `src/pages/api/auth/` (endpointy API: `login.ts`, `register.ts`, `logout.ts`, `reset-password.ts`, `verify-reset-token.ts`)
  - `src/middleware/index.ts` (obsługa sesji i ochrony tras)
- **Ostatni Fokus:** Intensywne prace nad funkcjonalnością resetowania hasła, weryfikacją tokenów oraz poprawkami bezpieczeństwa i UX w tym module.

### `profiles` (src/modules/profiles)

- **Rola:** Zarządzanie profilami użytkowników, w tym przechowywanie i edycja danych osobowych, preferencji żywieniowych (alergie, wymagania zdrowotne, wiek, waga).
- **Kluczowe Pliki/Obszary:** Prawdopodobnie komponenty do edycji profilu, serwis do interakcji z bazą danych.
- **Ostatni Fokus:** Nie zidentyfikowano intensywnych prac w ostatnich commitach, ale jest to kluczowy moduł dla personalizacji.

### `diets` (src/modules/diets)

- **Rola:** Główny moduł odpowiedzialny za logikę związaną z dietami, w tym interakcję z AI w celu generowania planów dietetycznych na podstawie parametrów użytkownika (kaloryczność, liczba posiłków, okres, rodzaj kuchni).
- **Kluczowe Pliki/Obszary:** Komponenty do wprowadzania parametrów diety, serwis do komunikacji z OpenRouter API, logika przetwarzania odpowiedzi AI.
- **Ostatni Fokus:** Nie zidentyfikowano intensywnych prac w ostatnich commitach, ale jest to centralna funkcjonalność aplikacji.

### `meals` (src/modules/meals)

- **Rola:** Prawdopodobnie obsługa poszczególnych posiłków w ramach wygenerowanej diety, wyświetlanie przepisów, informacji o wartościach odżywczych.
- **Kluczowe Pliki/Obszary:** Komponenty do wyświetlania szczegółów posiłków.
- **Ostatni Fokus:** Nie zidentyfikowano.

### `shoppingLists` (src/modules/shoppingLists)

- **Rola:** Automatyczne generowanie statycznej listy zakupów na podstawie wygenerowanego planu diety.
- **Kluczowe Pliki/Obszary:** Logika agregująca składniki z planu diety.
- **Ostatni Fokus:** Nie zidentyfikowano.

### `openRouter` (src/modules/openRouter)

- **Rola:** Moduł pośredniczący w komunikacji z API OpenRouter.ai, odpowiedzialny za wysyłanie zapytań i odbieranie odpowiedzi od modelu AI.
- **Kluczowe Pliki/Obszary:** Serwis lub klient API dla OpenRouter.
- **Ostatni Fokus:** Nie zidentyfikowano.

## Kluczowi Współtwórcy

Na podstawie ostatnich aktywności w repozytorium, głównym współtwórcą jest:

- **Michał Kidawa**: Aktywny w rozwoju modułu `auth` oraz poprawkach UI (np. `Navbar`).

_Informacja ta może być niepełna i warto ją zweryfikować z zespołem._

## Ogólne Wnioski i Ostatni Fokus

Projekt jest dobrze zorganizowaną aplikacją MVP z jasno zdefiniowanym celem. Wykorzystuje nowoczesne technologie i praktyki deweloperskie.
Ostatnie prace koncentrowały się głównie na:

- **Module `auth`**: Implementacja i poprawki funkcji związanych z bezpieczeństwem konta użytkownika, takich jak resetowanie hasła.
- **Poprawki UI/UX**: Ulepszenia w interfejsie użytkownika, np. w komponencie `Navbar`, dodawanie stanów ładowania.

## Potencjalne Obszary Złożoności / Na Co Zwrócić Uwagę

- **Integracja z AI (OpenRouter):** Zrozumienie, jak konstruowane są prompty, jak przetwarzane są odpowiedzi i jak zarządzane są ewentualne błędy komunikacji z AI, będzie kluczowe.
- **Zarządzanie Stanem i Sesjami Astro:** Projekt wykorzystuje eksperymentalne sesje Astro oraz Supabase SSR. Zrozumienie przepływu danych i zarządzania stanem (zwłaszcza między komponentami React a logiką Astro) może wymagać uwagi.
- **Bezpieczeństwo Modułu `auth`:** Jako że dotyczy danych użytkowników i uwierzytelniania, ten moduł wymaga szczególnej uwagi pod kątem bezpieczeństwa i najlepszych praktyk.
- **Formularze i Walidacja (`react-hook-form`, `zod`):** Logika formularzy, szczególnie tych bardziej złożonych (np. generowanie diety), może być skomplikowana.
- **Logika Generowania Listy Zakupów:** Przekształcanie danych z diety na listę zakupów może zawierać złożoną logikę biznesową.

## Pytania do Zespołu

Aby lepiej zrozumieć projekt, warto zadać zespołowi następujące pytania:

1. Jakie są dokładne przepływy danych i interakcje między modułami `diets`, `meals`, `openRouter` i `shoppingLists` podczas generowania diety i listy zakupów?
2. Jak wygląda szczegółowy schemat bazy danych w Supabase i jakie są kluczowe relacje między tabelami?
3. Jakie są najlepsze praktyki i konwencje przyjęte w projekcie dotyczące pisania testów (jednostkowych, integracyjnych, E2E)?
4. Czy istnieją jakieś specyficzne wyzwania lub "pułapki" związane z użyciem eksperymentalnych sesji Astro w połączeniu z Supabase?
5. Jakie są plany rozwoju aplikacji poza obecnym zakresem MVP?
6. Gdzie znajduje się bardziej szczegółowa dokumentacja dotycząca API OpenRouter używanego w projekcie (np. konkretne modele, parametry promptów)?
7. Jakie są główne kanały komunikacji zespołu i gdzie zgłaszać ewentualne problemy lub pytania?

## Następne Kroki

Sugerowane pierwsze kroki w projekcie:

1. **Zapoznaj się z `README.md`**: Zawiera ono wiele cennych informacji o projekcie, jego uruchomieniu i skryptach.
2. **Skonfiguruj środowisko deweloperskie**: Postępuj zgodnie z instrukcjami w `README.md` (Node.js z `.nvmrc`, `npm install`, konfiguracja zmiennych `.env`).
3. **Uruchom aplikację lokalnie**: `npm run dev` i przeklikaj dostępne funkcjonalności, aby zobaczyć, jak działa.
4. **Przejrzyj kod modułu `auth`**: Jest to obszar niedawnych zmian i dobry punkt startowy do zrozumienia, jak budowane są inne moduły.
5. **Spróbuj napisać prosty test jednostkowy lub E2E**: Pomoże to zapoznać się z konfiguracją testów i procesem ich uruchamiania.

## Konfiguracja Środowiska Deweloperskiego

1.  **Node.js**: Upewnij się, że masz zainstalowaną wersję Node.js zgodną z wpisem w pliku `.nvmrc` w głównym katalogu projektu. Możesz użyć `nvm` (Node Version Manager) do zarządzania wersjami Node.js.
    ```bash
    nvm use # Jeśli masz nvm i plik .nvmrc
    # lub zainstaluj odpowiednią wersję manualnie
    ```
2.  **Zależności**: Zainstaluj wszystkie zależności projektu za pomocą npm:
    ```bash
    npm install
    ```
3.  **Zmienne Środowiskowe**:
    - Skopiuj plik `.env.example` (jeśli istnieje) do `.env` lub utwórz plik `.env` ręcznie w głównym katalogu projektu.
    - Wypełnij go wymaganymi kluczami API i URLami, zgodnie ze schematem w `astro.config.mjs`:
      ```
      SUPABASE_URL=twoj_supabase_url
      SUPABASE_KEY=twoj_supabase_anon_key
      SUPABASE_SERVICE_ROLE_KEY=twoj_supabase_service_role_key # Używany po stronie serwera
      OPENROUTER_API_KEY=twoj_openrouter_api_key
      ```
      _Klucze te należy uzyskać od administratora projektu lub z odpowiednich dashboardów usług (Supabase, OpenRouter)._
4.  **Uruchomienie Serwera Deweloperskiego**:
    ```bash
    npm run dev
    ```
    Aplikacja powinna być dostępna pod adresem `http://localhost:3000` (lub innym portem, jeśli jest skonfigurowany inaczej).

## Pomocne Zasoby

- **Dokumentacja Projektu:** Głównie plik `README.md` w repozytorium.
- **Dokumentacja Technologii:**
  - [Astro](https://docs.astro.build/)
  - [React](https://react.dev/)
  - [Tailwind CSS](https://tailwindcss.com/docs)
  - [Shadcn/ui](https://ui.shadcn.com/)
  - [Supabase](https://supabase.com/docs)
  - [Vitest](https://vitest.dev/)
  - [Playwright](https://playwright.dev/docs/intro)
  - (Dokumentacja OpenRouter.ai - do znalezienia na ich stronie)
- **Repozytorium GitHub:** [Link do repozytorium projektu - wstaw tutaj, jeśli znasz]
- **Endpoint Healthcheck:** `/api/healthcheck` (do monitorowania stanu aplikacji)

Powodzenia!
