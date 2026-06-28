/**
 * Mailchimp newsletter provider.
 *
 * Environment variables:
 *   MAILCHIMP_API_KEY    — Mailchimp API key (e.g., "your-api-key-us12")
 *   MAILCHIMP_LIST_ID    — Default audience/list ID
 *   MAILCHIMP_SERVER     — Mailchimp server prefix (e.g., "us12")
 *
 * Usage:
 *   const mailchimp = new MailchimpProvider();
 *   await mailchimp.subscribe({ email: "user@example.com", tags: ["website"] });
 */


export type MailchimpConfig = {
  apiKey: string;
  listId: string;
  server: string;
  doubleOptin?: boolean;
  tags?: string[];
};

export type MailchimpSubscribeResult = {
  success: boolean;
  message: string;
  status?: "subscribed" | "pending" | "cleaned" | "archived";
};

export class MailchimpProvider {
  private config: MailchimpConfig;

  constructor(config?: Partial<MailchimpConfig>) {
    const apiKey = config?.apiKey || (typeof process !== "undefined" ? process.env.MAILCHIMP_API_KEY : "") || "";
    const listId = config?.listId || (typeof process !== "undefined" ? process.env.MAILCHIMP_LIST_ID : "") || "";
    const server = config?.server || (typeof process !== "undefined" ? process.env.MAILCHIMP_SERVER : "") || "";

    if (!apiKey || !listId || !server) {
      throw new Error(
        "Mailchimp not configured. Set MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, and MAILCHIMP_SERVER env vars."
      );
    }

    this.config = {
      apiKey,
      listId,
      server,
      doubleOptin: config?.doubleOptin ?? true,
      tags: config?.tags || [],
    };
  }

  /**
   * Subscribe an email to the configured Mailchimp audience.
   */
  async subscribe(email: string, options?: {
    name?: string;
    tags?: string[];
    doubleOptin?: boolean;
  }): Promise<MailchimpSubscribeResult> {
    const dc = this.config.apiKey.split("-").pop() || this.config.server;
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${this.config.listId}/members`;

    const allTags = [...(this.config.tags || []), ...(options?.tags || [])];

    const body: Record<string, unknown> = {
      email_address: email,
      status: options?.doubleOptin ?? this.config.doubleOptin ? "pending" : "subscribed",
    };

    if (options?.name) {
      const parts = options.name.trim().split(/\s+/);
      body.merge_fields = {
        FNAME: parts[0] || "",
        LNAME: parts.slice(1).join(" ") || "",
      };
    }

    if (allTags.length > 0) {
      body.tags = allTags.map((t) => ({ name: t, status: "active" }));
    }

    try {
      const auth = Buffer.from(`anystring:${this.config.apiKey}`).toString("base64");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          message: "Successfully subscribed.",
          status: data.status,
        };
      }

      // Handle "already subscribed" gracefully
      if (data.title === "Member Exists" || data.status === 400) {
        // Update the existing member instead
        return this.updateMember(email, { tags: allTags });
      }

      return {
        success: false,
        message: data.detail || data.title || "Mailchimp subscription failed.",
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Mailchimp request failed.",
      };
    }
  }

  /**
   * Update an existing Mailchimp member (add tags).
   */
  private async updateMember(
    email: string,
    updates: { tags?: string[] }
  ): Promise<MailchimpSubscribeResult> {
    const dc = this.config.apiKey.split("-").pop() || this.config.server;
    const memberHash = this.md5(email.toLowerCase().trim());
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${this.config.listId}/members/${memberHash}`;

    try {
      const body: Record<string, unknown> = {};

      if (updates.tags && updates.tags.length > 0) {
        body.tags = updates.tags.map((t) => ({ name: t, status: "active" }));
      }

      const auth = Buffer.from(`anystring:${this.config.apiKey}`).toString("base64");

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: "Subscription updated.", status: data.status };
      }

      return {
        success: false,
        message: data.detail || "Failed to update subscription.",
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Mailchimp update failed.",
      };
    }
  }

  /**
   * MD5 hash — zero-dependency implementation safe for
   * Cloudflare Workers (no node:crypto import needed).
   */
  private md5(str: string): string {
    const md5 = (s: string) => {
      const rotateLeft = (x: number, n: number) => (x << n) | (x >>> (32 - n));
      const toHex = (n: number) => {
        const chars = "0123456789abcdef";
        let hex = "";
        for (let i = 0; i < 4; i++) {
          hex = chars[(n >> (i * 8 + 4)) & 0xf] + chars[(n >> (i * 8)) & 0xf] + hex;
        }
        return hex;
      };

      const utf8Encode = (s: string): number[] => {
        const bytes: number[] = [];
        for (let i = 0; i < s.length; i++) {
          const c = s.charCodeAt(i);
          if (c < 0x80) bytes.push(c);
          else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
          else if (c < 0xd800 || c >= 0xe000) {
            bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
          } else {
            i++;
            const cp = 0x10000 + (((c & 0x3ff) << 10) | (s.charCodeAt(i) & 0x3ff));
            bytes.push(
              0xf0 | (cp >> 18),
              0x80 | ((cp >> 12) & 0x3f),
              0x80 | ((cp >> 6) & 0x3f),
              0x80 | (cp & 0x3f)
            );
          }
        }
        return bytes;
      };

      const padding = (bytes: number[]): number[] => {
        const origLen = bytes.length;
        const bitsLen = origLen * 8;
        bytes.push(0x80);
        while ((bytes.length * 8) % 512 !== 448) bytes.push(0);
        for (let i = 0; i < 8; i++) bytes.push((bitsLen >>> (i * 8)) & 0xff);
        return bytes;
      };

      const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
      const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
      const H = (x: number, y: number, z: number) => x ^ y ^ z;
      const I = (x: number, y: number, z: number) => y ^ (x | ~z);

      const K = [0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
                 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
                 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
                 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
                 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
                 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
                 0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
                 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
                 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
                 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
                 0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
                 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
                 0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
                 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
                 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
                 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391];

      const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
                 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
                 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
                 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];

      const bytes = padding(utf8Encode(s));
      let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

      for (let i = 0; i < bytes.length; i += 64) {
        const M: number[] = [];
        for (let j = 0; j < 16; j++) {
          M[j] = bytes[i + j * 4] | (bytes[i + j * 4 + 1] << 8) |
                 (bytes[i + j * 4 + 2] << 16) | (bytes[i + j * 4 + 3] << 24);
        }

        let A = a0, B = b0, C = c0, D = d0;

        for (let j = 0; j < 64; j++) {
          let f: number, g: number;
          if (j < 16)      { f = F(B, C, D); g = j; }
          else if (j < 32) { f = G(B, C, D); g = (5 * j + 1) % 16; }
          else if (j < 48) { f = H(B, C, D); g = (3 * j + 5) % 16; }
          else             { f = I(B, C, D); g = (7 * j) % 16; }

          const temp = D;
          D = C;
          C = B;
          B = B + rotateLeft(A + f + K[j] + M[g], S[j]);
          A = temp;
        }

        a0 = (a0 + A) >>> 0;
        b0 = (b0 + B) >>> 0;
        c0 = (c0 + C) >>> 0;
        d0 = (d0 + D) >>> 0;
      }

      return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
    };

    return md5(str);
  }
}

/**
 * Helper to create a Mailchimp provider from environment.
 */
export function createMailchimpProvider(config?: Partial<MailchimpConfig>): MailchimpProvider {
  return new MailchimpProvider(config);
}
