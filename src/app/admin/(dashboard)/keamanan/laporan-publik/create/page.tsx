'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import laporanPublikState from '../../../_state/keamanan/laporan-publik';
import { useState } from 'react';
import { toast } from 'react-toastify';

export type Status = 'Selesai' | 'Proses' | 'Gagal';

function CreateLaporanPublik() {
  const stateLaporan = useProxy(laporanPublikState);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateLaporan.create.form.judul?.trim() !== '' &&
      stateLaporan.create.form.lokasi?.trim() !== '' &&
      stateLaporan.create.form.tanggalWaktu?.trim() !== '' &&
      stateLaporan.create.form.kronologi?.trim() !== ''
    );
  };

  const resetForm = () => {
    stateLaporan.create.form = {
      judul: '',
      lokasi: '',
      tanggalWaktu: '',
      kronologi: '',
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await stateLaporan.create.create();
      resetForm();
      router.push('/admin/keamanan/laporan-publik');
    } catch (error) {
      console.error('Error creating laporan publik:', error);
      toast.error('Terjadi kesalahan saat membuat laporan publik');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header with Back Button */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Laporan Publik
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
            value={stateLaporan.create.form.judul}
            onChange={(e) => (stateLaporan.create.form.judul = e.target.value)}
            label={<Text fw="bold" fz="sm">Judul Laporan Publik</Text>}
            placeholder="Masukkan judul laporan publik"
            required
          />

          <TextInput
            value={stateLaporan.create.form.lokasi}
            onChange={(e) => (stateLaporan.create.form.lokasi = e.target.value)}
            label={<Text fw="bold" fz="sm">Lokasi Laporan Publik</Text>}
            placeholder="Masukkan lokasi laporan publik"
            required
          />

          <DateTimePicker
            label={<Text fw="bold" fz="sm">Tanggal Laporan Publik</Text>}
            value={
              stateLaporan.create.form.tanggalWaktu
                ? new Date(stateLaporan.create.form.tanggalWaktu)
                : null
            }
            onChange={(val) => {
              stateLaporan.create.form.tanggalWaktu = val ? val.toString() : '';
            }}
          />

          <TextInput
            value={stateLaporan.create.form.kronologi}
            onChange={(e) => (stateLaporan.create.form.kronologi = e.target.value)}
            label={<Text fw="bold" fz="sm">Kronologi Laporan Publik</Text>}
            placeholder="Masukkan kronologi laporan publik"
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

export default CreateLaporanPublik;
