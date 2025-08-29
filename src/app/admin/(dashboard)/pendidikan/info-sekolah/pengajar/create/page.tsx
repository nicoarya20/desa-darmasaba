/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';


function CreatePengajar() {
  const router = useRouter();
  const stateCreate = useProxy(infoSekolahPaud.pengajar)

  useEffect(() => {
    stateCreate.findMany.load();
    infoSekolahPaud.lembagaPendidikan.findMany.load();
  }, []);

  const resetForm = () => {
    stateCreate.create.form = {
      nama: "",
      lembagaId: "",
    };
  };
  const handleSubmit = async () => {
    await stateCreate.create.create();

    resetForm();
    router.push("/admin/pendidikan/info-sekolah/pengajar")
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
          <Title order={4}>Create Pengajar</Title>
          <TextInput
            value={stateCreate.create.form.nama}
            onChange={(val) => {
              stateCreate.create.form.nama = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nama</Text>}
            placeholder='Masukkan nama'
          />
          <Select
            value={stateCreate.create.form.lembagaId}
            onChange={(val) => {
              stateCreate.create.form.lembagaId = val ?? "";
            }}
            label={<Text fw={"bold"} fz={"sm"}>Lembaga</Text>}
            placeholder="Pilih lembaga"
            data={
              infoSekolahPaud.lembagaPendidikan.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama,
              })) || []
            }
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePengajar;
