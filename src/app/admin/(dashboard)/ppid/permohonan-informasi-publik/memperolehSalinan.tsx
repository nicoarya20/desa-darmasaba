import { Group, Select, Skeleton } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import React from 'react';
import { useProxy } from 'valtio/utils';
import statePermohonanInformasi from '../../_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';

function MemperolehSalinan({ onChange }: {
  onChange: (value: Prisma.CaraMemperolehSalinanInformasiGetPayload<{
    select: {
      id: true,
      name: true
    }
  }>) => void
}) {
  const memperolehSalinanInformasiState = useProxy(statePermohonanInformasi.caraMemperolehSalinanInformasi)
  useShallowEffect(() => {
    memperolehSalinanInformasiState.findMany.load()
  }, [])

  if (!memperolehSalinanInformasiState.findMany.data) return <Skeleton h={40} />
  return (
    <Group>
      <Select
        placeholder='pilih salinan informasi'
        label={'select salinan informasi'}
        data={memperolehSalinanInformasiState.findMany.data.map((item) => ({
          value: item.id,
          label: item.name
        }))}
        onChange={(v) => {
          if (!v) return
          const selectedItem = memperolehSalinanInformasiState.findMany.data?.find(item => item.id === v)
          if (selectedItem) {
            onChange({
              id: selectedItem.id,
              name: selectedItem.name
            })
          }
        }}
      />
    </Group>
  );
}
export default MemperolehSalinan;
