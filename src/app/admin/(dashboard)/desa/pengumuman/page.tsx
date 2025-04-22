'use client'
import { Group, Select, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateDesaPengumuman from '../../_state/pengumuman';
import { useShallowEffect } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import { BeritaEditor } from '../berita/_com/BeritaEditor';

function Page() {
  return (
    <Stack>
      <SimpleGrid cols={{
        base: 1, md: 2
      }}>
        <PengumumanList />
        <PengumumanCreate />
      </SimpleGrid>
    </Stack>
  );
}

function PengumumanList() {
  const pengumumanState = useProxy(stateDesaPengumuman)
  useShallowEffect(() => {
    pengumumanState.pengumuman.findMany.load()
  }, [])

  if (!pengumumanState.pengumuman.findMany.data) return <Stack>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  return <Stack>
    <Text>Announcement List</Text>
    {pengumumanState.pengumuman.findMany.data?.map((item) => (
      <Text key={item.id}>{item.judul}</Text>
    ))}
  </Stack>;
}

function PengumumanCreate() {
  const pengumumanState = useProxy(stateDesaPengumuman)


  return <Stack gap={"md"}>
    <Text>Create Some Announcement</Text>
    <SelectCategory onChange={(val) => {
      pengumumanState.pengumuman.create.form.categoryPengumumanId = val.id
    }} />
    <TextInput onChange={(val) => {
      pengumumanState.pengumuman.create.form.judul = val.target.value
    }} label={"Judul"} placeholder='masukkan judul' />
    <TextInput onChange={(val) => {
      pengumumanState.pengumuman.create.form.deskripsi = val.target.value
    }} label={"Deskripsi"} placeholder='masukkan deskripsi' />
    <BeritaEditor onSubmit={(val) => {
      pengumumanState.pengumuman.create.form.content = val
      pengumumanState.pengumuman.create.create()
    }} />
  </Stack>
}

function SelectCategory({ onChange }: {
  onChange: (value: Prisma.CategoryPengumumanGetPayload<{
    select: {
      name: true,
      id: true
    }
  }>) => void
}) {
  const pengumumanState = useProxy(stateDesaPengumuman)
  useShallowEffect(() => {
    pengumumanState.category.findMany.load()
  }, [])

  if (!pengumumanState.category.findMany.data) return <Skeleton h={40} />
  return <Group>
    {/* {JSON.stringify(pengumumanState.category.findMany.data)} */}
    <Select placeholder='pilih kategori' label={"select katagori"} data={pengumumanState.category.findMany.data.map((item) => ({
      value: item.id,
      label: item.name
    }))} onChange={(v) => {
      const data = pengumumanState.category.findMany.data?.find((item) => item.id === v)
      if (!data) return
      onChange(data)
    }}
    />
  </Group>
}
export default Page;
