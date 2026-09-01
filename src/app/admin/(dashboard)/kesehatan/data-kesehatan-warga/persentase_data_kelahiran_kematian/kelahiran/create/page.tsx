'use client';
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import { JENIS_KELAMIN_OPTIONS } from '../../lib/jenisKelamin';


function CreateKelahiran() {
  const createState = useProxy(persentaseKelahiranKematian.kelahiran, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      createState.create.form.nama?.trim() !== '' &&
      createState.create.form.tanggal !== '' &&
      createState.create.form.jenisKelamin?.trim() !== '' &&
      createState.create.form.alamat?.trim() !== ''
    );
  };

  const resetForm = () => {
    createState.create.form = {
      nama: '',
      tanggal: '',
      jenisKelamin: '',
      alamat: '',
    };
  };


  const handleSubmit = async () => {
    if (!createState.create.form.nama?.trim()) {
      toast.error('Nama wajib diisi');
      return;
    }

    if (!createState.create.form.tanggal) {
      toast.error('Tanggal wajib diisi');
      return;
    }

    if (!createState.create.form.jenisKelamin?.trim()) {
      toast.error('Jenis kelamin wajib diisi');
      return;
    }

    if (!createState.create.form.alamat?.trim()) {
      toast.error('Alamat wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      await createState.create.create();
      resetForm();
      router.push(
        '/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran'
      );
    } catch (error) {
      console.error('Error creating kelahiran:', error);
      toast.error('Gagal menambahkan data kelahiran');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
     <Box px={{ base: 0, md: 'lg' }} py="xs">
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
            value={createState.create.form.nama}
            onChange={(e) => (createState.create.form.nama = e.target.value)}
            required
          />
          <TextInput
            type="date"
            label={<Text fw="bold" fz="sm">Tanggal</Text>}
            placeholder="Masukkan tanggal"
            value={createState.create.form.tanggal}
            onChange={(e) => (createState.create.form.tanggal = e.target.value)}
            required
          />
          <Select
            label={<Text fw="bold" fz="sm">Jenis Kelamin</Text>}
            placeholder="Pilih jenis kelamin"
            data={[...JENIS_KELAMIN_OPTIONS]}
            value={createState.create.form.jenisKelamin}
            onChange={(value) => (createState.create.form.jenisKelamin = value || '')}
            required
          />
          <TextInput
            label={<Text fw="bold" fz="sm">Alamat</Text>}
            placeholder="Masukkan alamat"
            value={createState.create.form.alamat}
            onChange={(e) => (createState.create.form.alamat = e.target.value)}
            required
          />


          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
            </Button>

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}


export default CreateKelahiran;