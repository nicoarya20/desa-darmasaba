'use client';
import { useId, useState, type KeyboardEvent } from 'react';
import { normalizeRange, parseHargaInput } from './katalog-params.logic';
import { KATALOG_FILTER_TEXT as T } from './katalog-filter.text';
import s from './saring.module.css';

type Props = {
  min: number | null;
  max: number | null;
  onChange: (range: { min: number | null; max: number | null }) => void;
};

const RIBUAN = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
const show = (value: number | null) => (value === null ? '' : RIBUAN.format(value));

/**
 * Dua isian harga gaya Tokopedia ("Rp | Harga minimum"), hanya angka. Berlaku saat isian ditinggalkan atau Enter;
 * min > maks ditukar otomatis.
 */
export function SaringHarga({ min, max, onChange }: Props) {
  const id = useId();
  const [draft, setDraft] = useState({ min: show(min), max: show(max) });
  const [prev, setPrev] = useState({ min, max });

  // Nilai berubah dari luar (chip dihapus, "Hapus semua", tombol kembali): samakan isian.
  if (prev.min !== min || prev.max !== max) {
    setPrev({ min, max });
    setDraft({ min: show(min), max: show(max) });
  }

  const commit = () => {
    const range = normalizeRange(parseHargaInput(draft.min), parseHargaInput(draft.max));
    setDraft({ min: show(range.min), max: show(range.max) });
    if (range.min !== min || range.max !== max) onChange(range);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }
  };

  const field = (key: 'min' | 'max', label: string) => (
    <div className={s.priceField}>
      <span className={s.pricePrefix} aria-hidden>
        {T.hargaPrefix}
      </span>
      <input
        id={`${id}-${key}`}
        className={s.priceInput}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={label}
        aria-label={label}
        value={draft[key]}
        onChange={(event) => setDraft((d) => ({ ...d, [key]: event.target.value.replace(/[^\d.]/g, '') }))}
        onBlur={commit}
        onKeyDown={onKeyDown}
      />
    </div>
  );

  return (
    <div className={s.price}>
      {field('min', T.hargaMin)}
      {field('max', T.hargaMax)}
    </div>
  );
}
