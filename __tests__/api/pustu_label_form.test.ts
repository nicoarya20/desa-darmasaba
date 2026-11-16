// @vitest-environment node
// Label PUSTU (sidebar admin, navbar publik, pencarian menu, sumber Jenna) dengan ID menu & URL tetap, serta
// logika form admin PUSTU (baris kosong diabaikan, validasi layanan unggulan & medsos sama dengan server).
import { describe, expect, it } from 'vitest';
import navbarListMenu from '@/con/navbar-list-menu';
import { flattenMenu } from '@/app/(public)/_com/searchMenu';
import { effectiveMenuVisibility } from '@/app/(public)/_com/menu-visibility.logic';
import { kesehatanMenu } from '@/app/admin/_com/nav/domains';
import { KNOWLEDGE_SOURCE_BY_KEY } from '@/lib/jenna/knowledge/sources';
import {
  FORM_PUSTU_KOSONG,
  cekFormPustu,
  formDariDetail,
  payloadDariForm,
  type PustuForm,
} from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.form';
import type { PustuDetail } from '@/lib/pustu/pustu.types';

const LABEL = 'PUSTU (Puskesmas Pembantu)';

describe('label menu PUSTU (sebelumnya "Puskesmas")', () => {
  it('sidebar admin: id kesehatan.puskesmas & path tetap, nama PUSTU', () => {
    const item = kesehatanMenu.children?.find((c) => c.id === 'kesehatan.puskesmas');
    expect(item).toEqual({ id: 'kesehatan.puskesmas', name: LABEL, path: '/admin/kesehatan/puskesmas', basePath: '/admin/kesehatan/puskesmas' });
  });

  it('navbar publik: menu 3.3 berlabel PUSTU, href /kesehatan/puskesmas tetap, tidak ada lagi label "Puskesmas"', () => {
    const kesehatan = navbarListMenu.find((m) => m.children?.some((c) => c.id === '3.3'));
    const item = kesehatan?.children?.find((c) => c.id === '3.3');
    expect(item).toMatchObject({ name: LABEL, href: '/kesehatan/puskesmas' });
    expect(kesehatan?.children?.map((c) => c.name)).not.toContain('Puskesmas');
  });

  it('pencarian menu (saat submenu ditampilkan) memakai label PUSTU', () => {
    const { searchMenus } = effectiveMenuVisibility({ '/kesehatan/puskesmas': true });
    const hasil = flattenMenu(searchMenus).find((i) => i.href === '/kesehatan/puskesmas');
    expect(hasil?.label).toBe(LABEL);
  });

  it('sumber Jenna: label PUSTU, jam dari `jadwal` & layanan unggulan, href detail tetap', () => {
    const src = KNOWLEDGE_SOURCE_BY_KEY.get('puskesmas');
    expect(src?.label).toBe(LABEL);
    expect(src?.select).toMatchObject({ jam: { select: { jadwal: true } }, layananUnggulan: true });
    // test-only: baris rekaan.
    const teks = src?.toText({
      id: 'pu1',
      name: 'PUSTU Contoh',
      alamat: 'Jl. Contoh',
      jam: { jadwal: [{ hari: 'Senin – Kamis', jam: '08.00 – 14.00' }] },
      layananUnggulan: [{ judul: 'Imunisasi' }],
      tarifUmum: '<p>Rp 10.000</p>',
      kontak: { kontakUGD: '112' },
    });
    expect(teks).toContain('Senin – Kamis 08.00 – 14.00');
    expect(teks).toContain('Imunisasi');
    expect(teks).toContain('Rp 10.000');
    expect(src?.href({ id: 'pu1' })).toBe('/kesehatan/puskesmas/pu1');
  });
});

// test-only: data rekaan.
const isi: PustuForm = {
  ...FORM_PUSTU_KOSONG,
  name: 'PUSTU Contoh',
  alamat: 'Jl. Contoh No. 1',
  jadwal: [{ hari: 'Senin – Kamis', jam: ' 08.00 – 14.00 ' }, { hari: ' ', jam: '' }],
  layananUnggulan: [{ judul: 'Imunisasi', deskripsi: '' }, { judul: '', deskripsi: '' }],
  mediaSosial: [{ platform: 'instagram', url: ' ' }, { platform: 'facebook', url: ' https://facebook.com/pustu ' }],
};

describe('form admin PUSTU', () => {
  it('payload membuang baris kosong & merapikan spasi', () => {
    const body = payloadDariForm(isi, { imageId: null, baganId: 'bagan1' });
    expect(body.jadwal).toEqual([{ hari: 'Senin – Kamis', jam: '08.00 – 14.00' }]);
    expect(body.layananUnggulan).toEqual([{ judul: 'Imunisasi', deskripsi: '' }]);
    expect(body.mediaSosial).toEqual([{ platform: 'facebook', url: 'https://facebook.com/pustu' }]);
    expect(body.fotoBaganStrukturId).toBe('bagan1');
    expect(cekFormPustu(isi)).toBeNull();
  });

  it('validasi sama dengan server: layanan berdeskripsi tanpa judul, medsos bukan URL, nama kosong', () => {
    expect(cekFormPustu({ ...isi, layananUnggulan: [{ judul: '', deskripsi: 'Tanpa judul' }] })).toBe('Judul layanan wajib diisi');
    expect(cekFormPustu({ ...isi, mediaSosial: [{ platform: 'facebook', url: 'pustu_contoh' }] })).toBe('URL harus diawali http:// atau https://');
    expect(cekFormPustu({ ...isi, name: ' ' })).toBe('Nama PUSTU wajib diisi');
    expect(cekFormPustu({ ...isi, email: 'salah' })).toBe('Format email tidak valid');
  });

  it('form edit diisi dari detail (null → string kosong, link gambar tersimpan)', () => {
    const detail = {
      id: 'pu1', name: 'PUSTU Contoh', alamat: 'Jl. Contoh', imageId: 'img1', image: { id: 'img1', link: '/api/img/a.jpg' },
      jadwal: [{ hari: 'Jumat – Sabtu', jam: '08.00 – 12.00' }], kontak: { kontakPuskesmas: null, email: null, kontakUGD: '112' },
      mediaSosial: [], layananUnggulan: [{ judul: 'KIA', deskripsi: null }], linkPetunjukArah: null,
      prosedurPendaftaran: '<p>Daftar</p>', tarifBpjs: null, tarifUmum: null, fotoBaganStrukturId: null, fotoBaganStruktur: null,
      pengurus: [], fotoKegiatan: [],
    } satisfies PustuDetail;
    expect(formDariDetail(detail)).toMatchObject({
      imageLink: '/api/img/a.jpg',
      kontakUGD: '112',
      email: '',
      layananUnggulan: [{ judul: 'KIA', deskripsi: '' }],
      prosedurPendaftaran: '<p>Daftar</p>',
      tarifBpjs: '',
      linkMaps: '',
    });
  });
});
