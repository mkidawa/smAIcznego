# Plan implementacji widoku Ekran Edycji Profilu

## 1. Przegląd

Widok umożliwia użytkownikowi przeglądanie, uzupełnienie i edycję danych profilowych: wieku, płci, wagi oraz listy alergii (i w przyszłości wymagań zdrowotnych). Formularz zapewnia natychmiastową walidację i wysyła dane do endpointów REST (`GET`, `POST`, `PATCH`) w `/api/profiles`.

## 2. Routing widoku

Ścieżka: `/profile` (plik Astro: `src/pages/profile.astro`).

## 3. Struktura komponentów

```
ProfilePage
└─ ProfileForm
   ├─ AgeInput
   ├─ GenderSelect
   ├─ WeightInput
   ├─ AllergiesInput
   ├─ TermsCheckbox  (tylko przy tworzeniu)
   └─ SubmitButton
```

## 4. Szczegóły komponentów

### ProfilePage (plik Astro)

- Opis: kontener ładowania danych i osadzenia formularza React.
- Elementy: import ReactClientProfileForm, middleware auth, wywołanie ReactClientProfileForm client:load z propsem user.
- Zdarzenia: inicjalizacja fetchu profilu (wewnątrz hooka w React).
- Walidacja: brak – delegowana do ReactForm.
- Typy: none (obsługa w React).

### ProfileForm (React)

- Opis: główny komponent formularza korzystający z React Hook Form i Zod.
- Główne elementy:
  - `<form>` z `onSubmit`
  - Komponenty wejściowe: AgeInput, GenderSelect, WeightInput, AllergiesInput, opcjonalnie TermsCheckbox.
- Obsługiwane zdarzenia:
  - onChange na polach (react-hook-form)
  - onSubmit -> `handleSubmit(onSubmit)`
- Walidacja (Zod):
  - `age`: integer, min=13, max=120
  - `weight`: number>0, max=300
  - `gender`: oneOf(`male`,`female`,`other`)
  - `allergies`: array string
  - `terms_accepted`: boolean (musi być true przy POST)
- Typy:
  - `ProfileFormValues`:
    ```ts
    interface ProfileFormValues {
      age: number;
      gender: "male" | "female" | "other";
      weight: number;
      allergies: string[];
      terms_accepted: boolean;
    }
    ```
  - DTO do wysyłki: `CreateProfileCommand` i `UpdateProfileCommand` z `src/types.ts`.
- Propsy:
  - `initialValues?: ProfileFormValues` – wartości domyślne z API.
  - `onSave: (values: ProfileFormValues) => Promise<void>` – callback zapisu.

### AgeInput

- Opis: `<Input type="number" />` do wprowadzania wieku.
- Elementy: label, input, error message.
- Zdarzenia: register z react-hook-form.
- Walidacja: integer, 13–120.
- Typy: `number`.
- Props: `register`, `errors` z react-hook-form.

### WeightInput

- Podobnie do `AgeInput`, `type="number"`, >0 i ≤300.

### GenderSelect

- `<Select>` (Shadcn/ui) z opcjami `male`,`female`,`other`.
- Walidacja: wartość obowiązkowa, jedna z trzech.
- Props: `register`, `errors`.

### AllergiesInput

- Komponent Tag Input (Shadcn/ui `Input`+ikonki) pozwalający dodawać wiele wartości.
- Zdarzenia: dodaj/usunęcie tagu.
- Walidacja: każda wartość niepusta.
- Props: `value`, `onChange` (poprzez `Controller`).

### TermsCheckbox

- `<Checkbox>` (Shadcn/ui) z etykietą akceptacji regulaminu.
- Walidacja: wymagane przy pierwszym zapisie (tylko przy metodzie POST).

### SubmitButton

- `<Button>` (Shadcn/ui), `type="submit"`, disabled, gdy `isSubmitting` lub błędy.

## 5. Typy

- Zdefiniować `ProfileFormValues` w pliku `src/types.ts` lub `src/components/profile/types.ts`.
- Użyć istniejących DTO: `CreateProfileCommand`, `UpdateProfileCommand`, `ProfileResponse` z `src/types.ts`.

## 6. Zarządzanie stanem

- Hook `useProfile`:
  - fetch GET `/api/profiles` zwróci `ProfileResponse` lub 404.
  - metody `createProfile` (POST) i `updateProfile` (PATCH).
  - zwraca `{ data, loading, error, save }`.
- Formularz używa `useForm` z domyślnymi wartościami z `data`.

## 7. Integracja API

- GET `/api/profiles` → `ProfileResponse`.
- POST `/api/profiles` z `CreateProfileCommand` → 201, `ProfileResponse`.
- PATCH `/api/profiles` z `UpdateProfileCommand` → 200, `ProfileResponse`.

## 8. Interakcje użytkownika

1. Wejście na `/profile`, widok ładuje dane.
2. Jeśli 404, formularz pusty, terms=false.
3. Użytkownik wypełnia pola, walidacja inline.
4. Klik `Zapisz`, wywołanie `save(values)`.
5. Po sukcesie – komunikat toast i ewentualne przekierowanie.

## 9. Warunki i walidacja

- age: integer [13,120]
- weight: number (0,300]
- gender: jedna z enum
- allergies: jeśli podane, każdy string niepusty
- terms_accepted: `true` przy tworzeniu

## 10. Obsługa błędów

- Walidacja z react-hook-form: wyświetl field-level errors.
- API: 401 → przekieruj do `/login` ; 404 GET → tryb tworzenia; 409 POST → komunikat „Profil już istnieje”; inne 5xx → toast „Błąd serwera”.

## 11. Kroki implementacji

1. Utworzyć plik `src/pages/profile.astro`, zabezpieczyć middlewarem autoryzacji.
2. Dodać komponent `ReactClientProfileForm.tsx` w `src/components/profile/`.
3. Zdefiniować typy `ProfileFormValues` w `src/components/profile/types.ts`.
4. Zaimplementować hook `useProfile` w `src/components/profile/hooks/useProfile.ts`.
5. Zbudować `ProfileForm` z react-hook-form i Zod w `ReactClientProfileForm.tsx`.
6. Utworzyć i przetestować pola `AgeInput`, `WeightInput`, `GenderSelect`, `AllergiesInput`, `TermsCheckbox`, `SubmitButton`.
7. Obsłużyć loading i error state w `ProfilePage`.
8. Przetestować scenariusze: tworzenie, edycja, błędy 401/404/409/5xx.
9. Dodać style Tailwind i komponenty Shadcn/ui.
10. Napisać testy jednostkowe z Vitest i MSW oraz e2e z Playwright.
