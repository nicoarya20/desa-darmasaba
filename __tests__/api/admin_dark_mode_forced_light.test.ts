// @vitest-environment node
// Admin dipaksa terang: nilai dark mode tersimpan di localStorage diabaikan dan toggle tidak berefek.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'darmasaba-admin-dark-mode';

const loadStore = async (stored: string | null) => {
  const getItem = vi.fn((key: string) => (key === STORAGE_KEY ? stored : null));
  const setItem = vi.fn();
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', { getItem, setItem });
  vi.resetModules();
  const mod = await import('@/state/darkModeStore');
  return { ...mod, setItem };
};

describe('darkModeStore — admin dipaksa terang', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  it('konstanta penguncian bernilai false', async () => {
    const { DARK_MODE_ADMIN_AKTIF } = await loadStore(null);
    expect(DARK_MODE_ADMIN_AKTIF).toBe(false);
  });

  it("localStorage 'true' diabaikan saat inisialisasi", async () => {
    const { darkModeStore } = await loadStore('true');
    expect(darkModeStore.isDark).toBe(false);
  });

  it('toggle() dan setDarkMode(true) tidak mengubah state dan tidak menulis localStorage', async () => {
    const { darkModeStore, setItem } = await loadStore('true');
    darkModeStore.toggle();
    expect(darkModeStore.isDark).toBe(false);
    darkModeStore.setDarkMode(true);
    expect(darkModeStore.isDark).toBe(false);
    expect(setItem).not.toHaveBeenCalled();
  });

  it('useDarkMode tetap mengekspor API publik yang sama', async () => {
    const { useDarkMode } = await loadStore(null);
    expect(typeof useDarkMode).toBe('function');
    const { readFileSync } = await import('node:fs');
    const src = readFileSync('src/state/darkModeStore.ts', 'utf8');
    expect(src).toMatch(/isDark: snapshot\.isDark/);
    expect(src).toMatch(/toggle: \(\) =>/);
    expect(src).toMatch(/setDarkMode: \(value: boolean\) =>/);
  });
});
