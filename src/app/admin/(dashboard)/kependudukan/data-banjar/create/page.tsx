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
  NumberInput,
  TextInput
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import dataBanjar from '../../../_state/kependudukan/data-banjar';
import { toast } from 'react-toastify';

function CreateDataBanjar() {
  const stateDataBanjar = useProxy(dataBanjar);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();

  const isFormValid = () => {
    return (
      stateDataBanjar.create.form.nama?.trim() !== '' &&
      stateDataBanjar.create.form.penduduk !== null &&
      stateDataBanjar.create.form.penduduk >= 0 &&
      stateDataBanjar.create.form.kk !== null &&
      stateDataBanjar.create.form.kk >= 0 &&
      stateDataBanjar.create.form.miskin !== null &&
      stateDataBanjar.create.form.miskin >= 0 &&
      stateDataBanjar.create.form.tahun !== null
    );
  };

  const resetForm = () => {
    stateDataBanjar.create.form = {
      nama: '',
      penduduk: 0,
      kk: 0,
      miskin: 0,
      tahun: currentYear,
    };
  };

  const handleSubmit = async () => {
    try {
      const id = await stateDataBanjar.create.create();
      if (id) {
        resetForm();
        router.push('/admin/kependudukan/data-banjar');
      }
    } catch (error) {
      console.error('Error creating data banjar:', error);
      toast.error('Terjadi kesalahan saat menambah data banjar');
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
          Tambah Data Banjar
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
            label="Nama Banjar"
            placeholder="Masukkan nama banjar"
            value={stateDataBanjar.create.form.nama}
            onChange={(e) => {
              stateDataBanjar.create.form.nama = e.currentTarget.value;
            }}
            required
          />

          <NumberInput
            label="Jumlah Penduduk"
            placeholder="Masukkan jumlah penduduk"
            value={stateDataBanjar.create.form.penduduk}
            onChange={(val) => {
              stateDataBanjar.create.form.penduduk = Number(val || 0);
            }}
            min={0}
            required
          />

          <NumberInput
            label="Jumlah KK"
            placeholder="Masukkan jumlah KK"
            value={stateDataBanjar.create.form.kk}
            onChange={(val) => {
              stateDataBanjar.create.form.kk = Number(val || 0);
            }}
            min={0}
            required
          />

          <NumberInput
            label="Jumlah Penduduk Miskin"
            placeholder="Masukkan jumlah penduduk miskin"
            value={stateDataBanjar.create.form.miskin}
            onChange={(val) => {
              stateDataBanjar.create.form.miskin = Number(val || 0);
            }}
            min={0}
            required
          />

          <NumberInput
            label="Tahun"
            placeholder="Masukkan tahun"
            value={stateDataBanjar.create.form.tahun}
            onChange={(val) => {
              stateDataBanjar.create.form.tahun = Number(val || currentYear);
            }}
            min={2000}
            max={currentYear + 1}
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

export default CreateDataBanjar;
