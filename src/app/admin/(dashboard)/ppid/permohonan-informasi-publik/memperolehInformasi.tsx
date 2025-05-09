import { Group, Select } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import React from 'react';
import { useProxy } from 'valtio/utils';
import statePermohonanInformasi from '../../_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';

function MemperolehInformasi({ onChange }: {
  onChange: (value: Prisma.CaraMemperolehInformasiGetPayload<{
    select: {
      id: true,
      name: true
    }
  }>) => void
}) {
  const memperolehInformasiState = useProxy(statePermohonanInformasi.caraMemperolehInformasi)
  
  useShallowEffect(() => {
    memperolehInformasiState.findMany.load()
  }, [])
  return (
    <Group>
      <Select
        placeholder='pilih katagori'
        label={"select katagori"}
        data={memperolehInformasiState.findMany.data?.map((item) => ({
          value: item.id,
          label: item.name
        }))} onChange={(v) => {
          const data = memperolehInformasiState.findMany.data?.find((item) => item.id === v)
          if (!data) return
          onChange(data)
        }} />
    </Group>
  );
}

export default MemperolehInformasi;
