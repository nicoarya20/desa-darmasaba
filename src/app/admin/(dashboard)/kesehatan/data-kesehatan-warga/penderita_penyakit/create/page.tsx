/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import grafikkepuasan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/grafikKepuasan';
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

function CreateGrafikHasilKepuasanMasyarakat() {
  const stateGrafikKepuasan = useProxy(grafikkepuasan);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    stateGrafikKepuasan.create.form = {
      nama: "",
      tanggal: "",
      jenisKelamin: "",
      alamat: "",
      penyakit: "",
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await stateGrafikKepuasan.create.create();
      resetForm();
      router.push("/admin/kesehatan/data-kesehatan-warga/penderita_penyakit");
    } catch (error) {
      console.error("Error creating grafik kepuasan:", error);
      toast.error("Terjadi kesalahan saat membuat grafik kepuasan");
    } finally {
      setIsSubmitting(false);
    }
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
          Tambah Penderita Penyakit
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
            label="Nama"
            placeholder="Masukkan nama"
            value={stateGrafikKepuasan.create.form.nama}
            onChange={(e) => (stateGrafikKepuasan.create.form.nama = e.target.value)}
            required
          />
          <TextInput
            type="date"
            label="Tanggal"
            placeholder="Masukkan tanggal"
            value={stateGrafikKepuasan.create.form.tanggal}
            onChange={(e) => (stateGrafikKepuasan.create.form.tanggal = e.target.value)}
            required
          />
          <TextInput
            label="Jenis Kelamin"
            placeholder="Masukkan jenis kelamin"
            value={stateGrafikKepuasan.create.form.jenisKelamin}
            onChange={(e) => (stateGrafikKepuasan.create.form.jenisKelamin = e.target.value)}
            required
          />
          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat"
            value={stateGrafikKepuasan.create.form.alamat}
            onChange={(e) => (stateGrafikKepuasan.create.form.alamat = e.target.value)}
            required
          />
          <TextInput
            label="Penyakit"
            placeholder="Masukkan penyakit"
            value={stateGrafikKepuasan.create.form.penyakit}
            onChange={(e) => (stateGrafikKepuasan.create.form.penyakit = e.target.value)}
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

export default CreateGrafikHasilKepuasanMasyarakat;
