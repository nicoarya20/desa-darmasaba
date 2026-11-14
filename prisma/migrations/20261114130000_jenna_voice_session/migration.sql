-- Runtime suara Jenna publik (tahap 2): tabel sesi suara + modalitas pesan. Additive; baris lama = "text".

-- AlterTable
ALTER TABLE "JennaMessage" ADD COLUMN     "modality" TEXT NOT NULL DEFAULT 'text';

-- CreateTable
CREATE TABLE "JennaVoiceSession" (
    "id" TEXT NOT NULL,
    "sessionHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'starting',
    "gatewaySessionId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maxSeconds" INTEGER NOT NULL,
    "endedAt" TIMESTAMP(3),
    "endReason" TEXT,
    "billedSeconds" INTEGER NOT NULL DEFAULT 0,
    "hangupStatus" INTEGER,

    CONSTRAINT "JennaVoiceSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JennaVoiceSession_sessionHash_startedAt_idx" ON "JennaVoiceSession"("sessionHash", "startedAt");

-- CreateIndex
CREATE INDEX "JennaVoiceSession_ipHash_startedAt_idx" ON "JennaVoiceSession"("ipHash", "startedAt");

-- CreateIndex
CREATE INDEX "JennaVoiceSession_startedAt_idx" ON "JennaVoiceSession"("startedAt");

-- CreateIndex
CREATE INDEX "JennaVoiceSession_status_idx" ON "JennaVoiceSession"("status");
