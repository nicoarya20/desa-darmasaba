'use client'
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';



function CreateKelahiran() {
  const createState = useProxy(persentaseKelahiranKematian.kelahiran)
  const router = useRouter();

  const resetForm = () => {
    createState.create.form = {
      nama: "",
      tanggal: "",
      jenisKelamin: "",
      alamat: "",
    };
  };

  const handleSubmit = async () => {
    await createState.create.create();
    resetForm();
    router.push("/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran")
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
          <Title order={4}>Create Kelahiran</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Nama</Text>}
            placeholder='Masukkan nama'
            value={createState.create.form.nama}
            onChange={(val) => {
              createState.create.form.nama = val.target.value;
            }}
          />
          <TextInput
            type='date'
            label={<Text fw={"bold"} fz={"sm"}>Tanggal</Text>}
            placeholder='Masukkan tanggal'
            value={createState.create.form.tanggal}
            onChange={(val) => {
              createState.create.form.tanggal = val.target.value;
            }}
          />
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Jenis Kelamin</Text>}
            placeholder='Masukkan jenis kelamin'
            value={createState.create.form.jenisKelamin}
            onChange={(val) => {
              createState.create.form.jenisKelamin = val.target.value;
            }}
          />
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Alamat</Text>}
            placeholder='Masukkan alamat'
            value={createState.create.form.alamat}
            onChange={(val) => {
              createState.create.form.alamat = val.target.value;
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

export default CreateKelahiran;
