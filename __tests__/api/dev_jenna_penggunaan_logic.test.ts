// @vitest-environment node
// Logika murni halaman Developer › Jenna › Penggunaan: format waktu respons, bar tool, label slot provider.
import { describe, expect, it } from 'vitest';
import { formatLatency } from '@/app/dev/_com/format';
import { providerLabel, slotLabel } from '@/app/dev/jenna/_com/protocol';
import { toolBars } from '@/app/dev/jenna/penggunaan/penggunaan.logic';

describe('formatLatency', () => {
  it('null → tanda pisah', () => {
    expect(formatLatency(null)).toBe('—');
  });

  it('satu detik ke atas → detik dengan satu desimal dan koma Indonesia', () => {
    expect(formatLatency(1800)).toBe('1,8 dtk');
    expect(formatLatency(1000)).toBe('1,0 dtk');
    expect(formatLatency(1849)).toBe('1,8 dtk');
    expect(formatLatency(1851)).toBe('1,9 dtk');
    expect(formatLatency(60_000)).toBe('60,0 dtk');
  });

  it('ribuan detik memakai pemisah titik', () => {
    expect(formatLatency(1_234_560)).toBe('1.234,6 dtk');
  });

  it('di bawah satu detik tetap milidetik, bukan "0,x dtk"', () => {
    expect(formatLatency(850)).toBe('850 ms');
    expect(formatLatency(999)).toBe('999 ms');
    expect(formatLatency(0)).toBe('0 ms');
  });
});

describe('toolBars', () => {
  it('tool terbanyak 100%, sisanya sebanding', () => {
    expect(
      toolBars([
        { name: 'cari_konten', count: 40 },
        { name: 'ambil_berita', count: 10 },
        { name: 'ambil_apbdes', count: 4 },
      ]),
    ).toEqual([
      { name: 'cari_konten', count: 40, percent: 100 },
      { name: 'ambil_berita', count: 10, percent: 25 },
      { name: 'ambil_apbdes', count: 4, percent: 10 },
    ]);
  });

  it('acuan adalah jumlah terbesar, apa pun urutan masukannya', () => {
    expect(toolBars([{ name: 'a', count: 1 }, { name: 'b', count: 4 }]).map((b) => b.percent)).toEqual([25, 100]);
  });

  it('satu tool → 100%; jumlah sama → sama-sama 100%', () => {
    expect(toolBars([{ name: 'a', count: 3 }])[0].percent).toBe(100);
    expect(toolBars([{ name: 'a', count: 3 }, { name: 'b', count: 3 }]).map((b) => b.percent)).toEqual([100, 100]);
  });

  it('daftar kosong → kosong; semua nol → 0% tanpa pembagian nol', () => {
    expect(toolBars([])).toEqual([]);
    expect(toolBars([{ name: 'a', count: 0 }])).toEqual([{ name: 'a', count: 0, percent: 0 }]);
  });

  it('tidak mengubah masukan', () => {
    const input = [{ name: 'a', count: 2 }];
    toolBars(input);
    expect(input).toEqual([{ name: 'a', count: 2 }]);
  });
});

describe('slotLabel', () => {
  it('slot yang dikenal → label protokol yang dipakai di halaman Provider', () => {
    expect(slotLabel('chat_openai')).toBe('OpenAI-compatible');
    expect(slotLabel('chat_anthropic')).toBe('Anthropic');
  });

  it('slot yang tidak dikenal (baris lama) tampil apa adanya', () => {
    expect(slotLabel('chat_lama')).toBe('chat_lama');
    expect(slotLabel('constructor')).toBe('constructor');
  });
});

describe('providerLabel', () => {
  it('slot + model', () => {
    expect(providerLabel('chat_anthropic', 'model-a')).toBe('Anthropic · model-a');
  });

  it('salah satu kosong → yang ada saja; keduanya kosong → tanda pisah', () => {
    expect(providerLabel('chat_openai', null)).toBe('OpenAI-compatible');
    expect(providerLabel(null, 'model-a')).toBe('model-a');
    expect(providerLabel(null, null)).toBe('—');
  });
});
