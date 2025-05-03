# Plan implementacji widoku Przegląd Diety i Listy Zakupów

## 1. Przegląd

Ekran umożliwia użytkownikowi przegląd wygenerowanego planu diety (harmonogram posiłków) oraz statycznej listy zakupów na podstawie tego planu. Dane są tylko do odczytu — użytkownik nie może ich edytować.

## 2. Routing widoku

Ścieżka: `/diets`
Zdefiniowane w pliku `src/pages/diets/index.astro`, który ładuje komponent `DietsView`.

## 3. Struktura komponentów

- **DietsView** (główny kontener)
  - SummaryCard (podsumowanie diety)
  - MealSchedule (lista posiłków podzielona na dni)
  - ShoppingListView (lista zakupów)
  - LoadingIndicator (komponent ładowania)
  - ErrorToast (komunikaty o błędach)

## 4. Szczegóły komponentów

### DietsView

- Opis: główny komponent, pobiera dane i zarządza stanem (
  isLoading, error, dietDetails).
- Główne elementy:
  - custom hook `useGetDietDetail(dietId)`
  - komponenty dzieci po załadowaniu danych
- Obsługiwane zdarzenia:
  - Automatyczne pobranie danych przy montażu
  - Przycisk "Odśwież" wywołujący ponowne pobranie
  - Przycisk "Nowa dieta" przekierowujący do `/diets/generate`
- Walidacja:
  - dietId musi być liczbą > 0
- Typy: `DietDetailViewModel`
- Propsy: brak (dietId z URL lub kontekstu użytkownika)

### SummaryCard

- Opis: wyświetla kluczowe informacje (liczba dni, kalorie/dzień, data rozpoczęcia/zakończenia)
- Główne elementy: komponent Card z Shadcn/ui, elementy tekstowe
- Propsy:
  - `numberOfDays: number`
  - `caloriesPerDay: number`
  - `startDate: string`
  - `endDate: string`
- Events: brak
- Walidacja: wszystkie propsy wymagane

### MealSchedule

- Opis: grupuje posiłki według dni
- Główne elementy: lista Cardów — każdy dzień z nagłówkiem i List komponent z posiłkami
- Propsy:
  - `mealsByDay: Record<number, MealItem[]>`
- Obsługiwane zdarzenia: opcjonalne rozwijanie/zamykanie dnia
- Walidacja:
  - `mealsByDay[day]` istnieje i jest niepusta

### ShoppingListView

- Opis: wyświetla produkty do zakupu
- Główne elementy: komponent List z Shadcn/ui
- Propsy:
  - `items: string[]`
- Walidacja:
  - `items.length > 0`

### LoadingIndicator

- Opis: informuje o trwającym pobieraniu
- Implementacja: użyć komponentu Progress lub Spinner z Shadcn/ui

### ErrorToast

- Opis: wyświetla błędy za pomocą `toast` z biblioteki Sonner
- Użycie: wywołanie `toast.error(message)` w przypadku błędu

## 5. Typy

```ts
interface MealItem {
  id: number;
  day: number;
  meal_type: MealType;
  approx_calories?: number;
  instructions?: string;
}

interface DietDetailViewModel extends DietResponse {
  meals: MealItem[];
  shoppingList: string[];
}
```

## 6. Zarządzanie stanem

- W `DietsView` używamy `useState` dla:
  - `dietDetails: DietDetailViewModel | null`
  - `isLoading: boolean`
  - `error: string | null`
- Custom hook `useGetDietDetail(dietId)` łączy wewnętrznie:
  - `useGetDiet({ dietId })`
  - `useGetMeals(dietId)` (nowy hook)
  - `useGetShoppingList(dietId)`

## 7. Integracja API

- Reuse istniejące endpointy:
  - GET `/api/diets/:id` → dane diety (useGetDiet)
  - GET `/api/diets/:id/shopping-list` → lista zakupów
- Stworzyć nowy endpoint:
  - GET `/api/diets/:id/meals` → lista posiłków dla diety (zwraca `MealItem[]`)

## 8. Interakcje użytkownika

- Po wejściu na stronę automatyczne pobranie danych
- Kliknięcie "Odśwież" → ponowne wywołanie hooka
- Kliknięcie "Nowa dieta" → przekierowanie do `/diets/generate`

## 9. Warunki i walidacja

- Weryfikacja poprawności `dietId`
- Sprawdzenie, czy odpowiedzi API zawierają oczekiwane dane (niepusty array posiłków i lista zakupów)

## 10. Obsługa błędów

- `404 Diet not found` → przekierowanie do strony generowania diety z tostem informującym o braku diety
- Błędy sieciowe (`500`, timeouts) → wyświetlenie toast.error z możliwością ponowienia

## 11. Kroki implementacji

1. Utworzyć custom hook `useGetMeals` i endpoint `/api/diets/:id/meals`.
2. Rozbudować hook `useGetDietDetail` używając `useGetDiet`, `useGetMeals`, `useGetShoppingList`.
3. Stworzyć komponenty: `SummaryCard`, `MealSchedule`, `ShoppingListView`, `LoadingIndicator`, `ErrorToast`.
4. Zaimplementować główny komponent `DietsView` w `src/modules/diet/dietaryPlan/components/DietsView.tsx`.
5. Dodać style Tailwind i komponenty z Shadcn/ui według designu.
6. Zaktualizować stronę w `src/pages/diets/index.astro`, by używała nowego widoku.
7. Przetestować scenariusze sukcesu i błędów oraz responsywność.
8. Udokumentować nowe hooki i endpointy.
