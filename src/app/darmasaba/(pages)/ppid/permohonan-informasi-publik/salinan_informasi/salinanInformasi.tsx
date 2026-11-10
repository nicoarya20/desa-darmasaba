import statePermohonanInformasi from '@/app/admin/(dashboard)/_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik';
import { Skeleton, Select } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import React from 'react';
import { useProxy } from 'valtio/utils';
import { PERMOHONAN_FIELD, PERMOHONAN_SELECT_SKELETON_HEIGHT } from '../../_com/permohonan.meta';

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

  if (!memperolehSalinanInformasiState.caraMemperolehSalinanInformasi.findMany.data) return <Skeleton h={PERMOHONAN_SELECT_SKELETON_HEIGHT} radius={PERMOHONAN_FIELD.radius} />

  const data = memperolehSalinanInformasiState.caraMemperolehSalinanInformasi.findMany.data
  if (!data) return <Skeleton h={PERMOHONAN_SELECT_SKELETON_HEIGHT} radius={PERMOHONAN_FIELD.radius} />

  return (
    <Select
      {...PERMOHONAN_FIELD}
      withAsterisk
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
  );
}
export default MemperolehSalinan;
