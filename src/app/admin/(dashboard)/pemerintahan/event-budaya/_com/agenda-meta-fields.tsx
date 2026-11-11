'use client';
import { KATEGORI_EVENT_OPTIONS } from '@/lib/agenda-desa';
import { Select, TextInput } from '@mantine/core';

type AgendaMetaForm = { kategori: string; tanggal: string; tanggalSelesai: string };

/** Field Kategori, Tanggal, dan Tanggal Selesai (opsional) form agenda; `form` adalah proxy Valtio. */
export function AgendaMetaFields({ form }: { form: AgendaMetaForm }) {
  return (
    <>
      <Select
        label="Kategori"
        required
        allowDeselect={false}
        data={KATEGORI_EVENT_OPTIONS}
        value={form.kategori}
        onChange={(value) => {
          if (value) form.kategori = value;
        }}
      />
      <TextInput
        label="Tanggal"
        type="date"
        required
        value={form.tanggal}
        onChange={(e) => (form.tanggal = e.currentTarget.value)}
      />
      <TextInput
        label="Tanggal Selesai"
        description="Opsional, isi untuk acara beberapa hari"
        type="date"
        min={form.tanggal || undefined}
        value={form.tanggalSelesai}
        onChange={(e) => (form.tanggalSelesai = e.currentTarget.value)}
      />
    </>
  );
}
