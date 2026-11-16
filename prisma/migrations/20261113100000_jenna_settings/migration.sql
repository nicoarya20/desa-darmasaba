-- CreateTable
CREATE TABLE "JennaSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "assistantName" TEXT NOT NULL DEFAULT 'Jenna',
    "personaNote" VARCHAR(1500) NOT NULL DEFAULT '',
    "maxInputChars" INTEGER NOT NULL DEFAULT 2000,
    "historyWindow" INTEGER NOT NULL DEFAULT 6,
    "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 10,
    "dailyMessagesUser" INTEGER NOT NULL DEFAULT 100,
    "dailyTokensGlobal" INTEGER NOT NULL DEFAULT 0,
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "chatProtocol" TEXT NOT NULL DEFAULT 'openai',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "JennaSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JennaProvider" (
    "slot" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL DEFAULT '',
    "apiKeyEnc" TEXT,
    "apiKeyHint" VARCHAR(4),
    "model" TEXT NOT NULL DEFAULT '',
    "temperature" DOUBLE PRECISION,
    "maxTokens" INTEGER,
    "timeoutMs" INTEGER NOT NULL DEFAULT 30000,
    "lastTestAt" TIMESTAMP(3),
    "lastTestOk" BOOLEAN,
    "lastTestMessage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "JennaProvider_pkey" PRIMARY KEY ("slot")
);

-- AddForeignKey
ALTER TABLE "JennaSettings" ADD CONSTRAINT "JennaSettings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JennaProvider" ADD CONSTRAINT "JennaProvider_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

