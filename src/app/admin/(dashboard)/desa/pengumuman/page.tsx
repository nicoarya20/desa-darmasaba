'use client'
import { Box, Group, Paper, Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateDesaPengumuman from '../../_state/desa/pengumuman';
import { useShallowEffect } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import { BeritaEditor } from '../berita/_com/BeritaEditor';
import colors from '@/con/colors';

function Page() {
  return (
    <Box>
      <Title order={3}>Pengumuman</Title>
      <SimpleGrid cols={{
        base: 1, md: 2
      }}>
        <PengumumanCreate />
        <PengumumanList />
      </SimpleGrid>
    </Box>
  );
}

function PengumumanCreate() {
  const pengumumanState = useProxy(stateDesaPengumuman)


  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <SelectCategory onChange={(val) => {
            pengumumanState.pengumuman.create.form.categoryPengumumanId = val.id
          }} />
          <TextInput onChange={(val) => {
            pengumumanState.pengumuman.create.form.judul = val.target.value
          }} label={<Text fz={"sm"} fw={"bold"}>Judul</Text>} placeholder='masukkan judul' />
          <TextInput onChange={(val) => {
            pengumumanState.pengumuman.create.form.deskripsi = val.target.value
          }} label={<Text fz={"sm"} fw={"bold"}>Deskripsi</Text>} placeholder='masukkan deskripsi' />
          <BeritaEditor onSubmit={(val) => {
            pengumumanState.pengumuman.create.form.content = val
            pengumumanState.pengumuman.create.create()
          }} />
        </Stack>
      </Paper>
    </Box>
  )
}

function PengumumanList() {
  const pengumumanState = useProxy(stateDesaPengumuman)
  useShallowEffect(() => {
    pengumumanState.pengumuman.findMany.load()
  }, [])

  if (!pengumumanState.pengumuman.findMany.data) return <Stack py={10}>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Text fz={"xl"} fw={"bold"}>List Pengumuman</Text>
          {pengumumanState.pengumuman.findMany.data?.map((item) => (
            <Text key={item.id}>{item.judul}</Text>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
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
    <Select placeholder='pilih kategori' label={<Text fz={"sm"} fw={"bold"}>Pilih Kategori</Text>} data={pengumumanState.category.findMany.data.map((item) => ({
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
