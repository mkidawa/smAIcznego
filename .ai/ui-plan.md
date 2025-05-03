# Architektura UI dla smaAIcznego

## 1. Przegląd struktury UI

Interfejs użytkownika jest zbudowany przy użyciu Astro 5 i React 19, z integracją Tailwind CSS 4 oraz komponentów z biblioteki Shadcn/ui. Cała aplikacja wykorzystuje spójny layout, w którym stały pasek nawigacyjny dostępny jest na wszystkich widokach. Struktura UI jest zaprojektowana w taki sposób, aby zapewnić użytkownikom intuicyjną nawigację, wysoką dostępność oraz bezpieczeństwo. Widoki interfejsu odpowiadają kluczowym funkcjom opisanym w dokumentach PRD i planie API.

## 2. Lista widoków

- **Ekran Rejestracji**

  - Ścieżka widoku: `/register`
  - Główny cel: Umożliwienie utworzenia konta przez użytkownika w dwustopniowym procesie (dane logowania oraz uzupełnienie profilu).
  - Kluczowe informacje do wyświetlenia: Formularz rejestracji (email, hasło) oraz osobny formularz edycji profilu (wiek, waga, alergie, wymagania zdrowotne).
  - Kluczowe komponenty: Input, Button, formularz walidowany przez react hook form i Zod, Toast do komunikatów błędów i sukcesu.
  - Uwagi dotyczące UX, dostępności i bezpieczeństwa: Natychmiastowa walidacja, czytelny układ, ochrona danych użytkowników.

- **Ekran Logowania**

  - Ścieżka widoku: `/login`
  - Główny cel: Umożliwienie użytkownikowi logowania się do systemu przy użyciu danych konta.
  - Kluczowe informacje do wyświetlenia: Formularz logowania (email, hasło) z obsługą JWT z Supabase.
  - Kluczowe komponenty: Input, Button, Toast.
  - Uwagi dotyczące UX, dostępności i bezpieczeństwa: Prosty interfejs, błyskawiczna walidacja, mechanizmy zabezpieczające przed atakami (np. brute force).

- **Ekran Edycji Profilu**

  - Ścieżka widoku: `/profile/edit`
  - Główny cel: Umożliwienie użytkownikowi uzupełnienia i edycji szczegółowych danych profilowych.
  - Kluczowe informacje do wyświetlenia: Formularz zawierający dane użytkownika, w tym wiek, wagę, alergie i wymagania zdrowotne.
  - Kluczowe komponenty: Input, Select, Button, formularz walidowany przez react hook form i Zod.
  - Uwagi dotyczące UX, dostępności i bezpieczeństwa: Responsywny i intuicyjny interfejs z natychmiastową walidacją oraz bezpiecznym przechowywaniem danych.

- **Ekran Generowania Diety**

  - Ścieżka widoku: `/diets/generate`
  - Główny cel: Pozwolenie użytkownikowi na wprowadzenie parametrów diety oraz uruchomienie procesu generowania planu dietetycznego.
  - Kluczowe informacje do wyświetlenia: Formularz z parametrami (kaloryczność, liczba dni, liczba posiłków, preferowane kuchnie) oraz wizualizacja postępu (loader w formie paska postępu).
  - Kluczowe komponenty: Input, Select, Button, Progress Bar, formularz walidowany przez react hook form i Zod.
  - Uwagi dotyczące UX, dostępności i bezpieczeństwa: Jasna informacja o statusie generowania, obsługa błędów oraz możliwość anulowania operacji.

- **Ekran Przeglądu Diety i Listy Zakupów**

  - Ścieżka widoku: `/diets`
  - Główny cel: Prezentacja wygenerowanego planu diety wraz z dołączoną listą zakupów.
  - Kluczowe informacje do wyświetlenia: Harmonogram posiłków, lista zakupów oraz podsumowanie kluczowych elementów diety.
  - Kluczowe komponenty: Card, List, Button, Toast dla komunikatów.
  - Uwagi dotyczące UX, dostępności i bezpieczeństwa: Czytelny layout umożliwiający szybki podgląd oraz powrót do wcześniejszych ekranów.

- **Ekran Szczegółów Przepisu**
  - Ścieżka widoku: `/recipe/:id`
  - Główny cel: Wyświetlenie szczegółowych instrukcji przygotowania wybranego posiłku.
  - Kluczowe informacje do wyświetlenia: Tytuł przepisu, lista składników, szczegółowe instrukcje krok po kroku.
  - Kluczowe komponenty: Detailed Card, Text, Button.
  - Uwagi dotyczące UX, dostępności i bezpieczeństwa: Przejrzysta prezentacja, możliwość udostępniania przepisu, wysoka dostępność.

## 3. Mapa podróży użytkownika

1. Użytkownik rozpoczyna przygodę na ekranie logowania lub rejestracji.
2. W przypadku rejestracji użytkownik najpierw podaje dane logowania, a następnie przechodzi do ekranu edycji profilu, gdzie uzupełnia dodatkowe informacje.
3. Po pomyślnej rejestracji lub logowaniu, użytkownik trafia do głównego interfejsu, gdzie ma dostęp do wszystkich funkcji.
4. Użytkownik wybiera opcję generowania diety, wypełnia formularz z parametrami oraz uruchamia proces generowania, który jest wizualizowany za pomocą paska postępu.
5. Po zakończeniu generowania, system przekierowuje użytkownika do ekranu przeglądu diety, gdzie można zobaczyć harmonogram posiłków i listę zakupów.
6. Z ekranu przeglądu, użytkownik może kliknąć na wybrany posiłek, aby zobaczyć szczegóły przepisu, a następnie powrócić do głównego widoku.
7. Stały pasek nawigacyjny umożliwia szybkie przełączanie się między widokami, w tym między rejestracją, profilem, generowaniem diety, przeglądem diety oraz szczegółami przepisu.

## 4. Układ i struktura nawigacji

- Pasek nawigacyjny umieszczony jest na stałe w górnej części interfejsu.
- Elementy paska nawigacyjnego:
  - Link do rejestracji/logowania
  - Link do edycji profilu
  - Link do generowania diety
  - Link do przeglądu diety i listy zakupów
  - Link do szczegółów przepisu (aktywowany w kontekście wybranego posiłku)
- Nawigacja wspiera responsywność z wdrożeniem menu hamburgera na urządzeniach mobilnych.
- Aktualnie aktywny widok jest wyróżniony wizualnie, co ułatwia orientację użytkownikowi.

## 5. Kluczowe komponenty

- **Formularze**: Kluczowe w ekranach rejestracji, logowania, edycji profilu i generowania diety. Korzystają z react hook form i Zod, zapewniając natychmiastową walidację.
- **Stały Pasek Nawigacyjny**: Zapewnia szybki dostęp do głównych widoków i utrzymuje spójność interfejsu.
- **Loader / Progress Bar**: Używany podczas asynchronicznych operacji, takich jak generowanie diety, aby informować użytkownika o postępie.
- **Toast/Snackbar**: Komponent do wyświetlania dynamicznych komunikatów o błędach i sukcesach.
- **Karty i Listy**: Wykorzystywane do prezentacji planu diety oraz listy zakupów, umożliwiając czytelny podgląd informacji.
- **Komponenty Shadcn/ui**: Standaryzowane elementy interfejsu, takie jak Input, Button, Select, Navigation Menu, zapewniające spójny i responsywny wygląd aplikacji.
