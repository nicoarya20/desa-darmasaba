-- Desa ingin mengatur program inovasi mana yang tampil paling depan (mis. Davest) di rel beranda dan halaman
-- Inovasi › Program Inovasi; sebelumnya urutan terkunci abjad. Kolom nullable: data lama tetap urut abjad. Additive.

-- AlterTable
ALTER TABLE "ProgramInovasi" ADD COLUMN IF NOT EXISTS "urutan" INTEGER;
