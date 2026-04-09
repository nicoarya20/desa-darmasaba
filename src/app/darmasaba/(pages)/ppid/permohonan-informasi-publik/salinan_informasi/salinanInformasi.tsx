import statePermohonanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';
import { Skeleton, Group, Select } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import type { Prisma } from '@prisma/client';
import React from 'react';
import { useProxy } from 'valtio/utils';

function MemperolehSalinan({ onChange }: {
  onChange: (value: Prisma.CaraMemperolehSalinanInformasiGetPayload<{
    select: {
      id: true,
      name: true
    }
  }>) => void
}) {
  const memperolehSalinanInformasiState = useProxy(statePermohonanInformasi)
  useShallowEffect(() => {
    memperolehSalinanInformasiState.caraMemperolehSalinanInformasi.findMany.load()
  }, [])

  if (!memperolehSalinanInformasiState.caraMemperolehSalinanInformasi.findMany.data) return <Skeleton h={40} />

  const data = memperolehSalinanInformasiState.caraMemperolehSalinanInformasi.findMany.data
  if (!data) return <Skeleton h={40} />

  return (
    <Group>
      <Select
        placeholder='Pilih cara memperoleh salinan informasi'
        label={'Cara Memperoleh Salinan Informasi'}
        data={data.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        onChange={(v) => {
          const selectedData = data.find((item) => item.id === v);
          if (selectedData) onChange(selectedData);
        }}
      />
    </Group>
  );
}
export default MemperolehSalinan;
