/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

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
import { useProxy } from 'valtio/utils';
import demografiPekerjaan from '../../../_state/ekonomi/demografi-pekerjaan';
import { toast } from 'react-toastify';

function CreateDemografiPekerjaan() {
  const stateDemografi = useProxy(demografiPekerjaan, { sync: true }); // sync: cegah caret jump di controlled input
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateDemografi.create.form.pekerjaan?.trim() !== '' &&
      stateDemografi.create.form.lakiLaki !== null &&
      stateDemografi.create.form.lakiLaki >= 0 &&
      stateDemografi.create.form.perempuan !== null &&
      stateDemografi.create.form.perempuan >= 0
    );
  };

  const resetForm = () => {
    stateDemografi.create.form = {
      pekerjaan: '',
      lakiLaki: 0,
      perempuan: 0,
    };
  };

  const handleSubmit = async () => {
    try {
      const id = await stateDemografi.create.create();
      if (id) {
        const idStr = String(id);
        await stateDemografi.findUnique.load(idStr);
        if (stateDemografi.findUnique.data) {
          setChartData([stateDemografi.findUnique.data]);
        }
      }
      resetForm();
      router.push('/admin/ekonomi/demografi-pekerjaan');
    } catch (error) {
      console.error('Error creating demografi pekerjaan:', error);
      toast.error('Terjadi kesalahan saat menambah demografi pekerjaan');
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
          Tambah Demografi Pekerjaan
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
            label="Pekerjaan"
            type="text"
            value={stateDemografi.create.form.pekerjaan}
            placeholder="Masukkan pekerjaan"
            onChange={(val) => {
              stateDemografi.create.form.pekerjaan = val.currentTarget.value;
            }}
            required
          />
          <TextInput
            label="Jumlah Pekerja Laki-Laki"
            type="number"
            value={stateDemografi.create.form.lakiLaki}
            placeholder="Masukkan jumlah pekerja laki-laki"
            onChange={(val) => {
              stateDemografi.create.form.lakiLaki = Number(val.currentTarget.value);
            }}
            required
          />
          <TextInput
            label="Jumlah Pekerja Perempuan"
            type="number"
            value={stateDemografi.create.form.perempuan}
            placeholder="Masukkan jumlah pekerja perempuan"
            onChange={(val) => {
              stateDemografi.create.form.perempuan = Number(val.currentTarget.value);
            }}
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

export default CreateDemografiPekerjaan;
