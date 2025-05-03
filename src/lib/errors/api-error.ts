export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 503, details);
  }
}

export class ServerError extends ApiError {
  constructor(message = "Internal server error", details?: unknown) {
    super(message, 500, details);
  }
}
