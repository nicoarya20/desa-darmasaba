'use client';

import type { DinamikaInput } from '@/lib/dinamika-penduduk';
import { Center, Skeleton, Stack, Text } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import dinamikaPenduduk from '../../../_state/kependudukan/dinamika-penduduk';
import { DinamikaPendudukForm } from '../../_components/DinamikaPendudukForm';

const pick = ({ tahun, kelahiran, kematian, masuk, keluar }: DinamikaInput): DinamikaInput => ({
  tahun,
  kelahiran,
  kematian,
  masuk,
  keluar,
});

export default function EditDinamikaPenduduk() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const state = useProxy(dinamikaPenduduk);
  const [form, setForm] = useState<DinamikaInput | null>(null);
  const [original, setOriginal] = useState<DinamikaInput | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    dinamikaPenduduk.findUnique.load(id).then(() => {
      const data = dinamikaPenduduk.findUnique.data;
      if (data) {
        setForm(pick(data));
        setOriginal(pick(data));
      } else {
        setNotFound(true);
      }
    });
  }, [id]);

  if (notFound) {
    return (
      <Center py="xl">
        <Text c="dimmed">Data dinamika penduduk tidak ditemukan</Text>
      </Center>
    );
  }

  if (!form || !original) {
    return (
      <Stack py={10}>
        <Skeleton height={400} radius="md" />
      </Stack>
    );
  }

  const handleSubmit = async () => {
    const ok = await state.update.submit(id, form);
    if (ok) router.push('/admin/kependudukan/dinamika-penduduk');
  };

  return (
    <DinamikaPendudukForm
      title={`Edit Dinamika Penduduk ${original.tahun}`}
      value={form}
      onChange={(field, value) => setForm((prev) => (prev ? { ...prev, [field]: value } : prev))}
      onReset={() => setForm(original)}
      resetLabel="Batal"
      onSubmit={handleSubmit}
      loading={state.update.loading}
    />
  );
}
