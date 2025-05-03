import { PostgrestError } from "@supabase/supabase-js";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error | PostgrestError;
}

export class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === "development";

  private constructor() {
    // Initialize logger instance
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLogEntry(entry: LogEntry): string {
    const context = entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : "";
    let errorInfo = "";

    if (entry.error) {
      if ("code" in entry.error && "message" in entry.error) {
        // Handle PostgrestError
        const pgError = entry.error as PostgrestError;
        errorInfo = `\nPostgresError: ${pgError.message}\nCode: ${pgError.code}\nDetails: ${pgError.details}\nHint: ${pgError.hint}`;
      } else {
        // Handle standard Error
        errorInfo = `\nError: ${entry.error.message}\nStack: ${entry.error.stack}`;
      }
    }

    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${context}${errorInfo}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error | PostgrestError) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formattedLog = this.formatLogEntry(entry);

    if (this.isDevelopment) {
      switch (level) {
        case "info":
          console.log(formattedLog);
          break;
        case "warn":
          console.warn(formattedLog);
          break;
        case "error":
          console.error(formattedLog);
          break;
      }
    } else {
      // TODO: In the future, we can add integration with external logging system
      // e.g. Sentry, LogRocket, etc.
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error | PostgrestError, context?: Record<string, unknown>) {
    this.log("error", message, context, error);
  }
}
