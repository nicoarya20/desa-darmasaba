-- Profil Perbekel: warga perlu bisa membuka laporan LHKPN Perbekel (berkas di Google Drive) dari halaman publik.
-- Murni aditif dan idempoten: satu kolom nullable tanpa backfill, jadi baris profil yang sudah diisi tetap valid
-- dan tetap tampil apa adanya sampai admin mengisi link-nya. Kolom/tabel lain tidak disentuh.
ALTER TABLE "ProfilPerbekel" ADD COLUMN IF NOT EXISTS "lhkpnUrl" VARCHAR(500);
