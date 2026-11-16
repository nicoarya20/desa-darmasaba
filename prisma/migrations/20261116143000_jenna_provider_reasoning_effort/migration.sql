-- Opsi reasoning_effort provider Jenna OpenAI-compatible. Additive; null = tidak dikirim (perilaku lama).

-- AlterTable
ALTER TABLE "JennaProvider" ADD COLUMN     "reasoningEffort" TEXT;
