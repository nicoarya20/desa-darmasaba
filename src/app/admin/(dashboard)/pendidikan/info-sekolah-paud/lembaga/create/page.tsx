/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import infoSekolahPaud from '../../../../_state/pendidikan/info-sekolah-paud';

function CreateLembaga() {
  const router = useRouter();
  const stateLembaga = useProxy(infoSekolahPaud.lembagaPendidikan)

  useEffect(() => {
    stateLembaga.findMany.load();
    infoSekolahPaud.jenjangPendidikan.findMany.load();
  }, []);

  const resetForm = () => {
    stateLembaga.create.form = {
      nama: "",
      jenjangId: "",
    };
  }

  const handleSubmit = async () => {
    await stateLembaga.create.create();
    resetForm();
    router.push("/admin/pendidikan/info-sekolah-paud/lembaga")
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
            <Title order={4}>Create Lembaga</Title>
            <TextInput
              value={stateLembaga.create.form.nama}
              onChange={(val) => {
                stateLembaga.create.form.nama = val.target.value;
              }}
              label={<Text fw={"bold"} fz={"sm"}>Nama Lembaga</Text>}
              placeholder='Masukkan nama lembaga'
            />
            <Select
              label="Jenjang Pendidikan"
              placeholder="Pilih jenjang pendidikan"
              searchable
              data={infoSekolahPaud.jenjangPendidikan.findMany.data?.map(j => ({
                value: j.id,
                label: j.nama,
              })) || []}
              value={stateLembaga.create.form.jenjangId}
              onChange={(val) => {
                stateLembaga.create.form.jenjangId = val || '';
              }}
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

export default CreateLembaga;
