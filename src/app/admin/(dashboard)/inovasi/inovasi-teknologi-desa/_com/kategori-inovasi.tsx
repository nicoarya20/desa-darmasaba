'use client';
import {
  INOVASI_KATEGORI,
  INOVASI_KATEGORI_DEFAULT,
  INOVASI_KATEGORI_LABEL,
  isInovasiKategori,
  type InovasiKategori,
} from '@/lib/inovasi-teknologi/kategori';
import { Select, Tabs } from '@mantine/core';
import type { KategoriFilterValue } from '../../../_state/inovasi/inovasi-teknologi-desa';

/** Basis URL admin Inovasi Teknologi Desa. */
export const ADMIN_INOVASI_TEKNOLOGI_HREF = '/admin/inovasi/inovasi-teknologi-desa';

const SEMUA = 'semua';

/** Opsi kategori untuk Select/Tabs (urutan = INOVASI_KATEGORI). */
export const KATEGORI_OPTIONS = INOVASI_KATEGORI.map((value) => ({ value, label: INOVASI_KATEGORI_LABEL[value] }));

/** Tab saringan daftar admin: Semua + satu tab per kategori. */
export function KategoriTabs({ value, onChange }: { value: KategoriFilterValue; onChange: (next: KategoriFilterValue) => void }) {
  return (
    <Tabs
      value={value || SEMUA}
      onChange={(next) => onChange(isInovasiKategori(next) ? next : '')}
      mb="md"
    >
      <Tabs.List>
        <Tabs.Tab value={SEMUA}>Semua</Tabs.Tab>
        {KATEGORI_OPTIONS.map((option) => (
          <Tabs.Tab key={option.value} value={option.value}>
            {option.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}

/** Field kategori pada form create/edit (wajib, tidak bisa dikosongkan). */
export function KategoriSelect({ value, onChange }: { value: InovasiKategori; onChange: (next: InovasiKategori) => void }) {
  return (
    <Select
      label="Kategori"
      data={KATEGORI_OPTIONS}
      value={value}
      onChange={(next) => onChange(isInovasiKategori(next) ? next : INOVASI_KATEGORI_DEFAULT)}
      allowDeselect={false}
      withAsterisk
      radius="md"
    />
  );
}
