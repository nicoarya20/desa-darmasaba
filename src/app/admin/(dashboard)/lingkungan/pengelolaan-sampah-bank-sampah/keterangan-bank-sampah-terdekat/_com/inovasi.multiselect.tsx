'use client'
import ApiFetch from '@/lib/api-fetch';
import { MAX_INOVASI_BANK_SAMPAH } from '@/lib/bank-sampah/bank-sampah.validation';
import { MultiSelect } from '@mantine/core';
import { useEffect, useState } from 'react';

type Opsi = { value: string; label: string };

// Program Inovasi desa jumlahnya puluhan; satu halaman 100 cukup untuk pilihan admin.
const BATAS_PILIHAN = 100;

type Props = { value: readonly string[]; onChange: (ids: string[]) => void };

/** Multi-select Program Inovasi yang dijalankan bank sampah/TPS (mis. inovasi TPS3R). */
export default function InovasiMultiSelect({ value, onChange }: Props) {
  const [opsi, setOpsi] = useState<Opsi[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aktif = true;
    ApiFetch.api.landingpage.programinovasi.findMany
      .get({ query: { page: 1, limit: BATAS_PILIHAN } })
      .then((res) => {
        if (!aktif) return;
        const data = res.status === 200 && res.data?.success ? (res.data.data ?? []) : null;
        if (!data) return setError('Gagal memuat daftar program inovasi');
        setOpsi(data.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name })));
      })
      .catch((err: unknown) => {
        if (aktif) setError(`Gagal memuat daftar program inovasi: ${err instanceof Error ? err.message : String(err)}`);
      });
    return () => {
      aktif = false;
    };
  }, []);

  return (
    <MultiSelect
      label="Inovasi di TPS"
      description="Pilih Program Inovasi yang dijalankan di sini; tampil di tab Profil dan bisa diklik warga."
      placeholder={value.length === 0 ? 'Pilih program inovasi' : undefined}
      data={opsi}
      value={[...value]}
      onChange={onChange}
      searchable
      clearable
      maxValues={MAX_INOVASI_BANK_SAMPAH}
      nothingFoundMessage="Program inovasi tidak ditemukan"
      error={error ?? undefined}
    />
  );
}
