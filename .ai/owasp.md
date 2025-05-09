Dla każdej zidentyfikowanej _potencjalnej_ podatności, poniżej znajdują się rekomendacje:

1.  **Broken Access Control:**

    - **Rekomendacje:**
      - **Szczegółowy audyt kodu:** Dokładnie przeanalizuj logikę w `src/pages/api/**/*`, `src/middleware/index.ts` oraz w modułach (`src/modules/**/*`) pod kątem weryfikacji uprawnień.
      - **Wymuszaj zasadę najmniejszych uprawnień (Principle of Least Privilege).**
      - **Wykorzystaj Row Level Security (RLS) w Supabase:** Zdefiniuj i rygorystycznie egzekwuj polityki RLS dla wszystkich tabel zawierających wrażliwe lub specyficzne dla użytkownika dane. Upewnij się, że domyślnie dostęp jest zabroniony.
      - **Weryfikuj uprawnienia na serwerze:** Nigdy nie polegaj na logice po stronie klienta do kontroli dostępu. Każde żądanie API musi być weryfikowane na serwerze.
      - **Testy jednostkowe i integracyjne:** Napisz testy sprawdzające scenariusze kontroli dostępu, w tym próby nieautoryzowanego dostępu.
    - **Dobre praktyki:** Regularnie przeglądaj polityki RLS i logikę autoryzacji. Unikaj bezpośredniego odwoływania się do obiektów po ID bez sprawdzenia własności (`IDOR`).

2.  **Injection (SQL Injection, Prompt Injection):**

    - **Rekomendacje:**
      - **SQLi:**
        - **Używaj parametryzowanych zapytań/ORM:** Klient Supabase (`supabase-js`) domyślnie powinien chronić przed SQLi, jeśli używane są jego standardowe metody. Unikaj budowania zapytań SQL poprzez konkatenację stringów z danymi od użytkownika.
        - **Walidacja i sanitacja danych wejściowych:** Wszystkie dane wejściowe z żądań API muszą być dokładnie walidowane pod kątem typu, formatu i długości po stronie serwera (`src/pages/api`, `src/middleware/index.ts`).
      - **Prompt Injection:**
        - **Sanitacja i kontekstualizacja danych wejściowych:** Oczyszczaj i ograniczaj dane wejściowe użytkownika przed włączeniem ich do promptów dla modeli AI. Rozważ użycie technik separacji danych od instrukcji.
        - **Monitorowanie i filtrowanie odpowiedzi:** Analizuj odpowiedzi z modeli AI pod kątem nieoczekiwanych lub potencjalnie szkodliwych treści.
        - **Ograniczone uprawnienia dla modeli:** Jeśli to możliwe, konfiguruj modele AI tak, aby miały tylko niezbędne uprawnienia.
    - **Dobre praktyki:** Wprowadź rygorystyczną walidację wszystkich danych wejściowych. Regularnie aktualizuj biblioteki (np. Supabase SDK).

3.  **Security Misconfiguration:**

    - **Rekomendacje:**
      - **Zarządzanie kluczami API:**
        - Przechowuj klucze API (Supabase, OpenRouter) jako zmienne środowiskowe.
        - Klucz `service_role` Supabase NIGDY nie może być używany po stronie klienta. Powinien być używany tylko w bezpiecznym środowisku serwerowym (np. funkcje serwerowe, backend API).
        - Klucz `anon` Supabase powinien mieć minimalne, niezbędne uprawnienia (skonfigurowane przez RLS).
        - Klucz API OpenRouter powinien być używany tylko po stronie serwera.
      - **Nagłówki bezpieczeństwa HTTP:** Zaimplementuj kluczowe nagłówki bezpieczeństwa w `src/middleware/index.ts` (np. `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
      - **Konfiguracja Supabase:** Regularnie przeglądaj konfigurację RLS, uprawnienia do tabel i funkcji w Supabase. Wyłącz nieużywane funkcje.
      - **Minimalizuj powierzchnię ataku:** Usuń lub wyłącz nieużywane endpointy API i funkcje.
    - **Dobre praktyki:** Przeprowadzaj regularne audyty konfiguracji. Używaj narzędzi do skanowania konfiguracji.

4.  **Cross-Site Scripting (XSS):**

    - **Rekomendacje:**
      - **Używaj frameworków z wbudowaną ochroną:** React domyślnie oczyszcza dane wstrzykiwane do JSX. Astro również posiada mechanizmy ochrony.
      - **Unikaj `dangerouslySetInnerHTML` w React:** Jeśli musisz go użyć, upewnij się, że HTML pochodzi z zaufanego źródła i jest odpowiednio sanitowany przy użyciu sprawdzonych bibliotek (np. `DOMPurify`).
      - **Poprawna obsługa atrybutów:** Uważaj przy dynamicznym ustawianiu atrybutów `href`, `src` lub handlerów zdarzeń (np. `onclick`).
      - **Content Security Policy (CSP):** Zaimplementuj silną politykę CSP poprzez nagłówek HTTP (w `src/middleware/index.ts`), aby ograniczyć źródła, z których mogą być ładowane skrypty i inne zasoby.
      - **Walidacja i sanitacja danych wejściowych:** Wszystkie dane wyświetlane użytkownikowi powinny być traktowane jako potencjalnie niebezpieczne i odpowiednio kodowane/oczyszczane.
    - **Dobre praktyki:** Traktuj wszystkie dane pochodzące od użytkownika jako niezaufane. Stosuj zasadę "encode on output".

5.  **Identification and Authentication Failures:**

    - **Rekomendacje:**
      - **Korzystaj z wbudowanych mechanizmów Supabase:** Supabase oferuje solidne funkcje uwierzytelniania. Upewnij się, że są one poprawnie zaimplementowane i skonfigurowane.
      - **Bezpieczne zarządzanie tokenami JWT:** Przechowuj tokeny JWT bezpiecznie (np. w ciasteczkach `HttpOnly`, `Secure`, `SameSite=Strict` lub `Lax`).
      - **Ochrona przed atakami brute-force:** Zaimplementuj mechanizmy blokowania konta lub captcha po wielu nieudanych próbach logowania.
      - **Bezpieczny proces resetowania hasła:** Używaj jednorazowych, ograniczonych czasowo tokenów. Nie ujawniaj, czy konto istnieje.
      - **Wymuszaj silne hasła:** Skonfiguruj politykę silnych haseł.
      - **Weryfikacja dwuetapowa (2FA):** Rozważ implementację 2FA dla dodatkowego bezpieczeństwa.
    - **Dobre praktyki:** Regularnie przeglądaj logikę uwierzytelniania. Monitoruj logi pod kątem podejrzanych prób logowania.

6.  **Exposure of Sensitive Information (API Keys):**

    - **Rekomendacje:**
      - **NIGDY nie umieszczaj wrażliwych kluczy API w kodzie frontendowym ani w publicznym repozytorium.**
      - **Używaj zmiennych środowiskowych:** Wszystkie klucze API i wrażliwe dane konfiguracyjne powinny być ładowane ze zmiennych środowiskowych (np. pliki `.env` ignorowane przez Git, zmienne środowiskowe na serwerze hostingowym).
      - **Dostęp po stronie serwera:** Klucze z wysokimi uprawnieniami (np. Supabase `service_role`, OpenRouter API key) powinny być używane wyłącznie przez logikę po stronie serwera (np. w `src/pages/api/**/*` lub dedykowanych funkcjach backendowych).
      - **Minimalne uprawnienia dla kluczy frontendowych:** Klucz Supabase `anon` używany na frontendzie musi mieć minimalne, ściśle określone uprawnienia poprzez RLS.
      - **Audyt kodu:** Przeszukaj kod (`grep` lub podobne narzędzie) pod kątem przypadkowo zahardkodowanych kluczy.
    - **Dobre praktyki:** Regularnie rotuj klucze API. Używaj systemów zarządzania sekretami (np. Vault, Doppler, zmienne środowiskowe w platformach hostingowych).

7.  **Cross-Site Request Forgery (CSRF):**
    - **Rekomendacje:**
      - **Implementuj tokeny anty-CSRF (Synchronizer Token Pattern):** Dla wszystkich żądań modyfikujących stan (POST, PUT, DELETE itp.), generuj unikalny, nieprzewidywalny token po stronie serwera, osadzaj go w formularzach i weryfikuj przy każdym żądaniu. Astro wspiera integrację z takimi mechanizmami poprzez middleware.
      - **Używaj ciasteczek `SameSite`:** Ustaw atrybut `SameSite=Strict` lub `SameSite=Lax` dla ciasteczek sesyjnych.
      - **Sprawdzaj nagłówek `Origin` lub `Referer`:** Chociaż nie jest to w pełni niezawodne, może stanowić dodatkową warstwę ochrony.
      - **Middleware:** Implementuj logikę anty-CSRF centralnie w `src/middleware/index.ts`.
    - **Dobre praktyki:** Zapewnij, że wszystkie endpointy modyfikujące stan są chronione.
