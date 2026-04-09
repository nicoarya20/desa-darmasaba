import statePermohonanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';
import { Group, Select, Skeleton } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import type { Prisma } from '@prisma/client';
import React from 'react';
import { useProxy } from 'valtio/utils';

function MemperolehInformasi({ onChange }: {
  onChange: (value: Prisma.CaraMemperolehInformasiGetPayload<{
    select: {
      id: true,
      name: true
    }
  }>) => void
}) {
  const memperolehInformasiState = useProxy(statePermohonanInformasi)
  
  useShallowEffect(() => {
    memperolehInformasiState.caraMemperolehInformasi.findMany.load()
  }, [])

  if (!memperolehInformasiState.caraMemperolehInformasi.findMany.data) 
    return <Skeleton h={40} />

  const data = memperolehInformasiState.caraMemperolehInformasi.findMany.data;
  if (!data) return <Skeleton h={40} />

  return (
    <Group>
      <Select
        placeholder='Pilih cara memperoleh informasi'
        label={"Cara Memperoleh Informasi"}
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

export default MemperolehInformasi;
