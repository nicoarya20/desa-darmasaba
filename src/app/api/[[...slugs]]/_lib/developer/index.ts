import { Elysia, t } from "elysia";
import { auditLogList } from "./audit-log";
import { jennaConfigGet, jennaProviderKeyDelete, jennaProviderTest, jennaProviderUpdate, jennaSettingsUpdate } from "./jenna";
import { jennaKnowledgeGet } from "./jenna-knowledge";
import { jennaVoiceProviderKeyDelete, jennaVoiceProviderTest, jennaVoiceProviderUpdate } from "./jenna-voice";
import {
  jennaConversationDelete,
  jennaConversationGet,
  jennaConversationsList,
  jennaStatsGet,
} from "./jenna-conversations";
import { jennaErrorsList, jennaUsageGet } from "./jenna-usage";
import { loginLogList } from "./login-log";
import { systemOverviewGet } from "./system";

// Khusus role "0": setiap handler memanggil requireDeveloper (401/403). Guard global route.ts juga
// mewajibkan sesi untuk GET /api/developer (ADMIN_ONLY_GET_PATHS). Batas min/max divalidasi di
// src/lib/jenna/validation.ts agar pesan galat seragam { success, message }.
const slotParams = t.Object({ slot: t.String({ maxLength: 40 }) });
// Format id / page / limit / session divalidasi di handler (400 seragam), bukan di skema Elysia.
const conversationParams = t.Object({ id: t.String() });
const optionalString = t.Optional(t.String());
const logQuery = { page: optionalString, limit: optionalString, q: optionalString, from: optionalString, to: optionalString };

const Developer = new Elysia({ prefix: "/developer", tags: ["Developer"] })
  .get("/system", systemOverviewGet)
  .get("/audit-log", auditLogList, {
    query: t.Object({ ...logQuery, action: optionalString, actorId: optionalString, targetType: optionalString }),
  })
  .get("/login-log", loginLogList, { query: t.Object({ ...logQuery, result: optionalString, userId: optionalString }) })
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
      voiceEnabled: t.Optional(t.Boolean()),
      voiceDailyMinutesUser: t.Optional(t.Number()),
      voiceDailyMinutesGlobal: t.Optional(t.Number()),
      voiceSessionMaxMinutes: t.Optional(t.Number()),
      voiceIdleOffSeconds: t.Optional(t.Number()),
      voiceName: t.Optional(t.String({ maxLength: 200 })),
    }),
  })
  .put("/jenna/providers/:slot", jennaProviderUpdate, {
    params: slotParams,
    body: t.Object({
      baseUrl: t.String({ maxLength: 2000 }),
      model: t.String({ maxLength: 500 }),
      temperature: t.Optional(t.Nullable(t.Number())),
      maxTokens: t.Optional(t.Nullable(t.Number())),
      reasoningEffort: t.Optional(t.Nullable(t.String({ maxLength: 20 }))),
      timeoutMs: t.Optional(t.Number()),
      apiKey: t.Optional(t.String({ maxLength: 2000 })),
    }),
  })
  .post("/jenna/providers/:slot/test", jennaProviderTest, { params: slotParams })
  .delete("/jenna/providers/:slot/key", jennaProviderKeyDelete, { params: slotParams })
  .put("/jenna/voice/provider", jennaVoiceProviderUpdate, {
    body: t.Object({
      baseUrl: t.String({ maxLength: 2000 }),
      model: t.String({ maxLength: 500 }),
      timeoutMs: t.Optional(t.Number()),
      apiKey: t.Optional(t.String({ maxLength: 2000 })),
    }),
  })
  .post("/jenna/voice/provider/test", jennaVoiceProviderTest)
  .delete("/jenna/voice/provider/key", jennaVoiceProviderKeyDelete)
  .get("/jenna/knowledge", jennaKnowledgeGet)
  .get("/jenna/stats", jennaStatsGet)
  .get("/jenna/usage", jennaUsageGet)
  .get("/jenna/errors", jennaErrorsList)
  .get("/jenna/conversations", jennaConversationsList)
  .get("/jenna/conversations/:id", jennaConversationGet, { params: conversationParams })
  .delete("/jenna/conversations/:id", jennaConversationDelete, { params: conversationParams });

export default Developer;
