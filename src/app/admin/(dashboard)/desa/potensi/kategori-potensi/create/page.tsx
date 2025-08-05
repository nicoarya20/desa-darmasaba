'use client'
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';



function CreateKategoriPotensi() {
  const createState = useProxy(potensiDesaState.kategoriPotensi)
  const router = useRouter();

  const resetForm = () => {
    createState.create.form = {
      nama: "",
    };
  };

  const handleSubmit = async () => {
    await createState.create.create();
    resetForm();
    router.push("/admin/desa/potensi/kategori-potensi")
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Kategori Potensi</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Nama Kategori Potensi</Text>}
            placeholder='Masukkan nama kategori Potensi'
            value={createState.create.form.nama}
            onChange={(val) => {
              createState.create.form.nama = val.target.value;
            }}
          />
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateKategoriPotensi;
