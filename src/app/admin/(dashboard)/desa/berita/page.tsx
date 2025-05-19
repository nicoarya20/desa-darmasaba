'use client'
import { Box, Center, Group, Paper, Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import { IconImageInPicture } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import stateDashboardBerita from '../../_state/desa/berita';
import { BeritaEditor } from './_com/BeritaEditor';
import colors from '@/con/colors';

function Page() {
  return (
    <Box>
      <Title order={3}>Berita</Title>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <BeritaCreate />
        <BeritaList />
      </SimpleGrid>
    </Box>
  );
}

function BeritaCreate() {
  const beritaState = useProxy(stateDashboardBerita)
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <SelectCategory onChange={(val) => {
            beritaState.berita.create.form.katagoryBeritaId = val.id
          }} />
          <TextInput onChange={(val) => {
            beritaState.berita.create.form.judul = val.target.value
          }} label={"Judul"} placeholder='masukkan judul' />
          <TextInput onChange={(val) => {
            beritaState.berita.create.form.deskripsi = val.target.value
          }} label={"Deskripsi"} placeholder='masukkan deskripsi' />
          <Center w={200} h={200} bg={"gray"}>
            <IconImageInPicture />
          </Center>
          <BeritaEditor onSubmit={(val) => {

            beritaState.berita.create.form.content = val
            beritaState.berita.create.create()
          }} />
        </Stack>
      </Paper>
    </Box>
  )
}

function BeritaList() {
  const beritaState = useProxy(stateDashboardBerita)
  useShallowEffect(() => {
    beritaState.berita.findMany.load()
  }, [])

  if (!beritaState.berita.findMany.data) return <Stack py={10}>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>List Berita</Text>
          {beritaState.berita.findMany.data?.map((item) => (
            <Text key={item.id}>{item.judul}</Text>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}

function SelectCategory({ onChange }: {
  onChange: (value: Prisma.KatagoryBeritaGetPayload<{
    select: {
      name: true,
      id: true
    }
  }>) => void
}) {
  const beritaState = useProxy(stateDashboardBerita)
  useShallowEffect(() => {
    beritaState.category.findMany.load()
  }, [])

  if (!beritaState.category.findMany.data) return <Skeleton h={40} />
  return <Group>
    <Select placeholder='pilih katagori' label={<Text fz={"sm"} fw={"bold"}>Pilih Kategori</Text>} data={beritaState.category.findMany.data.map((item) => ({
      value: item.id,
      label: item.name
    }))} onChange={(v) => {
      const data = beritaState.category.findMany.data?.find((item) => item.id === v)
      if (!data) return
      onChange(data)
    }} />
  </Group>
}

export default Page;
