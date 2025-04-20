# Dokument wymagań produktu (PRD) - smaAIcznego

## 1. Przegląd produktu

Aplikacja smaAIcznego to MVP mające na celu pomoc użytkownikom w wyborze i personalizacji diety, która spełnia ich indywidualne potrzeby żywieniowe oraz preferencje. Główną funkcjonalnością jest generowanie diety przy użyciu systemu AI (Openrouter.ai) na podstawie określonych parametrów, przy czym z uwzględnieniem stałych preferencji użytkownika zapisanych w profilu. Aplikacja dodatkowo generuje statyczną listę produktów zakupowych oraz umożliwia bezpieczny dostęp do informacji poprzez system kont użytkowników.

## 2. Problem użytkownika

Użytkownicy borykają się z problemem płatnych i niewystarczająco elastycznych planów dietetycznych oferowanych przez dostępne na rynku rozwiązania. Istniejące systemy często nie pozwalają na dostosowanie diety do indywidualnych preferencji, takich jak rodzaj kuchni, alergie czy wymagania zdrowotne, co skutkuje nieoptymalnym doborem planów żywieniowych. Użytkownicy oczekują rozwiązania, które umożliwi im szybkie i tanie generowanie spersonalizowanego planu diety, dostosowanego do ich konkretnych potrzeb.

## 3. Wymagania funkcjonalne

1. Generowanie diety:
   - Umożliwienie wyboru parametrów diety: kaloryczność na dzień, okres trwania (maks. 14 dni), liczba posiłków na dzień oraz rodzaj kuchni (np. azjatycka, włoska, meksykańska).
   - Wykorzystanie systemu AI (Openrouter.ai) do generowania planu diety na podstawie podanych parametrów.
2. Profil użytkownika:
   - Zapisywanie stałych preferencji użytkownika (alergie, wymagania zdrowotne).
   - Przechowywanie dodatkowych danych profilowych, takich jak wiek i waga (aktualizowane rzadko).
3. Lista zakupów:
   - Automatyczne generowanie statycznej listy zakupów na podstawie wygenerowanego planu diety.
4. System kont użytkowników:
   - Umożliwienie bezpiecznej rejestracji, logowania i zarządzania kontem użytkownika.
5. Walidacja formularza:
   - Wdrożenie podstawowej walidacji formularza przy wprowadzaniu parametrów diety.

## 4. Granice produktu

- Nie implementujemy systemu rekomendacji diet.
- Brak funkcjonalności kontroli wyników oraz oceny wpływu diety na zdrowie.
- System nie obejmuje dynamicznej aktualizacji listy zakupów – lista pozostaje statyczna.
- Nie przewidujemy mechanizmu kontroli składu diety.
- Zaawansowane kwestie harmonogramu wdrożenia oraz zarządzania ryzykiem są wyłączone z MVP.

## 5. Historyjki użytkowników

### US-001: Rejestracja i logowanie

- ID: US-001
- Tytuł: Rejestracja i bezpieczne logowanie
- Opis: Użytkownik musi mieć możliwość rejestracji oraz logowania do systemu, co zapewni bezpieczny dostęp do aplikacji i przechowywanie jego danych.
- Kryteria akceptacji:
  - Użytkownik może założyć konto przy użyciu adresu email oraz hasła.
  - Proces logowania umożliwia bezpieczny dostęp do konta.
  - Mechanizmy zabezpieczające chronią dane użytkownika.

### US-002: Uzupełnienie profilu użytkownika

- ID: US-002
- Tytuł: Uzupełnienie danych profilowych
- Opis: Po rejestracji użytkownik wprowadza dane profilowe, takie jak wiek, waga, alergie oraz wymagania zdrowotne, które będą wykorzystywane podczas generowania diety.
- Kryteria akceptacji:
  - Użytkownik może wprowadzić i edytować dane profilowe.
  - System przechowuje dane stałe jako preferencje użytkownika.

### US-003: Generowanie diety

- ID: US-003
- Tytuł: Generowanie spersonalizowanej diety
- Opis: Użytkownik wprowadza parametry diety (kaloryczność na dzień, okres trwania, liczba posiłków, rodzaj kuchni) i uruchamia proces generowania diety za pomocą AI (Openrouter.ai). Wygenerowany plan pozostaje aktywny przez określony czas (do momentu wygaśnięcia lub usunięcia).
- Kryteria akceptacji:
  - Użytkownik wprowadza wszystkie wymagane parametry w formularzu.
  - System generuje plan diety odpowiadający podanym kryteriom.
  - Wygenerowany plan diety pozostaje niezmienny przez ustalony okres.

### US-004: Wyświetlanie wygenerowanej diety i listy zakupów

- ID: US-004
- Tytuł: Przegląd planu diety i listy zakupów
- Opis: Użytkownik może przeglądać wygenerowany plan diety wraz ze statyczną listą zakupów, która jest generowana na podstawie planu.
- Kryteria akceptacji:
  - System prezentuje pełny plan diety wraz z harmonogramem posiłków.
  - Lista zakupów wyświetlana jest zgodnie z wygenerowanym planem.
  - Użytkownik nie ma możliwości edycji wygenerowanej diety.

### US-005: Przeglądanie szczegółowych przepisów

- ID: US-005
- Tytuł: Wyświetlanie szczegółowych przepisów na posiłki
- Opis: Użytkownik ma możliwość podejrzenia szczegółowych przepisów na wybrane posiłki wchodzące w skład diety, które są generowane przez system AI.
- Kryteria akceptacji:
  - Użytkownik może kliknąć na poszczególne posiłki, aby zobaczyć szczegółowy przepis.
  - System integruje się z AI w celu prezentacji pełnych informacji o przepisie.
  - Przepisy są wyświetlane w czytelnej i zrozumiałej formie.

## 6. Metryki sukcesu

1. 90% użytkowników posiada plany żywieniowe opracowane na więcej niż 5 dni.
2. 75% użytkowników posiada plany żywieniowe opracowane na więcej niż 10 dni.
3. Średnia długość planu diety (ilość dni w planie).
4. Liczba wygenerowanych diet.
