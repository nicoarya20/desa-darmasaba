// @vitest-environment node
// Performa beranda (PageSpeed mobile LCP 6,6 s): section di bawah hero baru fetch saat mendekati layar, supaya foto
// Perbekel (LCP) tidak berebut jaringan dengan ±15 fetch section yang dulu dilepas serentak saat mount.
// Diuji: (1) useNearViewport (gerbang IntersectionObserver), (2) tiap hook data section tidak fetch selama `enabled`
// false dan fetch sekali saat menyala, (3) penjaga sumber: section beranda memakai gerbangnya.
// jsdom rusak → hook dipasang lewat helpers/node-react-root (react-dom/client di node) dan renderToStaticMarkup.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installMinimalDom, mount, run } from '../helpers/node-react-root';

const mocks = vi.hoisted(() => ({
  berita: vi.fn(),
  pengumuman: vi.fn(),
  prestasi: vi.fn(),
  apbdesLoad: vi.fn(),
  korupsiLoad: vi.fn(),
  kepuasanLoad: vi.fn(),
}));

vi.mock('@/app/(public)/_com/main-page/kabar-desa/kabar.source', () => ({
  loadBeritaTerbaru: mocks.berita,
  loadPengumumanTerbaru: mocks.pengumuman,
}));
vi.mock('@/app/(public)/_com/main-page/prestasi/prestasi.source', () => ({ loadPrestasiPage: mocks.prestasi }));
vi.mock('@/app/admin/(dashboard)/_state/landing-page/apbdes', async () => {
  const { proxy } = await import('valtio');
  return { default: proxy({ findMany: { data: null, load: mocks.apbdesLoad } }) };
});
vi.mock('@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi', async () => {
  const { proxy } = await import('valtio');
  return { default: proxy({ desaAntikorupsi: { findMany: { data: [], load: mocks.korupsiLoad } } }) };
});
vi.mock('@/app/(public)/_com/main-page/kepuasan/kepuasan.source', async () => {
  const { proxy } = await import('valtio');
  return { kepuasanPublik: proxy({ data: null, total: 0, loading: false }), muatKepuasanPublik: mocks.kepuasanLoad };
});

import { FETCH_ROOT_MARGIN, useNearViewport } from '@/app/(public)/_com/lazy-load/use-near-viewport';
import { useApbdesData } from '@/app/(public)/_com/main-page/apbdes/use-apbdes-data';
import { useAntiKorupsiData } from '@/app/(public)/_com/main-page/desaantikorupsi/use-antikorupsi-data';
import { useKabarData } from '@/app/(public)/_com/main-page/kabar-desa/use-kabar-data';
import { useKepuasanData } from '@/app/(public)/_com/main-page/kepuasan/use-kepuasan-data';
import { usePrestasiData } from '@/app/(public)/_com/main-page/prestasi/use-prestasi-data';
import { useSdgsData } from '@/app/(public)/_com/main-page/sdgs/use-sdgs-data';

/** IntersectionObserver tiruan: test memicu persilangan secara manual. test-only */
class FakeObserver {
  static instances: FakeObserver[] = [];
  targets: unknown[] = [];
  disconnected = false;
  constructor(
    private readonly callback: (entries: { isIntersecting: boolean }[]) => void,
    readonly options: { rootMargin?: string },
  ) {
    FakeObserver.instances.push(this);
  }
  observe(el: unknown) {
    this.targets.push(el);
  }
  disconnect() {
    this.disconnected = true;
  }
  cross(isIntersecting: boolean) {
    this.callback([{ isIntersecting }]);
  }
}

const FAKE_EL = { nodeType: 1 } as unknown as Element; // test-only: elemen yang "diamati"
let near: boolean | null = null;
function NearProbe({ margin }: { margin?: string }) {
  const [ref, value] = useNearViewport<Element>(margin);
  ref.current = FAKE_EL; // komponen uji me-render null, jadi ref diisi manual sebelum efek membacanya
  near = value;
  return null;
}

beforeEach(() => {
  FakeObserver.instances = [];
  near = null;
  installMinimalDom();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('useNearViewport', () => {
  it('render server: selalu false (markup SSR = hidrasi)', () => {
    renderToStaticMarkup(<NearProbe />);
    expect(near).toBe(false);
  });

  it('false sampai elemen bersilangan dengan jarak yang diminta, lalu true dan pengamat dilepas', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    await mount(<NearProbe margin={FETCH_ROOT_MARGIN} />);
    expect(near).toBe(false);
    expect(FakeObserver.instances).toHaveLength(1);
    const [observer] = FakeObserver.instances;
    expect(observer.options.rootMargin).toBe(FETCH_ROOT_MARGIN);
    expect(observer.targets).toEqual([FAKE_EL]);

    await run(() => observer.cross(false));
    expect(near).toBe(false);
    await run(() => observer.cross(true));
    expect(near).toBe(true);
    expect(observer.disconnected).toBe(true);
    expect(FakeObserver.instances).toHaveLength(1); // tetap true, tidak mengamati ulang
  });

  it('browser tanpa IntersectionObserver: langsung dianggap dekat (data tetap dimuat, bukan tidak pernah)', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    await mount(<NearProbe margin={FETCH_ROOT_MARGIN} />);
    expect(near).toBe(true);
  });

  it('jarak fetch minimal dua tinggi layar: kerangka Anti Korupsi/SDGs ponsel tak setinggi isi, data harus tiba di luar layar', () => {
    const percent = Number(FETCH_ROOT_MARGIN.match(/^(\d+)% 0px$/)?.[1]);
    expect(percent).toBeGreaterThanOrEqual(200);
  });
});

/** Pasang `useHook(enabled)` mati dulu, lalu nyalakan; kembalikan hasil render terakhir. */
async function gate<T>(useHook: (enabled: boolean) => T) {
  const box: { value: T | null } = { value: null };
  function Probe({ enabled }: { enabled: boolean }) {
    box.value = useHook(enabled);
    return null;
  }
  const view = await mount(<Probe enabled={false} />);
  return { box, enable: () => view.rerender(<Probe enabled />) };
}

describe('hook data section: tidak fetch sebelum dekat layar', () => {
  it('Kabar Desa: berita & pengumuman baru dimuat saat enabled, kerangka (loading) sebelumnya', async () => {
    mocks.berita.mockResolvedValue([]);
    mocks.pengumuman.mockResolvedValue([]);
    const { box, enable } = await gate(useKabarData);
    expect(mocks.berita).not.toHaveBeenCalled();
    expect(mocks.pengumuman).not.toHaveBeenCalled();
    expect(box.value?.loading).toBe(true);
    await enable();
    expect(mocks.berita).toHaveBeenCalledTimes(1);
    expect(mocks.pengumuman).toHaveBeenCalledTimes(1);
    expect(box.value?.loading).toBe(false);
  });

  it('SDGs: fetch findMany baru jalan saat enabled', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ success: true, data: [] }) }));
    vi.stubGlobal('fetch', fetchMock);
    const { box, enable } = await gate(useSdgsData);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(box.value?.loading).toBe(true);
    await enable();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('Prestasi: loadPrestasiPage baru jalan saat enabled; loading tetap true sebelumnya', async () => {
    mocks.prestasi.mockResolvedValue({ items: [], total: 0 });
    const { box, enable } = await gate((enabled) => usePrestasiData({ page: 1, pageSize: 4, enabled }));
    expect(mocks.prestasi).not.toHaveBeenCalled();
    expect(box.value?.loading).toBe(true);
    await enable();
    expect(mocks.prestasi).toHaveBeenCalledTimes(1);
    expect(box.value?.loading).toBe(false);
  });

  it('APBDes: state.findMany.load() baru dipanggil saat enabled', async () => {
    mocks.apbdesLoad.mockResolvedValue(undefined);
    const { enable } = await gate(useApbdesData);
    expect(mocks.apbdesLoad).not.toHaveBeenCalled();
    await enable();
    expect(mocks.apbdesLoad).toHaveBeenCalledTimes(1);
  });

  it('Anti Korupsi: load() baru dipanggil saat enabled; loading true sampai muat pertama selesai', async () => {
    mocks.korupsiLoad.mockResolvedValue(undefined);
    const { box, enable } = await gate(useAntiKorupsiData);
    expect(mocks.korupsiLoad).not.toHaveBeenCalled();
    expect(box.value?.loading).toBe(true);
    await enable();
    expect(mocks.korupsiLoad).toHaveBeenCalledTimes(1);
    expect(box.value?.loading).toBe(false);
  });

  it('Kepuasan: ringkasan responden baru dimuat saat enabled', async () => {
    mocks.kepuasanLoad.mockResolvedValue(undefined);
    const { enable } = await gate(useKepuasanData);
    expect(mocks.kepuasanLoad).not.toHaveBeenCalled();
    await enable();
    expect(mocks.kepuasanLoad).toHaveBeenCalledTimes(1);
  });

  it('bawaan enabled = true untuk halaman detail (APBDes, IKM, daftar Prestasi): muat saat mount seperti dulu', async () => {
    mocks.apbdesLoad.mockResolvedValue(undefined);
    mocks.kepuasanLoad.mockResolvedValue(undefined);
    mocks.prestasi.mockResolvedValue({ items: [], total: 0 });
    function DetailProbe() {
      useApbdesData();
      useKepuasanData();
      usePrestasiData({ page: 1, pageSize: 12 });
      return null;
    }
    await mount(<DetailProbe />);
    expect(mocks.apbdesLoad).toHaveBeenCalledTimes(1);
    expect(mocks.kepuasanLoad).toHaveBeenCalledTimes(1);
    expect(mocks.prestasi).toHaveBeenCalledTimes(1);
  });
});

describe('penjaga: section beranda memakai gerbang fetch', () => {
  const MAIN = join(process.cwd(), 'src/app/(public)/_com/main-page');
  const read = (rel: string) => readFileSync(join(MAIN, rel), 'utf8');

  it.each([
    ['kabar-desa/index.tsx', 'useKabarData(near)'],
    ['apbdes/index.tsx', 'useApbdesData(near)'],
    ['prestasi/index.tsx', 'enabled: near'],
    ['desaantikorupsi/index.tsx', 'useAntiKorupsiData(near)'],
    ['sdgs/index.tsx', 'useSdgsData(near)'],
    ['kepuasan/index.tsx', 'useKepuasanData(near)'],
  ])('%s: pengamat FETCH_ROOT_MARGIN di <section> dan hook data menunggu `near`', (rel, call) => {
    const src = read(rel);
    expect(src).toMatch(/useNearViewport<HTMLElement>\(FETCH_ROOT_MARGIN\)/);
    expect(src).toMatch(/<section ref=\{sectionRef\}/);
    expect(src).toContain(call);
  });

  it('Layanan & Potensi: load() di efek yang menunggu pengamat data', () => {
    const src = read('layanan-potensi/index.tsx');
    expect(src).toMatch(/useNearViewport<HTMLHeadingElement>\(FETCH_ROOT_MARGIN\)/);
    expect(src).toMatch(/if \(!dataNear\) return;[\s\S]*findMany\.load\(\);[\s\S]*\}, \[dataNear\]\);/);
  });

  it('Kepuasan: modal form (3 fetch opsi saat dipasang) baru dipasang setelah section dekat', () => {
    expect(read('kepuasan/index.tsx')).toMatch(/near \? <RespondenFormModal/);
  });
});
