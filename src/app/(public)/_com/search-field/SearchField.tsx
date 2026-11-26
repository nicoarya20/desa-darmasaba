'use client';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useId, useRef, type FormEvent } from 'react';
import s from './search-field.module.css';
import { SEARCH_FIELD_TEXT as T } from './search-field.text';

type Props = {
  value: string;
  onChange: (next: string) => void;
  /** Label pembaca layar (tidak tampil). */
  label: string;
  placeholder: string;
  /** Enter ditekan (form tidak pernah dikirim ke server). */
  onSubmit?: (value: string) => void;
  /** Tombol "x" ditekan, setelah `onChange('')`; mis. kirim pencarian kosong tanpa menunggu jeda ketik. */
  onClear?: () => void;
  /**
   * `true` → selebar wadahnya (pengganti TextInput Mantine di kolom/grid). Bawaan: pil 320px yang menyusut di baris
   * kepala daftar dan selebar layar di ponsel.
   */
  fullWidth?: boolean;
};

/** Kolom cari pil bersama halaman daftar publik: ikon kaca pembesar, label sr-only, dan tombol "x" sendiri. */
export function SearchField({ value, onChange, label, placeholder, onSubmit, onClear, fullWidth = false }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  const clear = () => {
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <form role="search" className={fullWidth ? `${s.root} ${s.fullWidth}` : s.root} onSubmit={submit}>
      <label htmlFor={inputId} className={s.srOnly}>
        {label}
      </label>
      <IconSearch className={s.icon} size={18} stroke={1.75} aria-hidden />
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        className={s.input}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
      {value ? (
        <button type="button" className={s.clear} aria-label={T.clear} onClick={clear}>
          <IconX size={16} stroke={2} aria-hidden />
        </button>
      ) : null}
    </form>
  );
}
