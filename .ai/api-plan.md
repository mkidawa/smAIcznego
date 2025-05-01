# REST API Plan

## 1. Resources

| Resource      | DB Table                | Description                                           |
| ------------- | ----------------------- | ----------------------------------------------------- |
| User          | (Supabase `auth.users`) | Authenticated application user.                       |
| Profile       | `Profile`               | Extended user profile (age, weight, allergies, etc.). |
| Diet          | `Diet`                  | Generated meal-plan entity for a given user.          |
| Meal          | `Meal`                  | Single meal that belongs to a Diet & Day.             |
| Recipe        | `Recipe`                | Detailed cooking instructions for a Meal.             |
| ShoppingList  | `ShoppingList`          | Aggregated grocery items for a Diet.                  |
| Generation    | `Generation`            | AI generation request meta-record.                    |
| GenerationLog | `GenerationLog`         | Fine-grained AI request/response/error events.        |

---

## 2. Endpoints

### 2.2 Profile

| Method | Path     | Description                                                          |
| ------ | -------- | -------------------------------------------------------------------- |
| GET    | /profile | Fetch current user profile (`Profile`).                              |
| POST   | /profile | Create initial profile record. Fails with 409 if one already exists. |
| PUT    | /profile | Update existing profile (all fields optional, must already exist).   |

Request body (`POST` or `PUT`):

```json
{
  "age": 30,
  "gender": "female",
  "weight": 68.5,
  "allergies": ["peanuts", "lactose"],
  "termsAccepted": true
}
```

Successful `POST` response (HTTP 201 Created):

```json
{
  "id": "uuid", // Supabase user id
  "age": 30,
  "gender": "female",
  "weight": 68.5,
  "allergies": ["peanuts", "lactose"],
  "termsAccepted": true,
  "createdAt": "2024-05-30T12:34:56Z"
}
```

Successful `PUT` response (HTTP 200 OK) mirrors the above but includes `updatedAt`.

Error cases:
| HTTP | Code | Condition |
|------|----------------------|---------------------------------------------|
| 400 | VALIDATION_FAILED | Payload violates constraints. |
| 401 | UNAUTHORIZED | Missing/invalid JWT. |
| 403 | FORBIDDEN | RLS or other auth rule blocked action. |
| 404 | PROFILE_NOT_FOUND | `PUT`/`GET` when profile row not created. |
| 409 | PROFILE_ALREADY_EXISTS | `POST` when profile row already exists. |

Validation rules:

- `age` >= 0, integer
- `weight` >= 0, numeric(5,2)
- `gender` ∈ {"male","female","other"} (open enum)
- `termsAccepted` must be `true` on first save

---

### 2.3 Diets

#### 2.3.1 Create Diet (step 1 of 3)

| Method | Path   | Description                                                    |
| ------ | ------ | -------------------------------------------------------------- |
| POST   | /diets | Create a Diet shell using core preview data (no meals / list). |

Request body:

```json
{
  "numberOfDays": 7,
  "caloriesPerDay": 2200,
  "preferredCuisines": ["italian", "vegetarian"],
  "generationId": 456
}
```

Response (HTTP 201):

```json
{
  "dietId": 123,
  "status": "draft", // becomes "ready" after steps 2 & 3
  "generationId": 456
}
```

Back-end actions:

1. Validate fields (days ≤14, calories >0, generationId exists, etc.).
2. Insert Diet row; set `status = draft`.
3. Verify that the generation exists and belongs to the current user.

Error cases:
| HTTP | Code | Condition |
|------|----------------------|---------------------------------------------|
| 400 | VALIDATION_FAILED | Payload violates constraints. |
| 401 | UNAUTHORIZED | Missing/invalid JWT. |
| 403 | FORBIDDEN | RLS or other auth rule blocked action. |
| 404 | GENERATION_NOT_FOUND | Specified generationId does not exist or belongs to another user. |
| 409 | DIET_ALREADY_EXISTS | Diet for this generation already exists. |

Validation rules:

- `age` >= 0, integer
- `weight` >= 0, numeric(5,2)
- `gender` ∈ {"male","female","other"} (open enum)
- `termsAccepted` must be `true` on first save

---

### 2.4 Meals _(step 2 of 3)_

| Method | Path                  | Description                                 |
| ------ | --------------------- | ------------------------------------------- |
| POST   | /diets/{dietId}/meals | Bulk create Meal rows for given Diet.       |
| GET    | /diets/{dietId}/meals | List meals in given diet. Supports filters. |
| GET    | /meals/{mealId}       | Fetch single meal with optional recipe.     |

Bulk create request:

```json
{
  "meals": [
    {
      "day": 1,
      "mealType": "breakfast",
      "instructions": "Omelette with spinach",
      "approxCalories": 400,
      "recipe": {
        "title": "Spinach Omelette",
        "description": "Fluffy omelette",
        "instructions": "Beat eggs..."
      }
    }
  ]
}
```

Response: HTTP 201 with array of created meal IDs.

After successful insert of all meals, the service may set Diet.status → `meals_ready`.

---

### 2.5 Shopping List _(step 3 of 3)_

| Method | Path                          | Description                           |
| ------ | ----------------------------- | ------------------------------------- |
| POST   | /diets/{dietId}/shopping-list | Create the ShoppingList for the diet. |
| GET    | /diets/{dietId}/shopping-list | Retrieve grocery items array.         |

Request body:

```json
{
  "items": ["eggs", "spinach", "olive oil"]
}
```

Response: HTTP 201 with created `shoppingListId`.

When both Meals and ShoppingList are present, the API transitions Diet.status → `ready`.

(Note: Section numbering of subsequent headings adjusted accordingly.)

---

### 2.6 Recipes

| Method | Path                | Description                                     |
| ------ | ------------------- | ----------------------------------------------- |
| GET    | /recipes/{recipeId} | Retrieve recipe (linked to meal or standalone). |

---

### 2.7 Generations

| Method | Path                   | Description                                                         |
| ------ | ---------------------- | ------------------------------------------------------------------- |
| POST   | /generations           | Validate diet params, call AI, store preview + metadata.            |
| GET    | /generations/{id}      | Retrieve generation state & preview (`pending`, `completed`, etc.). |
| GET    | /generations/{id}/logs | Paginated events from `GenerationLog`.                              |

POST request body mirrors diet parameters:

```json
{
  "numberOfDays": 7,
  "caloriesPerDay": 2200,
  "mealsPerDay": 5,
  "preferredCuisines": ["italian", "vegetarian"]
}
```

Successful response (HTTP 202 Accepted):

```json
{
  "generationId": 456,
  "status": "pending"
}
```

Server flow:

1. Validate constraints (days ≤14, positive calories, etc.).
2. Insert `Generation` row (`source_text` prompt, status `pending`).
3. Enqueue background worker to call Openrouter.ai.
4. Stream AI chunks into temporary store; on finish set `status = completed`, embed preview JSON payload in `metadata.preview`.
5. Log `request`, `response`, `error` events into `GenerationLog`.

GET `/generations/{id}` response when completed:

```json
{
  "generationId": 456,
  "status": "completed",
  "preview": {
    /* diet preview identical to final Diet shape */
  },
  "createdAt": "2024-06-01T10:00:00Z"
}
```

Error cases similar to other endpoints (`GENERATION_NOT_FOUND`, 403 on RLS, etc.).

---

## 3. Authentication & Authorization

1. **Authentication** – Supabase JWT (RS256). Tokens are sent via `Authorization: Bearer`.
2. **Row Level Security** – Enabled on every table with `user_id` FK. Policies:
   - `user_id = auth.uid()` for `select`, `insert`, `update`, `delete`.
3. **Role-based access** – ordinary users vs. `service_role` (server only).
4. **Rate-limiting** – Global: 100 RPM / IP. Authenticated: 1 req/s sustained, burst 20.
5. **CORS** – Allow trusted origins only.
6. **Transport security** – HTTPS enforced.

---

## 4. Validation & Business Logic

### 4.1 Validation matrix (selected)

| Field               | Constraint                | Error code                        |
| ------------------- | ------------------------- | --------------------------------- |
| Diet.numberOfDays   | 1 – 14                    | 422 `NUMBER_OF_DAYS_OUT_OF_RANGE` |
| Diet.caloriesPerDay | > 0                       | 422 `CALORIES_INVALID`            |
| Meal.day            | > 0 & ≤ Diet.numberOfDays | 422 `MEAL_DAY_INVALID`            |
| Meal.mealType       | Enum set                  | 422 `MEAL_TYPE_INVALID`           |
| Profile.weight      | ≥ 0                       | 422 `WEIGHT_INVALID`              |

### 4.2 Business rules implementation

1. Diet generation is immutable once `status = ready`. Attempt to `PUT /diets/{id}` returns 409 `DIET_IMMUTABLE`.
2. Exactly one ShoppingList per Diet. API internally enforces uniqueness when persisting.
3. Deleting a Diet cascades deletion to Meals & ShoppingList via FK; API echoes 204 No Content.
4. Recipe creation handled internally by generator; no public `POST /recipes` route.
5. `GenerationLog` rows write-only; no deletion from public API.

---

## 5. Error Handling (common schema)

Every error returns the following JSON:

```json
{
  "error": {
    "code": "STRING_CONSTANT",
    "message": "Human readable message."
  }
}
```

HTTP codes:

- 400 Bad Request – malformed JSON / parameters
- 401 Unauthorized – missing/expired token
- 403 Forbidden – RLS rejection
- 404 Not Found – resource absent or belongs to another user
- 409 Conflict – state violates business rule
- 422 Unprocessable Entity – validation failure
- 500 Internal Server Error – unhandled

---

## 6. Pagination, Filtering & Sorting

- Pagination: `page` (1-based) & `perPage` (default 10, max 50).
- Cursor-based pagination planned for v2 (GenerationLog heavy lists).
- Filtering: standard query params per endpoint (documented above).
- Sorting: `sortBy` (field name) & `order` (asc|desc). Defaults: createdAt desc.

---

## 7. Versioning & Evolution

- Base path `/v1/` reserved although omitted above for readability.
- Breaking changes -> bump major (`/v2/`). Non-breaking -> minor in response headers.

---

## 8. Security Hardening Checklist

1. Enforce RLS + PostgREST JWT claims.
2. Validate all enum inputs server-side.
3. Store AI prompts & completions for audit (`Generation`, `GenerationLog`).
4. Strip PII from logs before persistence.
5. Timeouts on upstream AI calls (30 s) + retries (exponential, max 3).

---

## 9. Open Questions / Assumptions

1. Diet generation is asynchronous; UI listens to Supabase Realtime or polls `/diets/{id}`.
2. Password reset, email confirmation flows are delegated entirely to Supabase.
3. Pagination strategy adequate for MVP; cursor-based may replace page-based later.
