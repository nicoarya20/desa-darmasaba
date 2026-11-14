-- CreateTable
CREATE TABLE "JennaConversation" (
    "id" TEXT NOT NULL,
    "sessionHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JennaConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JennaMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "errorCode" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "toolsUsed" TEXT[],
    "sessionHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JennaMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JennaConversation_sessionHash_idx" ON "JennaConversation"("sessionHash");

-- CreateIndex
CREATE INDEX "JennaMessage_sessionHash_createdAt_idx" ON "JennaMessage"("sessionHash", "createdAt");

-- CreateIndex
CREATE INDEX "JennaMessage_ipHash_createdAt_idx" ON "JennaMessage"("ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "JennaMessage_createdAt_idx" ON "JennaMessage"("createdAt");

-- CreateIndex
CREATE INDEX "JennaMessage_conversationId_createdAt_idx" ON "JennaMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "JennaMessage" ADD CONSTRAINT "JennaMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "JennaConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

