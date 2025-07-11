'use client'
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function CreatePendapatan() {
  const pendapatanState = useProxy(PendapatanAsliDesa.pendapatan)
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
    pendapatanState.create.form = {
      name: "",
      value: 0,
    }
  }

  const handleSubmit = async () => {
    await pendapatanState.create.submit();
    resetForm()
    router.push("/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan")
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
          <Title order={4}>Create Jenis Pendapatan</Title>
          <TextInput
            value={pendapatanState.create.form.name}
            onChange={(val) => {
              pendapatanState.create.form.name = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nama Jenis Pendapatan</Text>}
            placeholder='Masukkan nama jenis pendapatan'
          />
          <TextInput
            type='text'
            value={formatRupiah(pendapatanState.create.form.value)}
            onChange={(val) => {
              const raw = val.currentTarget.value;
              const cleanValue = unformatRupiah(raw);
              pendapatanState.create.form.value = cleanValue;
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

export default CreatePendapatan;
