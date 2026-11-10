import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import s from './struktur-header.module.css';
import { STRUKTUR_TEXT } from './struktur.text';

type Props = { search: string; onSearch: (value: string) => void };

/** Kepala halaman Struktur PPID: judul + pengantar rata kiri, kotak cari di kanan (mobile di bawah). */
export function StrukturHeader({ search, onSearch }: Props) {
  return (
    <header className={s.header}>
      <div className={s.intro}>
        <h1 className={s.title}>{STRUKTUR_TEXT.title}</h1>
        <p className={s.lead}>{STRUKTUR_TEXT.lead}</p>
      </div>
      <TextInput
        className={s.search}
        type="search"
        radius="xl"
        size="md"
        aria-label={STRUKTUR_TEXT.searchLabel}
        placeholder={STRUKTUR_TEXT.searchPlaceholder}
        leftSection={<IconSearch size={18} aria-hidden />}
        value={search}
        onChange={(event) => onSearch(event.currentTarget.value)}
      />
    </header>
  );
}
