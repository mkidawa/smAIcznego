import { setupServer } from "msw/node";
import { handlers } from "./msw-handlers";

// Konfiguracja serwera MSW
export const server = setupServer(...handlers);
