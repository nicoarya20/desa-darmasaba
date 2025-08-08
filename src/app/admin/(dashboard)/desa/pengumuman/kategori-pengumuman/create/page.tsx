'use client'
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';



function CreateKategoriPengumuman() {
  const createState = useProxy(stateDesaPengumuman.category)
  const router = useRouter();

  const resetForm = () => {
    createState.create.form = {
      name: "",
    };
  };

  const handleSubmit = async () => {
    await createState.create.create();
    resetForm();
    router.push("/admin/desa/pengumuman/kategori-pengumuman")
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
          <Title order={4}>Create Kategori Pengumuman</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Nama Kategori Pengumuman</Text>}
            placeholder='Masukkan nama kategori Pengumuman'
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

export default CreateKategoriPengumuman;
