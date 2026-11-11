'use client';
import { IconSearch } from "@tabler/icons-react";
import { useId } from "react";
import s from "./layanan.module.css";

type Props = { value: string; onChange: (next: string) => void; label: string; placeholder: string };

/** Kolom cari pil (gaya kolom cari Berita/Pengumuman); menyaring langsung saat mengetik. */
export function LayananSearch({ value, onChange, label, placeholder }: Props) {
  const inputId = useId();
  return (
    <form role="search" className={s.search} onSubmit={(event) => event.preventDefault()}>
      <label htmlFor={inputId} className={s.srOnly}>
        {label}
      </label>
      <IconSearch className={s.searchIcon} size={18} stroke={1.75} aria-hidden />
      <input
        id={inputId}
        type="search"
        className={s.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </form>
  );
}
