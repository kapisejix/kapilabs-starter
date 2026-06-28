/**
 * Newsletter subscription orchestrator.
 *
 * Supports multiple providers: Mailchimp, ConvertKit, and custom endpoints.
 * The active provider is selected via the NEWSLETTER_PROVIDER env variable.
 *
 * Usage:
 *   import { subscribe } from "@kapi/newsletter";
 *   const result = await subscribe("user@example.com", { name: "John" });
 */

export type NewsletterSubscribeResult = {
  success: boolean;
  message: string;
  provider?: string;
};

export type NewsletterSubscribeOptions = {
  name?: string;
  email: string;
  tags?: string[];
  doubleOptin?: boolean;
};

/**
 * Subscribe an email to the configured newsletter provider.
 */
export async function subscribe(options: NewsletterSubscribeOptions): Promise<NewsletterSubscribeResult> {
  const provider = getActiveProvider();

  switch (provider) {
    case "mailchimp": {
      const { MailchimpProvider } = await import("./providers/mailchimp");
      const mailchimp = new MailchimpProvider();
      const result = await mailchimp.subscribe(options.email, {
        name: options.name,
        tags: options.tags,
        doubleOptin: options.doubleOptin,
      });
      return {
        success: result.success,
        message: result.message,
        provider: "mailchimp",
      };
    }

    case "convertkit": {
      // ConvertKit provider — stub for future implementation
      const { convertKitSubscribe } = await import("./providers/convertkit");
      return convertKitSubscribe(options);
    }

    case "custom": {
      const endpoint = typeof process !== "undefined"
        ? process.env.NEWSLETTER_CUSTOM_ENDPOINT
        : "";

      if (!endpoint) {
        return { success: false, message: "Custom endpoint not configured.", provider: "custom" };
      }

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options),
        });

        const data = await response.json();
        return {
          success: response.ok,
          message: data.message || response.ok ? "Subscribed." : "Subscription failed.",
          provider: "custom",
        };
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : "Custom endpoint request failed.",
          provider: "custom",
        };
      }
    }

    default:
      return { success: false, message: `Unknown provider: ${provider}` };
  }
}

/**
 * Get the active newsletter provider from environment.
 */
function getActiveProvider(): string {
  return (
    (typeof process !== "undefined" ? process.env.NEWSLETTER_PROVIDER : undefined) ||
    (typeof import.meta !== "undefined"
      ? (import.meta as Record<string, any>).env?.PUBLIC_NEWSLETTER_PROVIDER
      : undefined) ||
    ""
  ).toLowerCase();
}

/**
 * Check if a newsletter provider is configured.
 */
export function isNewsletterConfigured(): boolean {
  return !!getActiveProvider();
}

/**
 * Get the newsletter provider name for display.
 */
export function getNewsletterProvider(): string {
  return getActiveProvider() || "none";
}
