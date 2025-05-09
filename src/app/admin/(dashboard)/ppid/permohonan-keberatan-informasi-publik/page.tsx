'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import statePermohonanKeberatan from '../../_state/ppid/permohonan_keberatan_informasi_publik/permohonanKeberatanInformasi';
import { useShallowEffect } from '@mantine/hooks';

function Page() {
  return (
    <Box>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <PermohonanKeberatanInformasiCreate />
        <PermohonanKeberatanInformasiList />
      </SimpleGrid>
    </Box>
  );
}

function PermohonanKeberatanInformasiCreate() {
  const state = useProxy(statePermohonanKeberatan.permohonanKeberatanInformasiForm)
  const submit = () => {
    if (state.create.form.name && state.create.form.email && state.create.form.notelp && state.create.form.alasan) {
      state.create.create()
    }
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={3}>Permohonan Keberatan Informasi Publik</Title>
          <TextInput
            label="Nama"
            placeholder="masukkan nama lengkap"
            onChange={(val) => {
              state.create.form.name = val.target.value
            }}
          />
          <TextInput
            label="Email"
            placeholder="masukkan email"
            onChange={(val) => {
              state.create.form.email = val.target.value
            }}
          />
          <TextInput
            label="Nomor Telepon"
            placeholder="masukkan nomor telepon"
            onChange={(val) => {
              state.create.form.notelp = val.target.value
            }}
          />
          <TextInput
            label="Alasan Keberatan"
            placeholder="masukkan alasan keberatan"
            onChange={(val) => {
              state.create.form.alasan = val.target.value
            }}
          />
          <Group>
            <Button onClick={submit} bg={colors['blue-button']}>Kirim Permohonan</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  )
}

function PermohonanKeberatanInformasiList() {
  const listState = useProxy(statePermohonanKeberatan.permohonanKeberatanInformasiForm)
  useShallowEffect(() => {
    listState.findMany.load()
  }, [])

  if (!listState.findMany.data) return <Stack>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={3}>Permohonan Keberatan Informasi Publik</Title>
          {listState.findMany.data?.map((item) => (
            <Box key={item.id}>
              <Text>Nama: {item.name}</Text>
              <Text>Email: {item.email}</Text>
              <Text>Telepon: {item.notelp}</Text>
              <Text>Alasan: {item.alasan}</Text>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}

export default Page;
