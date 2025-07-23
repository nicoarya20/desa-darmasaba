/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import korupsiState from '../../../../_state/landing-page/desa-anti-korupsi';

function CreateKategoriDesaAntiKorupsi() {
  const router = useRouter();
  const stateKategori = useProxy(korupsiState.kategoriDesaAntiKorupsi)

  useEffect(() => {
    stateKategori.findMany.load();
  }, []);

  const resetForm = () => {
    stateKategori.create.form = {
      name: "",
    };
  }

  const handleSubmit = async () => {
    await stateKategori.create.create();
    resetForm();
    router.push("/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi")
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
            <Title order={4}>Create Kategori Desa Anti Korupsi</Title>
            <TextInput
              value={stateKategori.create.form.name}
              onChange={(val) => {
                stateKategori.create.form.name = val.target.value;
              }}
              label={<Text fw={"bold"} fz={"sm"}>Nama Kategori Desa Anti Korupsi</Text>}
              placeholder='Masukkan nama kategori desa anti korupsi'
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

export default CreateKategoriDesaAntiKorupsi;
