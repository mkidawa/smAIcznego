# smaAIcznego

## Spis treści

- [Opis Projektu](#opis-projektu)
- [Stos Technologiczny](#stos-technologiczny)
- [Uruchomienie Lokalnie](#uruchomienie-lokalnie)
- [Dostępne Skrypty](#dostępne-skrypty)
- [Zakres Projektu](#zakres-projektu)
- [Status Projektu](#status-projektu)
- [Licencja](#licencja)

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
- `npm run build` – Buduje aplikację do środowiska produkcyjnego.
- `npm run preview` – Podgląd zbudowanej aplikacji.
- `npm run lint` – Sprawdza kod za pomocą ESLint.
- `npm run lint:fix` – Automatycznie naprawia wykryte problemy w kodzie.
- `npm run format` – Formatuje kod przy użyciu Prettier.

## Zakres Projektu

Projekt skupia się na realizacji następujących funkcjonalności:

- **Generowanie diety:** Użytkownik może wprowadzić parametry takie jak kaloryczność, liczba posiłków, okres trwania diety oraz rodzaj kuchni, na podstawie których system AI generuje plan żywieniowy.
- **Profil użytkownika:** Rejestracja, logowanie oraz możliwość edycji danych profilowych (wiek, waga, alergie, wymagania zdrowotne).
- **Lista zakupów:** Automatyczne generowanie statycznej listy zakupów na podstawie wygenerowanego planu diety.
- **Wyświetlanie diety:** Prezentacja pełnego planu diety wraz z harmonogramem posiłków oraz możliwością podglądu szczegółowych przepisów.

\_Należy zauważyć, że w ramach MVP:

- Nie implementujemy systemu rekomendacji diet.
- Lista zakupów pozostaje statyczna bez możliwości edycji.\_

## Status Projektu

Projekt znajduje się w fazie MVP. Główne funkcjonalności są wdrażane i testowane. Dalszy rozwój planowany jest po uzyskaniu opinii użytkowników.

## Licencja

Projekt jest udostępniany na licencji MIT.
