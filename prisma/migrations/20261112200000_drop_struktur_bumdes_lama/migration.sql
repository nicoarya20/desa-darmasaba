-- Kenapa: "StrukturOrganisasiBumDes" dan "StrukturBumDes" usang sejak Struktur BUMDes pindah ke kode struktur
-- bersama (docs/decisions/2026-11-12-struktur-fleksibel.md). Data pegawai/jabatan BUMDes ada di
-- "PegawaiBumDes"/"PosisiOrganisasiBumDes" dan TIDAK disentuh migrasi ini. "StrukturOrganisasiBumDes" tak pernah
-- ditulis/dibaca kode; "StrukturBumDes" tak punya UI/API pengisi lagi (pencarian publik kini membaca "PegawaiBumDes").
--
-- Aman terhadap data: tabel hanya di-DROP bila KOSONG. Bila berisi, DROP dilewati (deploy TIDAK gagal) dan
-- RAISE NOTICE mencetak nama tabel + jumlah barisnya supaya tidak ada data hilang diam-diam.
-- Bila NOTICE muncul: schema Prisma tidak lagi memetakan tabel itu, aplikasi tetap jalan; operator memutuskan
-- manual (periksa isinya, lalu DROP TABLE bila memang sisa usang). Catatan: selama "StrukturOrganisasiBumDes"
-- yang berisi masih ada, FK ON DELETE RESTRICT-nya tetap menolak hapus pegawai/jabatan BUMDes yang dirujuknya.
--
-- Urutan: "StrukturOrganisasiBumDes" dulu, lalu "StrukturBumDes". FK milik tabel ikut terhapus bersama tabelnya.
-- Idempoten: to_regclass() melewati tabel yang sudah tidak ada.

DO $$
DECLARE
  jumlah bigint;
BEGIN
  IF to_regclass('"StrukturOrganisasiBumDes"') IS NOT NULL THEN
    SELECT count(*) INTO jumlah FROM "StrukturOrganisasiBumDes";
    IF jumlah = 0 THEN
      DROP TABLE "StrukturOrganisasiBumDes";
    ELSE
      RAISE NOTICE 'Tabel "StrukturOrganisasiBumDes" TIDAK dihapus: berisi % baris. Periksa lalu DROP manual bila usang.', jumlah;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  jumlah bigint;
BEGIN
  IF to_regclass('"StrukturBumDes"') IS NOT NULL THEN
    SELECT count(*) INTO jumlah FROM "StrukturBumDes";
    IF jumlah = 0 THEN
      DROP TABLE "StrukturBumDes";
    ELSE
      RAISE NOTICE 'Tabel "StrukturBumDes" TIDAK dihapus: berisi % baris. Periksa lalu DROP manual bila usang.', jumlah;
    END IF;
  END IF;
END $$;
