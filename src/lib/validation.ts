import { z } from "zod";
const text = (max: number) => z.string().trim().max(max);
export const registerSchema = z.object({
  name: text(100).min(2),
  workspace: text(100).min(2),
  email: z.email().max(254).toLowerCase(),
  password: z.string().min(8).max(128),
});
export const loginSchema = registerSchema.pick({ email: true, password: true });
export const botSchema = z.object({
  name: text(100).min(2),
  description: text(500).default(""),
});
export const settingsSchema = z
  .object({
    providerId: z.string().nullable().optional(),
    model: text(100).min(1),
    embeddingModel: text(100).min(1),
    systemPrompt: text(16000).min(1),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().int().min(100).max(8192),
    language: text(50).min(1),
    unknownAnswer: z
      .string()
      .trim()
      .max(2000)
      .transform(
        (val) =>
          val ||
          "Dazu liegen mir leider keine ausreichenden Informationen vor. Bitte kontaktiere unser Team.",
      )
      .optional(),
    similarityThreshold: z
      .number()
      .min(0)
      .max(100)
      .transform((val) => (val > 1 ? val / 100 : val)),
    storeConversations: z.boolean(),
    analyticsEnabled: z.boolean(),
    retentionDays: z.number().int().min(1).max(365),
    inputCostPerMillion: z.number().min(0).max(1000),
    outputCostPerMillion: z.number().min(0).max(1000),
    embeddingCostPerMillion: z.number().min(0).max(1000),
    dailyRequestLimit: z.number().int().min(1).max(100000),
  })
  .partial();
const imageUrl = z.union([
  z.literal(""),
  z
    .url()
    .max(2000)
    .refine(
      (x) => new URL(x).protocol === "https:",
      "Nur HTTPS-Bilder sind erlaubt.",
    ),
]);
export const widgetSchema = z
  .object({
    displayName: text(100).min(1),
    greeting: text(1000),
    placeholder: text(150),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    avatarUrl: imageUrl,
    logoUrl: imageUrl,
    buttonIcon: z.enum(["message", "sparkles", "bot"]),
    position: z.enum(["left", "right"]),
    radius: z.number().int().min(0).max(32),
    theme: z.enum(["light", "dark"]),
    branding: z.boolean(),
  })
  .partial();
export const updateBotSchema = botSchema.partial().extend({
  active: z.boolean().optional(),
  settings: settingsSchema.optional(),
  widget: widgetSchema.optional(),
  domains: z
    .array(
      z
        .string()
        .toLowerCase()
        .regex(
          /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?::[0-9]{1,5})?$/,
        ),
    )
    .max(50)
    .optional(),
});
export const providerSchema = z.object({
  name: text(100).min(2),
  apiKey: text(500).min(8),
  baseUrl: z
    .url()
    .max(2000)
    .refine(
      (x) => new URL(x).protocol === "https:",
      "Provider-URL muss HTTPS verwenden.",
    ),
});
export const sourceSchema = z
  .object({
    name: text(200).min(1),
    type: z.enum(["TEXT", "FAQ", "URL", "CRAWL"]),
    content: text(500000).default(""),
    url: z.url().max(2000).optional(),
  })
  .refine(
    (x) => (["URL", "CRAWL"].includes(x.type) ? !!x.url : x.content.length > 0),
    "Text oder URL fehlt.",
  );
export const chatSchema = z.object({
  botId: z.string().min(1).max(100),
  message: text(4000).min(1),
  sessionToken: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  conversationId: z.uuid().optional(),
  settings: settingsSchema.optional(),
});
