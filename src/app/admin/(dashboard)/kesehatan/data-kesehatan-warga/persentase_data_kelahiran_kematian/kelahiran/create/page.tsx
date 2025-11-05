'use client';
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';


function CreateKelahiran() {
  const createState = useProxy(persentaseKelahiranKematian.kelahiran);
  const router = useRouter();


  const resetForm = () => {
    createState.create.form = {
      nama: '',
      tanggal: '',
      jenisKelamin: '',
      alamat: '',
    };
  };


  const handleSubmit = async () => {
    await createState.create.create();
    resetForm();
    router.push(
      '/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran'
    );
  };


  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Data Kelahiran
        </Title>
      </Group>


      {/* Form */}
      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <TextInput
            label={<Text fw="bold" fz="sm">Nama</Text>}
            placeholder="Masukkan nama"
            defaultValue={createState.create.form.nama}
            onChange={(e) => (createState.create.form.nama = e.target.value)}
            required
          />
          <TextInput
            type="date"
            label={<Text fw="bold" fz="sm">Tanggal</Text>}
            placeholder="Masukkan tanggal"
            defaultValue={createState.create.form.tanggal}
            onChange={(e) => (createState.create.form.tanggal = e.target.value)}
            required
          />
          <TextInput
            label={<Text fw="bold" fz="sm">Jenis Kelamin</Text>}
            placeholder="Masukkan jenis kelamin"
            defaultValue={createState.create.form.jenisKelamin}
            onChange={(e) => (createState.create.form.jenisKelamin = e.target.value)}
            required
          />
          <TextInput
            label={<Text fw="bold" fz="sm">Alamat</Text>}
            placeholder="Masukkan alamat"
            defaultValue={createState.create.form.alamat}
            onChange={(e) => (createState.create.form.alamat = e.target.value)}
            required
          />


          <Group justify="right">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}


export default CreateKelahiran;