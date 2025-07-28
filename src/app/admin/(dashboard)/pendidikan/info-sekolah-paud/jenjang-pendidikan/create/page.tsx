/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import infoSekolahPaud from '../../../../_state/pendidikan/info-sekolah-paud';

function CreateJenjangPendidikan() {
  const router = useRouter();
  const stateJenjang = useProxy(infoSekolahPaud.jenjangPendidikan)

  useEffect(() => {
    stateJenjang.findMany.load();
  }, []);

  const resetForm = () => {
    stateJenjang.create.form = {
      nama: "",
    };
  }

  const handleSubmit = async () => {
    await stateJenjang.create.create();
    resetForm();
    router.push("/admin/pendidikan/info-sekolah-paud/jenjang-pendidikan")
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
            <Title order={4}>Create Jenjang Pendidikan</Title>
            <TextInput
              value={stateJenjang.create.form.nama}
              onChange={(val) => {
                stateJenjang.create.form.nama = val.target.value;
              }}
              label={<Text fw={"bold"} fz={"sm"}>Nama Jenjang Pendidikan</Text>}
              placeholder='Masukkan nama jenjang pendidikan'
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

export default CreateJenjangPendidikan;
