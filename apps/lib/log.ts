import { createLogger } from "@vyrlo/next";

export const logger = createLogger({
  apiKey: process.env.NEXT_PUBLIC_VYRLO_API_KEY!,
  appName: "servercn",
  environment: process.env.NODE_ENV || "development",
});
