import { Elysia, t } from "elysia";
import { jennaConfigGet, jennaProviderTest, jennaProviderUpdate, jennaSettingsUpdate } from "./jenna";
import {
  jennaConversationDelete,
  jennaConversationGet,
  jennaConversationsList,
  jennaStatsGet,
} from "./jenna-conversations";
import { systemOverviewGet } from "./system";

// Khusus role "0": setiap handler memanggil requireDeveloper (401/403). Guard global route.ts juga
// mewajibkan sesi untuk GET /api/developer (ADMIN_ONLY_GET_PATHS). Batas min/max divalidasi di
// src/lib/jenna/validation.ts agar pesan galat seragam { success, message }.
const slotParams = t.Object({ slot: t.String({ maxLength: 40 }) });
// Format id / page / limit / session divalidasi di handler (400 seragam), bukan di skema Elysia.
const conversationParams = t.Object({ id: t.String() });

const Developer = new Elysia({ prefix: "/developer", tags: ["Developer"] })
  .get("/system", systemOverviewGet)
  .get("/jenna", jennaConfigGet)
  .put("/jenna/settings", jennaSettingsUpdate, {
    body: t.Object({
      enabled: t.Optional(t.Boolean()),
      assistantName: t.Optional(t.String({ maxLength: 200 })),
      personaNote: t.Optional(t.String({ maxLength: 5000 })),
      maxInputChars: t.Optional(t.Number()),
      historyWindow: t.Optional(t.Number()),
      rateLimitPerMinute: t.Optional(t.Number()),
      dailyMessagesUser: t.Optional(t.Number()),
      dailyTokensGlobal: t.Optional(t.Number()),
      retentionDays: t.Optional(t.Number()),
      chatProtocol: t.Optional(t.String({ maxLength: 20 })),
    }),
  })
  .put("/jenna/providers/:slot", jennaProviderUpdate, {
    params: slotParams,
    body: t.Object({
      baseUrl: t.String({ maxLength: 2000 }),
      model: t.String({ maxLength: 500 }),
      temperature: t.Optional(t.Nullable(t.Number())),
      maxTokens: t.Optional(t.Nullable(t.Number())),
      timeoutMs: t.Optional(t.Number()),
      apiKey: t.Optional(t.String({ maxLength: 2000 })),
    }),
  })
  .post("/jenna/providers/:slot/test", jennaProviderTest, { params: slotParams })
  .get("/jenna/stats", jennaStatsGet)
  .get("/jenna/conversations", jennaConversationsList)
  .get("/jenna/conversations/:id", jennaConversationGet, { params: conversationParams })
  .delete("/jenna/conversations/:id", jennaConversationDelete, { params: conversationParams });

export default Developer;
