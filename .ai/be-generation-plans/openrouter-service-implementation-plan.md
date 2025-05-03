# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter to integracja z API OpenRouter, która umożliwia uzupełnienie czatów opartych na modelach LLM. Głównym celem usługi jest budowanie i wysyłanie poprawnie sformatowanych zapytań do API, a następnie przetwarzanie otrzymanych odpowiedzi, zapewniając spójne i strukturalne wyniki. Dzięki temu użytkownik otrzymuje precyzyjne odpowiedzi z uwzględnieniem kontekstu komunikacji.

### 1.1 Kluczowe komponenty i wyzwania

1. Komponent konfiguracji:

   - Cel: Inicjalizacja i walidacja kluczowych ustawień, takich jak API endpoint, klucz API, systemMessage, modelName, modelParameters oraz response_format.
   - Wyzwania:
     1. Niepoprawne lub niekompletne dane konfiguracyjne.
     2. Bezpieczne przechowywanie wrażliwych informacji.
   - Rozwiązania:
     1. Wdrożenie walidacji danych konfiguracyjnych podczas inicjalizacji.
     2. Użycie zmiennych środowiskowych oraz bezpiecznych metod przechowywania.

2. Komponent budowy żądania:

   - Cel: Tworzenie struktury zapytania dla API OpenRouter, integrującego systemMessage, userMessage, response_format, modelName i modelParameters.
   - Wyzwania:
     1. Łączenie elementów bez błędów formatowania.
     2. Zapewnienie zgodności struktury żądania z wymaganiami API.
   - Rozwiązania:
     1. Użycie stałych struktur i walidacja przez JSON schema.
     2. Testy integracyjne między komponentami.

3. Komponent komunikacji z API:

   - Cel: Wysyłanie żądania do API i odbiór odpowiedzi.
   - Wyzwania:
     1. Problemy z połączeniem, timeout, błędy autoryzacji.
   - Rozwiązania:
     1. Mechanizmy ponownych prób (retry) z wykładniczym opóźnieniem.
     2. Szczegółowe logowanie i monitorowanie połączeń.

4. Komponent walidacji odpowiedzi:

   - Cel: Weryfikacja, czy odpowiedź spełnia określony response_format.
   - Wyzwania:
     1. Niezgodność formatu odpowiedzi z oczekiwanym schematem.
   - Rozwiązania:
     1. Implementacja walidacji przy użyciu JSON schema.
     2. Generowanie czytelnych komunikatów o błędach.

5. Komponent obsługi błędów:
   - Cel: Centralizowanie logiki obsługi błędów i monitorowanie ich występowania.
   - Wyzwania:
     1. Trudności w debugowaniu i brak szczegółowych logów błędów.
   - Rozwiązania:
     1. Szczegółowe logowanie błędów.
     2. Implementacja mechanizmów alertowania.

## 2. Opis konstruktora

Konstruktor usługi powinien:

- Inicjalizować zmienne konfiguracyjne, takie jak klucz API oraz URL endpointu OpenRouter.
- Ustalać domyślny komunikat systemowy oraz konfigurację modelu, w tym nazwę i parametry modelu.
- Inicjalizować schemat walidacji odpowiedzi (`response_format`) przy użyciu zdefiniowanego JSON Schema.

## 3. Publiczne metody i pola

### Publiczne metody:

1. `initialize()` - Inicjalizuje konfigurację usługi, w tym zmienne środowiskowe, komunikaty i parametry modelu.
2. `sendMessage(userMessage: string): Promise<Response>` - Wysyła komunikat użytkownika do API OpenRouter, budując odpowiednio żądanie z dodatkowymi danymi (systemMessage, response_format, itd.).
3. `setModelParameters(parameters: ModelParameters): void` - Umożliwia konfigurację parametrów modelu, takich jak temperatura czy maksymalna liczba tokenów.
4. `setResponseFormat(format: ResponseFormat): void` - Pozwala na konfigurację schematu odpowiedzi, ułatwiając walidację odpowiedzi zwróconej przez API.

### Publiczne pola:

1. `systemMessage: string` - Domyślny komunikat systemowy, np. "Jesteś pomocnym asystentem.".
2. `modelName: string` - Nazwa modelu używanego przez API, np. "gpt-4".
3. `modelParameters: ModelParameters` - Parametry konfiguracyjne modelu, np. { temperature: 0.7, max_tokens: 150 }.

## 4. Prywatne metody i pola

### Prywatne metody:

1. `_buildRequest(userMessage: string): RequestPayload` - Buduje strukturę żądania zawierającą komunikat systemowy, komunikat użytkownika, response_format, nazwę modelu oraz parametry modelu.
2. `_handleResponse(response: any): ParsedResponse` - Przetwarza odpowiedź z API, weryfikując jej zgodność z zadanym schematem.
3. `_validateResponseFormat(response: any): boolean` - Waliduje odpowiedź, sprawdzając, czy spełnia warunki zdefiniowanego JSON Schema.
4. `_logError(error: Error): void` - Loguje błędy wraz z odpowiednimi metadanymi, umożliwiając monitorowanie i debugowanie.

### Prywatne pola:

1. `_apiEndpoint: string` - Endpoint API OpenRouter, pobierany z konfiguracji.
2. `_apiKey: string` - Klucz API, przechowywany w zmiennych środowiskowych.
3. `_retryCount: number` - Licznik ponownych prób wysyłania żądania w przypadku niepowodzenia.
4. `_defaultResponseFormat: ResponseFormat` - Domyślny schemat odpowiedzi, przykładowo:

   ```json
   {
     "type": "json_schema",
     "json_schema": {
       "name": "responseSchema",
       "strict": true,
       "schema": {
         "type": "object",
         "properties": {
           "answer": { "type": "string" },
           "sources": { "type": "array", "items": { "type": "string" } }
         },
         "required": ["answer"]
       }
     }
   }
   ```

## 5. Obsługa błędów

Potencjalne scenariusze błędów oraz proponowane rozwiązania:

1. **Błąd połączenia z API (timeout lub brak połączenia):**

   - Rozwiązanie: Wdrożenie mechanizmu ponownych prób (retry) z wykładniczym opóźnieniem oraz szczegółowe logowanie błędów.

2. **Błąd formatu odpowiedzi (niezgodność z `response_format`):**

   - Rozwiązanie: Walidacja odpowiedzi przy użyciu wcześniej zdefiniowanego schematu JSON. W przypadku niezgodności zwrócenie czytelnego komunikatu o błędzie i logowanie problemu.

3. **Nieprawidłowy klucz API lub błędy autoryzacji:**

   - Rozwiązanie: Weryfikacja klucza API w trakcie inicjalizacji oraz mechanizm natychmiastowego wyłączania usługi w przypadku wykrycia nieautoryzowanego dostępu.

4. **Przekroczenie limitu zapytań do API:**
   - Rozwiązanie: Implementacja systemu zarządzania limitem zapytań (rate limiting) oraz informowanie użytkownika o ewentualnych opóźnieniach lub problemach.

## 6. Kwestie bezpieczeństwa

1. Przechowywanie kluczy API w zmiennych środowiskowych oraz korzystanie z bezpiecznych magazynów konfiguracji.
2. Używanie połączenia HTTPS do komunikacji z API OpenRouter.
3. Walidacja i sanityzacja danych wejściowych, aby zapobiec atakom typu injection.
4. Implementacja szczegółowego logowania błędów bez ujawniania wrażliwych informacji.
5. Regularne audyty bezpieczeństwa i aktualizacja zależności w projekcie.

## 7. Plan wdrożenia krok po kroku

1. **Analiza wymagań i konfiguracja środowiska:**

   - Zapoznanie się z technologicznym stackiem (Astro, TypeScript, React, Tailwind, Shadcn/ui).
   - Ustalenie kluczowych zmiennych środowiskowych (klucze API, URL endpointu) oraz konfiguracji projektu.

2. **Implementacja modułu:**

   - Utworzenie modułu usługi OpenRouter w katalogu `./src/lib`.
   - Implementacja konstruktora, który inicjalizuje konfigurację i ustawia domyślne wartości (komunikat systemowy, nazwa modelu, parametry modelu, response_format).
   - Stworzenie publicznych metod (initialize, sendMessage, setModelParameters, setResponseFormat) oraz prywatnych metod (\_buildRequest, \_handleResponse, \_validateResponseFormat, \_logError).

3. **Konfiguracja komunikatów i response_format:**

   - Ustalenie domyślnego komunikatu systemowego, np. "Jesteś pomocnym asystentem.".
   - Przykładowa konfiguracja elementów:
     1. Komunikat systemowy: "Jesteś pomocnym asystentem."
     2. Komunikat użytkownika: "Jak mogę Ci dziś pomóc?"
     3. Response_format:
        ```json
        {
          "type": "json_schema",
          "json_schema": {
            "name": "responseSchema",
            "strict": true,
            "schema": {
              "type": "object",
              "properties": {
                "answer": { "type": "string" },
                "sources": { "type": "array", "items": { "type": "string" } }
              },
              "required": ["answer"]
            }
          }
        }
        ```
     4. Nazwa modelu: "gpt-4".
     5. Parametry modelu: { temperature: 0.7, max_tokens: 150 }.

4. **Obsługa błędów i walidacja:**

   - Wdrożenie mechanizmów ponownych prób i logowania błędów.
   - Walidacja odpowiedzi z API pod kątem zgodności z zdefiniowanym response_format oraz obsługa wyjątków.
