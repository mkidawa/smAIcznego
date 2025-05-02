import { z } from "zod";

// Schemat dla szczegółów tokenów
const TokenDetailsSchema = z.object({
  cached_tokens: z.number(),
  reasoning_tokens: z.number().optional(),
});

// Schemat dla użycia tokenów
const UsageSchema = z.object({
  total_tokens: z.number(),
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  prompt_tokens_details: TokenDetailsSchema,
  completion_tokens_details: TokenDetailsSchema,
});

// Schemat dla wiadomości asystenta
const AssistantMessageSchema = z.object({
  role: z.literal("assistant"),
  content: z.string(),
  refusal: z.null(),
  reasoning: z.null(),
});

// Schemat dla pojedynczego wyboru
const ChoiceSchema = z.object({
  index: z.number(),
  message: AssistantMessageSchema,
  logprobs: z.null(),
  finish_reason: z.string(),
  native_finish_reason: z.string(),
});

// Główny schemat odpowiedzi
export const OpenRouterResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  usage: UsageSchema,
  object: z.literal("chat.completion"),
  choices: z.array(ChoiceSchema),
  created: z.number(),
  provider: z.string(),
  system_fingerprint: z.string(),
});

// Typ odpowiedzi
export type OpenRouterResponse = z.infer<typeof OpenRouterResponseSchema>;

// Schemat dla wiadomości w requeście
const MessageSchema = z.object({
  role: z.union([z.literal("system"), z.literal("user"), z.literal("assistant")]),
  content: z.string(),
});

// Schemat dla JSON Schema
const JsonSchemaPropertySchema = z.object({
  type: z.string(),
  properties: z.record(z.unknown()).optional(),
  items: z.unknown().optional(),
});

const JsonSchemaSchema = z.object({
  name: z.string(),
  schema: z.object({
    type: z.literal("object"),
    properties: z.record(JsonSchemaPropertySchema),
    required: z.array(z.string()),
  }),
});

// Schemat dla formatu odpowiedzi
const ResponseFormatSchema = z.object({
  type: z.literal("json_schema"),
  json_schema: JsonSchemaSchema,
});

// Schemat dla parametrów modelu
const ModelParametersSchema = z.object({
  temperature: z.number(),
  top_p: z.number(),
});

// Główny schemat requestu
export const OpenRouterRequestSchema = z
  .object({
    messages: z.array(MessageSchema),
    model: z.string(),
    response_format: ResponseFormatSchema,
  })
  .merge(ModelParametersSchema);

// Typ requestu
export type OpenRouterRequest = z.infer<typeof OpenRouterRequestSchema>;

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Meal {
  meal_number_in_day: number;
  name: string;
  calories: number;
  ingredients: Ingredient[];
  meal_type: "breakfast" | "second breakfast" | "lunch" | "afternoon snack" | "dinner";
}

export interface DayPlan {
  day: number;
  meals: Meal[];
}

export interface DietPlanResponse {
  diet_plan: DayPlan[];
  shopping_list: Ingredient[];
}
