// components/jenisInformasiSelector.tsx
'use client';
import { Skeleton, Group, Select } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import React from 'react';
import { useProxy } from 'valtio/utils';
import statePermohonanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';

export default function JenisInformasiSelector({ onChange }: {
  onChange: (value: Prisma.JenisInformasiDimintaGetPayload<{ 
    select: { 
      id: true;
      name: true 
    } 
  }>) => void;
}) {
  const jenisInformasiState = useProxy(statePermohonanInformasi);

  useShallowEffect(() => {
    jenisInformasiState.jenisInformasiDiminta.findMany.load();
  }, []);

  if (!jenisInformasiState.jenisInformasiDiminta.findMany.data) {
    return <Skeleton h={40} />;
  }
  
  // Add a check for data before mapping
  const data = jenisInformasiState.jenisInformasiDiminta.findMany.data;
  if (!data) return <Skeleton h={40} />;
  
  return (
    <Group>
      <Select
        placeholder='Pilih jenis informasi'
        label='Jenis Informasi'
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
