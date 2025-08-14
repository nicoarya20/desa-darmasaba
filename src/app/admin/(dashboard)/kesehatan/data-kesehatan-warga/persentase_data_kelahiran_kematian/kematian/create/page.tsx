'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';



function CreateKematian() {
  const createState = useProxy(persentaseKelahiranKematian.kematian)
  const router = useRouter();

  const resetForm = () => {
    createState.create.form = {
      nama: "",
      tanggal: "",
      jenisKelamin: "",
      alamat: "",
      penyebab: "",
    };
  };

  const handleSubmit = async () => {
    await createState.create.create();
    resetForm();
    router.push("/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian")
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
          <Title order={4}>Create Kematian</Title>
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
          <Box>
            <Text fw={"bold"} fz={"sm"}>Penyebab</Text>
            <CreateEditor
              value={createState.create.form.penyebab}
              onChange={(htmlContent) => {
                createState.create.form.penyebab = htmlContent;
              }}
            />
          </Box>
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateKematian;
