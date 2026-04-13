'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Title,
  TextInput,
  Select,
  Textarea
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import migrasiPenduduk from '../../../_state/kependudukan/migrasi-penduduk';
import { toast } from 'react-toastify';

function CreateMigrasiPenduduk() {
  const stateMigrasiPenduduk = useProxy(migrasiPenduduk);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jenisOptions = [
    { value: 'MASUK', label: 'Masuk' },
    { value: 'KELUAR', label: 'Keluar' },
  ];

  const jenisKelaminOptions = [
    { value: 'L', label: 'Laki-laki' },
    { value: 'P', label: 'Perempuan' },
  ];

  const isFormValid = () => {
    return (
      stateMigrasiPenduduk.create.form.jenis?.trim() !== '' &&
      stateMigrasiPenduduk.create.form.nama?.trim() !== '' &&
      stateMigrasiPenduduk.create.form.tanggal?.trim() !== '' &&
      stateMigrasiPenduduk.create.form.asalTujuan?.trim() !== ''
    );
  };

  const resetForm = () => {
    stateMigrasiPenduduk.create.form = {
      jenis: '',
      nama: '',
      tanggal: '',
      asalTujuan: '',
      alasan: '',
      jenisKelamin: '',
    };
  };

  const handleSubmit = async () => {
    try {
      const id = await stateMigrasiPenduduk.create.create();
      if (id) {
        resetForm();
        router.push('/admin/kependudukan/migrasi-penduduk');
      }
    } catch (error) {
      console.error('Error creating migrasi penduduk:', error);
      toast.error('Terjadi kesalahan saat menambah data migrasi penduduk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
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
          Tambah Migrasi Penduduk
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
          <Select
            label="Jenis Migrasi"
            placeholder="Pilih jenis migrasi"
            data={jenisOptions}
            value={stateMigrasiPenduduk.create.form.jenis}
            onChange={(val) => {
              stateMigrasiPenduduk.create.form.jenis = val || '';
            }}
            required
          />

          <TextInput
            label="Nama"
            placeholder="Masukkan nama lengkap"
            value={stateMigrasiPenduduk.create.form.nama}
            onChange={(e) => {
              stateMigrasiPenduduk.create.form.nama = e.currentTarget.value;
            }}
            required
          />

          <DatePickerInput
            label="Tanggal"
            placeholder="Pilih tanggal"
            value={stateMigrasiPenduduk.create.form.tanggal ? new Date(stateMigrasiPenduduk.create.form.tanggal) : null}
            onChange={(val: string | null) => {
              stateMigrasiPenduduk.create.form.tanggal = val || '';
            }}
            required
          />

          <TextInput
            label={stateMigrasiPenduduk.create.form.jenis === 'MASUK' ? 'Asal' : 'Tujuan'}
            placeholder={stateMigrasiPenduduk.create.form.jenis === 'MASUK' ? 'Masukkan asal' : 'Masukkan tujuan'}
            value={stateMigrasiPenduduk.create.form.asalTujuan}
            onChange={(e) => {
              stateMigrasiPenduduk.create.form.asalTujuan = e.currentTarget.value;
            }}
            required
          />

          <Textarea
            label="Alasan"
            placeholder="Masukkan alasan (opsional)"
            value={stateMigrasiPenduduk.create.form.alasan}
            onChange={(e) => {
              stateMigrasiPenduduk.create.form.alasan = e.currentTarget.value;
            }}
            autosize
            minRows={2}
          />

          <Select
            label="Jenis Kelamin"
            placeholder="Pilih jenis kelamin"
            data={jenisKelaminOptions}
            value={stateMigrasiPenduduk.create.form.jenisKelamin}
            onChange={(val) => {
              stateMigrasiPenduduk.create.form.jenisKelamin = val || '';
            }}
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

export default CreateMigrasiPenduduk;
