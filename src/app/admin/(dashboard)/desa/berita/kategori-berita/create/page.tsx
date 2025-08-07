'use client'
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';



function CreateKategoriBerita() {
  const createState = useProxy(stateDashboardBerita.kategoriBerita)
  const router = useRouter();

  const resetForm = () => {
    createState.create.form = {
      name: "",
    };
  };

  const handleSubmit = async () => {
    await createState.create.create();
    resetForm();
    router.push("/admin/desa/berita/kategori-berita")
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
          <Title order={4}>Create Kategori Berita</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Nama Kategori Berita</Text>}
            placeholder='Masukkan nama kategori Berita'
            value={createState.create.form.name}
            onChange={(val) => {
              createState.create.form.name = val.target.value;
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

export default CreateKategoriBerita;
