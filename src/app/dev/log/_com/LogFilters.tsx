'use client';
import { Button, Group, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconCalendar, IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import type { DateRange } from '../log.logic';

type Props = {
  /** Filter khusus halaman (pilihan aksi / hasil), tampil paling kiri. */
  children: React.ReactNode;
  q: string;
  searchPlaceholder: string;
  onSearch: (q: string) => void;
  range: Readonly<DateRange>;
  onRange: (range: DateRange) => void;
  hasFilters: boolean;
  onReset: () => void;
};

const SEARCH_MAX = 100;

/** Baris filter bersama Log Audit & Log Login: cari (tertunda 400 ms) dan rentang tanggal. */
export function LogFilters({ children, q, searchPlaceholder, onSearch, range, onRange, hasFilters, onReset }: Props) {
  const [search, setSearch] = useState({ committed: q, value: q });
  const [draft, setDraft] = useState({ committed: range, value: range as DateRange });
  // Sinkron bila state luar berubah (mis. "Hapus filter").
  if (search.committed !== q) setSearch({ committed: q, value: q });
  if (draft.committed !== range) setDraft({ committed: range, value: [...range] });

  const debouncedSearch = useDebouncedCallback((value: string) => onSearch(value), 400);

  return (
    <Group gap="sm" align="flex-end" wrap="wrap">
      {children}
      <TextInput
        label="Cari"
        placeholder={searchPlaceholder}
        leftSection={<IconSearch size={16} />}
        value={search.value}
        maxLength={SEARCH_MAX}
        onChange={(e) => {
          const value = e.currentTarget.value;
          setSearch((s) => ({ ...s, value }));
          debouncedSearch(value);
        }}
        style={{ flex: '1 1 220px' }}
      />
      <DatePickerInput
        type="range"
        label="Rentang tanggal"
        placeholder="Semua tanggal"
        leftSection={<IconCalendar size={16} />}
        valueFormat="D MMM YYYY"
        clearable
        allowSingleDateInRange
        maxDate={new Date()}
        value={draft.value}
        onChange={(value) => {
          setDraft((d) => ({ ...d, value }));
          // Tunggu sampai tanggal akhir dipilih (atau dikosongkan) sebelum memuat.
          if ((value[0] === null) === (value[1] === null)) onRange(value);
        }}
        style={{ flex: '1 1 220px' }}
      />
      {hasFilters && (
        <Button
          variant="subtle"
          leftSection={<IconX size={14} />}
          onClick={() => {
            debouncedSearch.cancel();
            onReset();
          }}
        >
          Hapus filter
        </Button>
      )}
    </Group>
  );
}
