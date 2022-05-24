// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { CaptureConsole } from "@sentry/integrations";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

const env = process.env.NODE_ENV;
if (env !== "development") {
  // do something
  Sentry.init({
    dsn: SENTRY_DSN || "https://4ef32e42ad524d09a7d423e52762284e@o1209338.ingest.sentry.io/6343156",
    // Adjust this value in production, or use tracesSampler for greater control
    integrations: [
      new CaptureConsole({
        levels: ["error"],
      }),
    ],
    tracesSampleRate: 1.0,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
}
