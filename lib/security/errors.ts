export class AppError extends Error {
  constructor(
    message: string,
    public readonly code = "app_error",
    public readonly status = 400,
    public readonly expose = true
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, "rate_limited", 429, true);
    this.name = "RateLimitError";
  }
}

export function isRedirectError(error: unknown) {
  return error instanceof Error && error.message.includes("NEXT_REDIRECT");
}

export function toErrorMessage(
  error: unknown,
  fallback = "Something went wrong."
) {
  if (error instanceof AppError && error.expose) {
    return error.message;
  }

  return fallback;
}
