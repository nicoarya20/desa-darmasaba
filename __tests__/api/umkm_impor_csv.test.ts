// @vitest-environment node
// Impor CSV Data UMKM (lib murni): parser kolom/alias, validasi baris & batas panjang, kunci duplikat,
// rencana impor (lewati/perbarui, kategori, duplikat), peringatan kontak, template, dan pemetaan pratinjau.
// Semua data di bawah rekaan (test-only).
import { describe, expect, it } from 'vitest';
import { buatTemplateCsvUmkm, parseCsvUmkm } from '@/lib/umkm/umkm-impor-csv';
import { bodyImporUmkm, bolehImpor, gabungPratinjau, pratinjauTanpaServer } from '@/lib/umkm/umkm-impor-pratinjau';
import { susunRencanaImpor } from '@/lib/umkm/umkm-impor-rencana';
import {
  deskripsiKeHtml,
  IMPOR_UMKM_MAKS_BARIS,
  kunciUmkm,
  normalNama,
  peringatanKontak,
  UMKM_ALAMAT_MAKS,
  UMKM_DESKRIPSI_MAKS,
  UMKM_KONTAK_MAKS_DIGIT,
  UMKM_NAMA_MAKS,
  UMKM_PEMILIK_MAKS,
  validasiBarisUmkm,
} from '@/lib/umkm/umkm-impor.rules';

describe('parseCsvUmkm', () => {
  it('kolom wajib + opsional; kolom lain dibuang; nomor baris = baris berkas', () => {
    const csv = 'no;gambar;nama;pemilik;kategori;deskripsi;alamat;kontak;isActive\n1;x.png;Warung A;Pemilik A;Makanan;Enak;Br. Satu;08123456789;false\n';
    const r = parseCsvUmkm(csv);
    expect(r.galat).toBeNull();
    expect(r.ditolak).toEqual([]);
    expect(r.rows).toEqual([
      { baris: 2, nama: 'Warung A', pemilik: 'Pemilik A', kategori: 'Makanan', deskripsi: 'Enak', alamat: 'Br. Satu', kontak: '08123456789' },
    ]);
    expect(Object.keys(r.rows[0]).sort()).toEqual(['alamat', 'baris', 'deskripsi', 'kategori', 'kontak', 'nama', 'pemilik']);
    expect(JSON.stringify(r)).not.toContain('x.png');
  });

  it('alias header (tidak peka huruf besar/kecil) diterima', () => {
    const r = parseCsvUmkm('Nama Usaha,Nama Pemilik,Kategori Produk,No. HP\nWarung B,Pemilik B,Kerajinan,0812');
    expect(r.rows).toEqual([{ baris: 2, nama: 'Warung B', pemilik: 'Pemilik B', kategori: 'Kerajinan', kontak: '0812' }]);
    const w = parseCsvUmkm('NAMA UMKM;PEMILIK;KATEGORI UMKM;WHATSAPP\nC;D;E;0811');
    expect(w.rows[0]).toMatchObject({ nama: 'C', pemilik: 'D', kategori: 'E', kontak: '0811' });
    expect(parseCsvUmkm('nama,pemilik,kategori,telepon\nC,D,E,0811').rows[0].kontak).toBe('0811');
    expect(parseCsvUmkm('nama,pemilik,kategori,no telepon\nC,D,E,0811').rows[0].kontak).toBe('0811');
  });

  it('kolom wajib hilang → galat berkas menyebut kolomnya', () => {
    const r = parseCsvUmkm('nama,alamat\nA,B');
    expect(r.galat).toBe("Header CSV wajib memuat kolom 'pemilik', 'kategori'");
    expect(r.rows).toEqual([]);
  });

  it('header duplikat (termasuk alias ganda untuk kolom yang sama) → galat', () => {
    expect(parseCsvUmkm('nama,pemilik,kategori,nama\nA,B,C,D').galat).toMatch(/'nama'.*lebih dari satu/);
    expect(parseCsvUmkm('nama,nama umkm,pemilik,kategori\nA,B,C,D').galat).toMatch(/'nama'.*lebih dari satu/);
    // kolom tak dikenal yang kembar tidak masalah
    expect(parseCsvUmkm('x,x,nama,pemilik,kategori\n1,2,A,B,C').galat).toBeNull();
  });

  it('berkas kosong, terlalu besar, terlalu banyak baris', () => {
    expect(parseCsvUmkm('').galat).toBe('Berkas CSV kosong');
    const besar = `nama,pemilik,kategori\n${'a,b,c\n'.repeat(400_000)}`;
    expect(parseCsvUmkm(besar).galat).toMatch(/Ukuran berkas maksimal 2 MB/);
    const isi = Array.from({ length: IMPOR_UMKM_MAKS_BARIS + 1 }, (_, i) => `U${i},P${i},K`).join('\n');
    const r = parseCsvUmkm(`nama,pemilik,kategori\n${isi}`);
    expect(r.galat).toContain(String(IMPOR_UMKM_MAKS_BARIS));
    expect(r.rows).toEqual([]);
    const pas = Array.from({ length: IMPOR_UMKM_MAKS_BARIS }, (_, i) => `U${i},P${i},K`).join('\n');
    expect(parseCsvUmkm(`nama,pemilik,kategori\n${pas}`).rows).toHaveLength(IMPOR_UMKM_MAKS_BARIS);
  });

  it('baris kosong dilewati; sel kurang/lebih dari header tidak crash; baris tak valid ditolak dengan nama kolom', () => {
    const r = parseCsvUmkm('nama;pemilik;kategori;kontak\nA;B;C;0812\n\n;;;\nD;E\nF;G;H;1;2;3\n;X;Y;');
    expect(r.rows.map((x) => [x.baris, x.nama])).toEqual([[2, 'A'], [6, 'F']]);
    expect(r.ditolak).toEqual([
      { baris: 5, alasan: "Kolom 'kategori' wajib diisi" },
      { baris: 7, alasan: "Kolom 'nama' wajib diisi" },
    ]);
  });

  it('kutip berisi ; , dan baris baru, BOM + CRLF, spasi dirapikan; deskripsi menjaga paragraf', () => {
    const csv = '﻿nama;pemilik;kategori;deskripsi\r\n"  Warung   ""Satu""";Bu A;Makanan;"Baris 1;\nBaris 2, koma"\r\n';
    const r = parseCsvUmkm(csv);
    expect(r.rows).toEqual([{ baris: 2, nama: 'Warung "Satu"', pemilik: 'Bu A', kategori: 'Makanan', deskripsi: 'Baris 1;\nBaris 2, koma' }]);
  });

  it('galat tanpa membocorkan isi data', () => {
    const r = parseCsvUmkm(`nama,pemilik,kategori,kontak\nRAHASIA-NAMA,RAHASIA-PEMILIK,K,abc-RAHASIA`);
    expect(r.rows).toEqual([]);
    expect(r.ditolak).toEqual([{ baris: 2, alasan: "Kolom 'kontak' hanya boleh berisi angka" }]);
    expect(JSON.stringify(r.ditolak)).not.toContain('RAHASIA');
  });
});

describe('validasiBarisUmkm', () => {
  const dasar = { nama: 'N', pemilik: 'P', kategori: 'K' };

  it('wajib: nama, pemilik, kategori; semua galat baris digabung', () => {
    expect(validasiBarisUmkm({})).toEqual({
      ok: false,
      alasan: "Kolom 'nama' wajib diisi; Kolom 'pemilik' wajib diisi; Kolom 'kategori' wajib diisi",
    });
    expect(validasiBarisUmkm({ ...dasar, nama: 12 })).toEqual({ ok: false, alasan: "Kolom 'nama' wajib diisi" });
  });

  it('batas panjang tepat di batas lolos, satu lebih ditolak', () => {
    const uji = (kolom: string, maks: number) => {
      expect(validasiBarisUmkm({ ...dasar, [kolom]: 'x'.repeat(maks) }).ok).toBe(true);
      const r = validasiBarisUmkm({ ...dasar, [kolom]: 'x'.repeat(maks + 1) });
      expect(r).toEqual({ ok: false, alasan: `Kolom '${kolom}' maksimal ${maks} karakter` });
    };
    uji('nama', UMKM_NAMA_MAKS);
    uji('pemilik', UMKM_PEMILIK_MAKS);
    uji('alamat', UMKM_ALAMAT_MAKS);
    uji('deskripsi', UMKM_DESKRIPSI_MAKS);
    expect(validasiBarisUmkm({ ...dasar, kategori: 'k'.repeat(101) }).ok).toBe(false);
  });

  it('spasi dirapikan, karakter kontrol & lebar-nol dibuang, kolom opsional kosong dihilangkan', () => {
    const r = validasiBarisUmkm({ nama: '  A\u0000  B​ ', pemilik: 'P\tQ', kategori: ' K ', alamat: '   ', deskripsi: '' });
    expect(r).toEqual({ ok: true, value: { nama: 'A B', pemilik: 'P Q', kategori: 'K' } });
  });

  it('kontak: seperti form (angka saja, maks 13 digit); pemisah umum dibuang, huruf ditolak', () => {
    expect(validasiBarisUmkm({ ...dasar, kontak: '0812-3456 7890' })).toMatchObject({ ok: true, value: { kontak: '081234567890' } });
    expect(validasiBarisUmkm({ ...dasar, kontak: '+62 812 (345)' })).toMatchObject({ ok: true, value: { kontak: '62812345' } });
    expect(validasiBarisUmkm({ ...dasar, kontak: '1'.repeat(UMKM_KONTAK_MAKS_DIGIT) }).ok).toBe(true);
    expect(validasiBarisUmkm({ ...dasar, kontak: '1'.repeat(UMKM_KONTAK_MAKS_DIGIT + 1) })).toEqual({
      ok: false,
      alasan: `Kolom 'kontak' maksimal ${UMKM_KONTAK_MAKS_DIGIT} digit`,
    });
    expect(validasiBarisUmkm({ ...dasar, kontak: 'WA 0812' })).toEqual({ ok: false, alasan: "Kolom 'kontak' hanya boleh berisi angka" });
    expect(validasiBarisUmkm({ ...dasar, kontak: '---' })).toEqual({ ok: false, alasan: "Kolom 'kontak' hanya boleh berisi angka" });
  });
});

describe('normalisasi, kunci duplikat, deskripsi, peringatan', () => {
  it('normalNama & kunciUmkm: trim, spasi ganda, huruf besar/kecil, NFC', () => {
    expect(normalNama('  Warung   SATE ')).toBe('warung sate');
    expect(normalNama('é')).toBe(normalNama('é'));
    expect(kunciUmkm('Warung  A', ' bu KOMANG')).toBe(kunciUmkm('warung a', 'Bu Komang'));
    expect(kunciUmkm('a', 'b c')).not.toBe(kunciUmkm('a b', 'c'));
  });

  it('deskripsiKeHtml meng-escape HTML dan memisah paragraf', () => {
    expect(deskripsiKeHtml('<script>x</script> & "q"\nBaris dua')).toBe('<p>&lt;script&gt;x&lt;/script&gt; &amp; "q"</p><p>Baris dua</p>');
  });

  it('peringatanKontak: 9–13 digit diawali 8 saja; nomor berawalan 0/62 dan lainnya tidak', () => {
    expect(peringatanKontak('81234567890')).toMatch(/kehilangan|hilang/);
    expect(peringatanKontak('812345678')).not.toBeNull();
    expect(peringatanKontak('8123456789012')).not.toBeNull();
    expect(peringatanKontak('81234567')).toBeNull();
    expect(peringatanKontak('81234567890123')).toBeNull();
    expect(peringatanKontak('081234567890')).toBeNull();
    expect(peringatanKontak('6281234567890')).toBeNull();
    expect(peringatanKontak(undefined)).toBeNull();
  });
});

describe('susunRencanaImpor', () => {
  const kategori = [
    { id: 'k-makan', nama: 'Makanan' },
    { id: 'k-kerajinan', nama: ' Kerajinan  Tangan ' },
  ];
  const ada = [{ id: 'u-1', nama: 'Warung A', pemilik: 'Bu A' }];
  const r = (o: Record<string, unknown>) => ({ nama: 'Baru', pemilik: 'Pemilik', kategori: 'makanan', ...o });

  it('baris baru ditambah; kategori dicocokkan by-nama tidak peka huruf/spasi', () => {
    const x = susunRencanaImpor({ rows: [r({}), r({ nama: 'Dua', kategori: 'kerajinan TANGAN', alamat: 'Br. X', kontak: '0812', deskripsi: 'a<b' })], mode: 'lewati', kategori, ada });
    expect(x.galat).toEqual([]);
    expect(x.tambah).toEqual([
      { nama: 'Baru', pemilik: 'Pemilik', kategoriId: 'k-makan' },
      { nama: 'Dua', pemilik: 'Pemilik', kategoriId: 'k-kerajinan', alamat: 'Br. X', kontak: '0812', deskripsi: '<p>a&lt;b</p>' },
    ]);
  });

  it('mode lewati: yang sudah ada dilewati (kunci tak peka huruf/spasi), tanpa menilai kategori', () => {
    const x = susunRencanaImpor({ rows: [r({ nama: ' warung  a ', pemilik: 'BU A', kategori: 'tidak-ada' }), r({})], mode: 'lewati', kategori, ada });
    expect(x.dilewati).toBe(1);
    expect(x.tambah).toHaveLength(1);
    expect(x.perbarui).toEqual([]);
    expect(x.galat).toEqual([]);
  });

  it('mode perbarui: hanya field terisi yang menimpa (sel kosong tidak menimpa), kategori selalu', () => {
    const x = susunRencanaImpor({ rows: [r({ nama: 'Warung A', pemilik: 'Bu A', alamat: 'Baru', kontak: '', deskripsi: '' })], mode: 'perbarui', kategori, ada });
    expect(x.perbarui).toEqual([{ id: 'u-1', data: { kategoriId: 'k-makan', alamat: 'Baru' } }]);
    expect(Object.keys(x.perbarui[0].data)).toEqual(['kategoriId', 'alamat']);
    expect(x.tambah).toEqual([]);
    expect(x.dilewati).toBe(0);
  });

  it('kategori tidak dikenal & ambigu → galat baris (nomor = indeks + 1), tidak membuat kategori', () => {
    const dobel = [...kategori, { id: 'k-makan-2', nama: 'makanan' }];
    const x = susunRencanaImpor({ rows: [r({ kategori: 'Minuman' }), r({ nama: 'Dua' })], mode: 'lewati', kategori: dobel, ada });
    expect(x.galat).toEqual([
      { baris: 1, alasan: 'Kategori "Minuman" tidak dikenal. Buat dulu di tab Kategori Produk atau perbaiki penulisannya' },
      { baris: 2, alasan: 'Kategori "makanan" ambigu: ada 2 kategori aktif dengan nama yang sama' },
    ]);
    expect(x.tambah).toEqual([]);
  });

  it('duplikat di dalam berkas: baris kedua dst. galat, tidak digabung diam-diam', () => {
    const x = susunRencanaImpor({ rows: [r({}), r({ nama: ' BARU ', pemilik: 'pemilik' }), r({ nama: 'Lain' }), r({})], mode: 'lewati', kategori, ada });
    expect(x.galat).toEqual([
      { baris: 2, alasan: 'Nama + pemilik sama dengan baris 1 di berkas ini' },
      { baris: 4, alasan: 'Nama + pemilik sama dengan baris 1 di berkas ini' },
    ]);
    expect(x.tambah.map((u) => u.nama)).toEqual(['Baru', 'Lain']);
  });

  it('baris tak valid → galat dengan nama kolom; peringatan kontak 8xxx hanya untuk baris yang ditulis', () => {
    const x = susunRencanaImpor({
      rows: [{ nama: '', pemilik: 'P', kategori: 'Makanan' }, r({ nama: 'A', kontak: '81234567890' }), null, r({ nama: 'Warung A', pemilik: 'Bu A', kontak: '81234567891' })],
      mode: 'lewati',
      kategori,
      ada,
    });
    expect(x.galat.map((g) => g.baris)).toEqual([1, 3]);
    expect(x.galat[0].alasan).toBe("Kolom 'nama' wajib diisi");
    expect(x.peringatan).toHaveLength(1);
    expect(x.peringatan[0].baris).toBe(2);
    expect(x.dilewati).toBe(1);
  });
});

describe('template & pratinjau', () => {
  it('template: BOM, pemisah ;, header baku, 2 baris contoh, dan terbaca balik oleh parser', () => {
    const t = buatTemplateCsvUmkm();
    expect(t.charCodeAt(0)).toBe(0xfeff);
    expect(t.split('\r\n')[0]).toBe('﻿nama;pemilik;kategori;deskripsi;alamat;kontak');
    const hasil = parseCsvUmkm(t);
    expect(hasil.galat).toBeNull();
    expect(hasil.ditolak).toEqual([]);
    expect(hasil.rows).toHaveLength(2);
  });

  it('bodyImporUmkm membuang nomor baris; gabungPratinjau memetakan nomor server ke baris berkas', () => {
    const hasil = parseCsvUmkm('nama,pemilik,kategori\nA,B,C\n\nD,E,F\n,X,Y\nG,H,I');
    expect(hasil.rows.map((x) => x.baris)).toEqual([2, 4, 6]);
    expect(hasil.ditolak).toEqual([{ baris: 5, alasan: "Kolom 'nama' wajib diisi" }]);
    const body = bodyImporUmkm(hasil.rows, 'perbarui', true);
    expect(body.rows[0]).not.toHaveProperty('baris');
    expect(body).toMatchObject({ mode: 'perbarui', dryRun: true });
    const p = gabungPratinjau(hasil, {
      ditambah: 1,
      diperbarui: 0,
      dilewati: 0,
      galat: [{ baris: 3, alasan: 'x' }],
      totalGalat: 1,
      peringatan: [{ baris: 1, alasan: 'w' }],
      totalPeringatan: 1,
    });
    expect(p.galat).toEqual([{ baris: 5, alasan: "Kolom 'nama' wajib diisi" }, { baris: 6, alasan: 'x' }]);
    expect(p.totalGalat).toBe(2);
    expect(p.peringatan).toEqual([{ baris: 2, alasan: 'w' }]);
  });

  it('bolehImpor: butuh nol galat dan ≥1 baris ditambah/diperbarui', () => {
    const dasar = { ditambah: 0, diperbarui: 0, dilewati: 0, galat: [], totalGalat: 0, peringatan: [], totalPeringatan: 0 };
    expect(bolehImpor(null)).toBe(false);
    expect(bolehImpor(dasar)).toBe(false);
    expect(bolehImpor({ ...dasar, dilewati: 5 })).toBe(false);
    expect(bolehImpor({ ...dasar, ditambah: 1 })).toBe(true);
    expect(bolehImpor({ ...dasar, diperbarui: 1 })).toBe(true);
    expect(bolehImpor({ ...dasar, ditambah: 1, totalGalat: 1 })).toBe(false);
    expect(bolehImpor(pratinjauTanpaServer({ rows: [], ditolak: [{ baris: 2, alasan: 'x' }], galat: null }))).toBe(false);
  });
});
