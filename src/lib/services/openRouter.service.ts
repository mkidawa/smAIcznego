import type { OpenRouterResponse, OpenRouterRequest } from "@/modules/openRouter/openRouter.types";

const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;

export class OpenRouterService {
  private readonly _apiEndpoint: string;
  private readonly _apiKey: string;
  private readonly _retryCount: number = 3;
  private readonly _retryDelay: number = 1000;

  private readonly _defaultSystemMessage: string =
    "Jesteś ekspertem od planowania diet. Twoim zadaniem jest tworzenie spersonalizowanych planów żywieniowych wraz z listami zakupów. MUSISZ odpowiadać WYŁĄCZNIE w formacie JSON, który zawiera obiekt z dwoma kluczami: 'diet_plan' i 'shopping_list'. Nie dodawaj żadnego tekstu przed ani po JSON. Format odpowiedzi musi być zgodny z podanym schematem. Zaczynaj numerowanie posiłków (meal_number_in_day) oraz dni (day) od 0.";
  private readonly _defaultModelName: string = "openai/gpt-4o-mini";
  private readonly _defaultModelParameters = {
    temperature: 0.7,
    top_p: 1,
  };

  constructor(systemMessage?: string, modelName?: string, modelParameters?: { temperature: number; top_p: number }) {
    this._apiKey = openRouterApiKey;
    this._apiEndpoint = "https://openrouter.ai/api/v1";

    // Inicjalizacja z parametrami lub wartościami domyślnymi
    this.systemMessage = systemMessage ?? this._defaultSystemMessage;
    this.modelName = modelName ?? this._defaultModelName;
    this.modelParameters = modelParameters ?? this._defaultModelParameters;

    // Walidacja konfiguracji
    if (!this._apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }
  }

  public systemMessage: string;
  public modelName: string;
  public modelParameters: {
    temperature: number;
    top_p: number;
  };

  public async initialize(): Promise<void> {
    try {
      const response = await fetch(this._apiEndpoint, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${this._apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize OpenRouter service: ${response.statusText}`);
      }
    } catch (error) {
      this._logError(error as Error);
      throw new Error("Failed to initialize OpenRouter service");
    }
  }

  public async generateDietPlan(params: {
    calories_per_day: number;
    number_of_days: number;
    meals_per_day: number;
    preferences?: string[];
    allergies?: string[];
  }): Promise<OpenRouterResponse> {
    try {
      const userMessage = this._buildDietPlanMessage(params);
      const payload = this._buildRequestPayload(userMessage);
      return await this._sendWithRetry(payload);
    } catch (error) {
      this._logError(error as Error);
      throw new Error("Failed to generate diet plan");
    }
  }

  private _buildDietPlanMessage(params: {
    calories_per_day: number;
    number_of_days: number;
    meals_per_day: number;
    preferences?: string[];
    allergies?: string[];
  }): string {
    let message = `Proszę o wygenerowanie ${params.number_of_days} - dniowego planu diety o kaloryczności ${params.calories_per_day} kcal i ${params.meals_per_day} posiłków dziennie. W diecie niech każdy dzień będzie opisany dokładnie, czyli nie na przykład kurczak z warzywami tylko kurczak z pieprzem i solą z marchewką itd. Dodatkowo niech lista zakupów będzie zawierała dokładne ilości potrzebne do przygotowania posiłków.`;

    if (params.preferences?.length) {
      message += ` Preferencje: ${params.preferences.join(", ")}.`;
    }

    if (params.allergies?.length) {
      message += ` Alergie: ${params.allergies.join(", ")}.`;
    }

    return message;
  }

  private _buildRequestPayload(userMessage: string): OpenRouterRequest {
    return {
      messages: [
        { role: "system" as const, content: this.systemMessage },
        { role: "user" as const, content: userMessage },
      ],
      model: this.modelName,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "generation_response",
          schema: {
            type: "object",
            properties: {
              diet_plan: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    meals: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          meal_number_in_day: { type: "number" },
                          name: { type: "string" },
                          calories: { type: "number" },
                          meal_type: {
                            type: "string",
                            enum: ["breakfast", "second breakfast", "lunch", "afternoon snack", "dinner"],
                          },
                          ingredients: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                quantity: { type: "string" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              shopping_list: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    quantity: { type: "string" },
                  },
                },
              },
            },
            required: ["diet_plan", "shopping_list"],
          },
        },
      },
      ...this.modelParameters,
    };
  }

  private async _sendWithRetry(payload: OpenRouterRequest, attempt = 1): Promise<OpenRouterResponse> {
    try {
      const response = await fetch(`${this._apiEndpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this._apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Status: ${response.status} ${response.statusText}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage += ` | Details: ${JSON.stringify(errorData)}`;
        } catch {
          errorMessage += ` | Raw response: ${errorText}`;
        }

        throw new Error(`API request failed: ${errorMessage}`);
      }

      const jsonResponse = await response.json();
      if (!jsonResponse) {
        throw new Error("API returned empty response");
      }

      return jsonResponse;
    } catch (error) {
      if (attempt < this._retryCount) {
        const delay = this._retryDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this._sendWithRetry(payload, attempt + 1);
      }
      throw error;
    }
  }

  private _logError(error: Error): void {
    console.error("[OpenRouterService] Error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }
}
