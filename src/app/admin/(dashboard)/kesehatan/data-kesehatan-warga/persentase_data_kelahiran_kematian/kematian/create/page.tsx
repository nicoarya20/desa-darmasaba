'use client';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateKematian() {
  const createState = useProxy(persentaseKelahiranKematian.kematian);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    createState.create.form = {
      nama: '',
      tanggal: '',
      jenisKelamin: '',
      alamat: '',
      penyebab: '',
    };
  };


  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!createState.create.form.nama) {
        return toast.warn('Nama wajib diisi');
      }
      if (!createState.create.form.tanggal) {
        return toast.warn('Tanggal wajib diisi');
      }


      await createState.create.create();
      resetForm();
      router.push(
        '/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian'
      );
    } catch (error) {
      console.error('Error creating data kematian:', error);
      toast.error('Gagal menambahkan data kematian');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Data Kematian
        </Title>
      </Group>


      {/* Form Card */}
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
            label="Nama"
            placeholder="Masukkan nama"
            value={createState.create.form.nama}
            onChange={(e) => (createState.create.form.nama = e.target.value)}
            required
          />
          <TextInput
            type="date"
            label="Tanggal"
            placeholder="Masukkan tanggal"
            value={createState.create.form.tanggal}
            onChange={(e) => (createState.create.form.tanggal = e.target.value)}
            required
          />
          <TextInput
            label="Jenis Kelamin"
            placeholder="Masukkan jenis kelamin"
            value={createState.create.form.jenisKelamin}
            onChange={(e) => (createState.create.form.jenisKelamin = e.target.value)}
            required
          />
          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat"
            value={createState.create.form.alamat}
            onChange={(e) => (createState.create.form.alamat = e.target.value)}
            required
          />
          <Box>
            <Title order={6} mb={6}>
              Penyebab
            </Title>
            <CreateEditor
              value={createState.create.form.penyebab}
              onChange={(htmlContent) => {
                createState.create.form.penyebab = htmlContent;
              }}
            />
          </Box>


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
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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


export default CreateKematian;