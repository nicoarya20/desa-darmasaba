/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function CreateJenisPengaduan() {
  const router = useRouter();
  const state = useProxy(layananonlineDesa.jenisPengaduan)

  useEffect(() => {
    state.findMany.load();
  }, []);

  const resetForm = () => {
    state.create.form = {
      nama: "",
    };
  }

  const handleSubmit = async () => {
    await state.create.create();
    resetForm();
    router.push("/admin/inovasi/layanan-online-desa/jenis-pengaduan")
  }

  return (
    <Box>
      <Box>
        <Box mb={10}>
          <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
            <IconArrowBack color={colors['blue-button']} size={25} />
          </Button>
        </Box>

        <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
          <Stack gap={"xs"}>
            <Title order={4}>Create Jenis Pengaduan</Title>
            <TextInput
              value={state.create.form.nama}
              onChange={(val) => {
                state.create.form.nama = val.target.value;
              }}
              label={<Text fw={"bold"} fz={"sm"}>Nama Jenis Pengaduan</Text>}
              placeholder='Masukkan nama jenis pengaduan'
            />
            <Group>
              <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
            </Group>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default CreateJenisPengaduan;
