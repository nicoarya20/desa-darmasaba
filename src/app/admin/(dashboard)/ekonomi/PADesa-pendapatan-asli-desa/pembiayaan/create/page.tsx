'use client'
import React from 'react';
import { useProxy } from 'valtio/utils';
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import { useRouter } from 'next/navigation';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput, Group, Text } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';

function CreatePembiayaan() {
  const pembiayaanState = useProxy(PendapatanAsliDesa.pembiayaan)
  const router = useRouter()

  const formatRupiah = (value: number | string) => {
    const number = typeof value === 'number' ? value : Number(value.replace(/\D/g, ''));
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const unformatRupiah = (value: string) => {
    return Number(value.replace(/\D/g, ''));
  };

  const resetForm = () => {
    pembiayaanState.create.form = {
      name: "",
      value: 0,
    }
  }

  const handleSubmit = async () => {
    await pembiayaanState.create.submit();
    resetForm()
    router.push("/admin/ekonomi/PADesa-pendapatan-asli-desa/pembiayaan")
  }
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Jenis Pembiayaan</Title>
          <TextInput
            value={pembiayaanState.create.form.name}
            onChange={(val) => {
              pembiayaanState.create.form.name = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nama Jenis Pembiayaan</Text>}
            placeholder='Masukkan nama jenis pembiayaan'
          />
          <TextInput
            type='text'
            value={formatRupiah(pembiayaanState.create.form.value)}
            onChange={(val) => {
              const raw = val.currentTarget.value;
              const cleanValue = unformatRupiah(raw);
              pembiayaanState.create.form.value = cleanValue;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nilai</Text>}
            placeholder='Masukkan nilai'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePembiayaan;
