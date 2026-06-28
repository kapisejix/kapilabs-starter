/**
 * ConvertKit newsletter provider.
 *
 * Environment variables:
 *   CONVERTKIT_API_KEY    — ConvertKit API key
 *   CONVERTKIT_FORM_ID    — ConvertKit form ID
 *   CONVERTKIT_TAGS       — Comma-separated tag names to add
 *
 * Usage:
 *   const result = await convertKitSubscribe({ email: "user@example.com", name: "John" });
 */

export type ConvertKitSubscribeOptions = {
  email: string;
  name?: string;
  tags?: string[];
};

export type ConvertKitSubscribeResult = {
  success: boolean;
  message: string;
  subscriberId?: number;
};

export async function convertKitSubscribe(
  options: ConvertKitSubscribeOptions
): Promise<ConvertKitSubscribeResult> {
  const apiKey =
    (typeof process !== "undefined" ? process.env.CONVERTKIT_API_KEY : undefined) || "";
  const formId =
    (typeof process !== "undefined" ? process.env.CONVERTKIT_FORM_ID : undefined) || "";

  if (!apiKey || !formId) {
    return {
      success: false,
      message: "ConvertKit not configured. Set CONVERTKIT_API_KEY and CONVERTKIT_FORM_ID env vars.",
    };
  }

  try {
    const body: Record<string, unknown> = {
      api_key: apiKey,
      email: options.email,
    };

    if (options.name) {
      body.first_name = options.name.split(" ")[0] || options.name;
    }

    if (options.tags && options.tags.length > 0) {
      body.tags = options.tags;
    }

    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (response.ok && data.subscription?.subscriber?.id) {
      return {
        success: true,
        message: "Successfully subscribed.",
        subscriberId: data.subscription.subscriber.id,
      };
    }

    return {
      success: false,
      message: data.error || data.message || "ConvertKit subscription failed.",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "ConvertKit request failed.",
    };
  }
}
