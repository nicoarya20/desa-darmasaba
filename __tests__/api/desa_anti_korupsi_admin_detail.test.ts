// @vitest-environment node
// Detail admin DAK: helper tampilan (cari/urut per folder, label sampah) + klien API tempat sampah.
import { describe, expect, it, vi } from 'vitest';
import {
  DETAIL_SORT_OPTIONS,
  detailGroups,
  formatTanggalId,
  labelFolderAsal,
  labelSisaHari,
  pesanPulihkan,
  toDetailSortValue,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/detail-view';
import {
  hapusPermanenSampah,
  muatSampah,
  pulihkanSampah,
} from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_lib/sampah-api';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';

const dok = (id: string, judul: string, urutan: number, size: number | null, createdAt: string, realName = `${id}.pdf`): DokumenDesaAntiKorupsiView => ({
  id,
  judul,
  urutan,
  fileId: `f-${id}`,
  createdAt,
  file: { id: `f-${id}`, link: `/x/${id}`, realName, mimeType: 'application/pdf', size },
});

const groups: FolderGroupView[] = [
  {
    key: 'fa',
    nama: 'Laporan',
    dokumen: [
      dok('a1', 'Laporan 2024', 0, 2048, '2026-01-10T10:00:00.000Z'),
      dok('a2', 'Anggaran', 1, null, '2026-03-10T10:00:00.000Z', 'apbdes-final.pdf'),
      dok('a3', 'Rekap', 2, 9000, '2026-02-10T10:00:00.000Z'),
    ],
  },
  { key: 'fb', nama: 'Kosong', dokumen: [] },
  { key: 'umum', nama: 'Umum', dokumen: [dok('u1', 'Pengumuman Laporan', 0, 10, '2026-04-01T10:00:00.000Z')] },
];

const ids = (r: ReturnType<typeof detailGroups>) => r.groups.map((g) => [g.key, g.dokumen.map((d) => d.id)]);

describe('detailGroups', () => {
  it('tanpa kata kunci: semua folder tampil (termasuk kosong) dengan urutan asli', () => {
    const r = detailGroups(groups, '  ', 'urutan');
    expect(r.searching).toBe(false);
    expect(r.total).toBe(4);
    expect(ids(r)).toEqual([['fa', ['a1', 'a2', 'a3']], ['fb', []], ['umum', ['u1']]]);
  });

  it('mencari lintas folder (judul & nama file) dan menyembunyikan folder tanpa hasil', () => {
    const r = detailGroups(groups, 'laporan', 'urutan');
    expect(r.searching).toBe(true);
    expect(r.total).toBe(2);
    expect(ids(r)).toEqual([['fa', ['a1']], ['umum', ['u1']]]);
    expect(ids(detailGroups(groups, 'APBDES', 'urutan'))).toEqual([['fa', ['a2']]]);
    expect(detailGroups(groups, 'tidak-ada', 'urutan')).toEqual({ groups: [], total: 0, searching: true });
  });

  it('mengurutkan per folder sesuai pilihan; ukuran null selalu di akhir', () => {
    expect(ids(detailGroups(groups, '', 'judul-asc'))[0]).toEqual(['fa', ['a2', 'a1', 'a3']]);
    expect(ids(detailGroups(groups, '', 'judul-desc'))[0]).toEqual(['fa', ['a3', 'a1', 'a2']]);
    expect(ids(detailGroups(groups, '', 'tanggal-desc'))[0]).toEqual(['fa', ['a2', 'a3', 'a1']]);
    expect(ids(detailGroups(groups, '', 'tanggal-asc'))[0]).toEqual(['fa', ['a1', 'a3', 'a2']]);
    expect(ids(detailGroups(groups, '', 'ukuran-desc'))[0]).toEqual(['fa', ['a3', 'a1', 'a2']]);
    expect(ids(detailGroups(groups, '', 'ukuran-asc'))[0]).toEqual(['fa', ['a1', 'a3', 'a2']]);
  });

  it('tidak mengubah array input (hanya tampilan)', () => {
    detailGroups(groups, '', 'judul-desc');
    expect(groups[0].dokumen.map((d) => d.id)).toEqual(['a1', 'a2', 'a3']);
  });

  it('pilihan urut lengkap dan nilai tak dikenal kembali ke urutan asli', () => {
    expect(DETAIL_SORT_OPTIONS.map((o) => o.label)).toEqual([
      'Urutan asli', 'Judul A–Z', 'Judul Z–A', 'Terbaru', 'Terlama', 'Tipe', 'Ukuran terbesar', 'Ukuran terkecil',
    ]);
    expect(toDetailSortValue(null)).toBe('urutan');
    expect(toDetailSortValue('ukuran-asc')).toBe('ukuran-asc');
    expect(toDetailSortValue('acak')).toBe('urutan');
  });
});

describe('label tampilan', () => {
  it('formatTanggalId: tanggal id-ID, "—" bila kosong/rusak', () => {
    expect(formatTanggalId('2026-11-09T10:00:00.000Z')).toMatch(/^9 Nov 2026$/);
    expect(formatTanggalId(undefined)).toBe('—');
    expect(formatTanggalId('bukan-tanggal')).toBe('—');
  });

  it('labelSisaHari', () => {
    expect(labelSisaHari(12)).toBe('dihapus permanen dalam 12 hari');
    expect(labelSisaHari(1)).toBe('dihapus permanen dalam 1 hari');
    expect(labelSisaHari(0)).toBe('dihapus permanen hari ini');
  });

  it('labelFolderAsal: Umum, folder aktif, atau folder sudah dihapus', () => {
    const folders = [{ id: 'fa', nama: 'Laporan Baru' }];
    expect(labelFolderAsal({ folderId: null, folderNama: null }, folders)).toBe('Umum');
    expect(labelFolderAsal({ folderId: 'fa', folderNama: 'Laporan Lama' }, folders)).toBe('Laporan Baru');
    expect(labelFolderAsal({ folderId: 'fx', folderNama: 'Arsip' }, folders)).toBe('Arsip (folder sudah dihapus)');
    expect(labelFolderAsal({ folderId: 'fx', folderNama: null }, folders)).toBe('folder sudah dihapus');
  });

  it('pesanPulihkan menyebut folder tujuan', () => {
    const folders = [{ id: 'fa', nama: 'Laporan' }];
    expect(pesanPulihkan('fa', folders)).toBe('Dokumen dipulihkan ke folder "Laporan"');
    expect(pesanPulihkan(null, folders)).toBe('Dokumen dipulihkan ke folder "Umum"');
  });
});

const jsonRes = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Tipe `fetch` Bun punya properti tambahan (preconnect), jadi mock fungsi biasa perlu di-cast.
const asFetch = (mock: ReturnType<typeof vi.fn>) => mock as unknown as typeof fetch;

describe('sampah-api', () => {
  it('muatSampah: GET /:id/sampah dan mengembalikan data', async () => {
    const item = { id: 'd1', judul: 'A', folderId: null, folderNama: null, file: {}, deletedAt: '2026-11-01T00:00:00.000Z', sisaHari: 22 };
    const fetchImpl = vi.fn(async () => jsonRes(200, { success: true, data: [item] }));
    const res = await muatSampah('p 1', { fetchImpl: asFetch(fetchImpl) });
    expect(fetchImpl).toHaveBeenCalledWith('/api/landingpage/desaantikorupsi/p%201/sampah', { method: 'GET' });
    expect(res).toEqual({ ok: true, data: [item] });
  });

  it('pulihkanSampah: POST /sampah/:id/pulihkan; 409 meneruskan pesan server', async () => {
    const ok = vi.fn(async () => jsonRes(200, { success: true, data: { id: 'd1', folderId: 'fa' } }));
    expect(await pulihkanSampah('d1', { fetchImpl: asFetch(ok) })).toEqual({ ok: true, data: { id: 'd1', folderId: 'fa' } });
    expect(ok).toHaveBeenCalledWith('/api/landingpage/desaantikorupsi/sampah/d1/pulihkan', { method: 'POST' });

    const conflict = vi.fn(async () => jsonRes(409, { success: false, message: 'Berkas yang sama sudah ada di folder asal' }));
    expect(await pulihkanSampah('d1', { fetchImpl: asFetch(conflict) })).toEqual({
      ok: false,
      status: 409,
      message: 'Berkas yang sama sudah ada di folder asal',
    });
  });

  it('hapusPermanenSampah: DELETE /sampah/:id; body bukan JSON → pesan bawaan', async () => {
    const fetchImpl = vi.fn(async () => new Response('<html>502</html>', { status: 502 }));
    const res = await hapusPermanenSampah('d1', { fetchImpl: asFetch(fetchImpl) });
    expect(fetchImpl).toHaveBeenCalledWith('/api/landingpage/desaantikorupsi/sampah/d1', { method: 'DELETE' });
    expect(res).toEqual({ ok: false, status: 502, message: 'Gagal menghapus dokumen secara permanen' });
  });

  it('gagal jaringan → status 0 + pesan koneksi', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    const res = await muatSampah('p1', { fetchImpl: asFetch(fetchImpl) });
    expect(res).toMatchObject({ ok: false, status: 0 });
    expect(res.ok ? '' : res.message).toContain('Tidak dapat terhubung');
  });
});
