-- Setelan suara Jenna (developer console). Suara default nonaktif; kuota global 0 = suara tidak aktif.
-- Provider suara memakai row JennaProvider dengan slot "voice" (tanpa perubahan kolom).

-- AlterTable
ALTER TABLE "JennaSettings" ADD COLUMN     "voiceEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "voiceDailyMinutesUser" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "voiceDailyMinutesGlobal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "voiceSessionMaxMinutes" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "voiceIdleOffSeconds" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "voiceName" VARCHAR(60) NOT NULL DEFAULT '';
