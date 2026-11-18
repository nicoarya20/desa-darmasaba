// @vitest-environment node
// Kode grafik beranda diunduh lebih awal HANYA pada interaksi pertama pengunjung (gulir/sentuh/klik/tombol), supaya
// grafik sudah siap saat mendekati layar tanpa menambah beban JavaScript awal (Lighthouse tidak berinteraksi).
import { describe, expect, it, vi } from 'vitest';

import { INTERACTION_EVENTS, runOnFirstInteraction } from '@/app/(public)/_com/lazy-chart/prefetch-on-interaction';

describe('runOnFirstInteraction', () => {
  it('tidak menjalankan tugas sebelum ada interaksi', () => {
    const target = new EventTarget();
    const task = vi.fn();
    runOnFirstInteraction(task, target);
    expect(task).not.toHaveBeenCalled();
  });

  it.each(INTERACTION_EVENTS)('menjalankan tugas tepat sekali pada "%s"', (name) => {
    const target = new EventTarget();
    const task = vi.fn();
    runOnFirstInteraction(task, target);
    target.dispatchEvent(new Event(name));
    target.dispatchEvent(new Event(name));
    target.dispatchEvent(new Event('scroll'));
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('pembatal menghentikan tugas sebelum interaksi pertama', () => {
    const target = new EventTarget();
    const task = vi.fn();
    const cancel = runOnFirstInteraction(task, target);
    cancel();
    for (const name of INTERACTION_EVENTS) target.dispatchEvent(new Event(name));
    expect(task).not.toHaveBeenCalled();
  });

  it('peristiwa lain (mis. mousemove, resize) tidak memicu unduhan', () => {
    const target = new EventTarget();
    const task = vi.fn();
    runOnFirstInteraction(task, target);
    target.dispatchEvent(new Event('mousemove'));
    target.dispatchEvent(new Event('resize'));
    expect(task).not.toHaveBeenCalled();
  });
});
