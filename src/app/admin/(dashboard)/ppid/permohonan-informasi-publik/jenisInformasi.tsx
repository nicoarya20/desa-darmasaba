import { Prisma } from '@prisma/client';
import React from 'react';
import { useProxy } from 'valtio/utils';
import statePermohonanInformasi from '../../_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';
import { useShallowEffect } from '@mantine/hooks';
import { Group, Select, Skeleton } from '@mantine/core';

function JenisInformasi({ onChange }: {
  onChange: (value: Prisma.JenisInformasiDimintaGetPayload<{
    select: {
      id: true,
      name: true
    }
  }>) => void
}) {
  const jenisInformasiState = useProxy(statePermohonanInformasi.jenisInformasiDiminta)
  useShallowEffect(() => {
    jenisInformasiState.findMany.load()
  }, [])

  if (!jenisInformasiState.findMany.data) return <Skeleton h={40} />
  return (
    <Group>
      <Select
        placeholder='pilih jenis informasi'
        label={'select jenis informasi'}
        data={jenisInformasiState.findMany.data.map((item) => ({
          value: item.id,
          label: item.name
        }))}
        onChange={(v) => {
          const data = jenisInformasiState.findMany.data?.find((item) => item.id === v)
          if (!data) return
          onChange(data)
        }}
      />
    </Group>
  );
}

export default JenisInformasi;
