/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import jumlahPendudukMiskin from '../../../_state/ekonomi/jumlah-penduduk-miskin';
import { toast } from 'react-toastify';

export default function CreateJumlahPendudukMiskin() {
  const stateJPM = useProxy(jumlahPendudukMiskin);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    stateJPM.create.form = {
      year: new Date().getFullYear(),
      totalPoorPopulation: 0,
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const id = await stateJPM.create.create();
      if (id) {
        const idStr = String(id);
        await stateJPM.findUnique.load(idStr);
        if (stateJPM.findUnique.data) {
          setChartData([stateJPM.findUnique.data]);
        }
      }
      resetForm();
      router.push('/admin/ekonomi/jumlah-penduduk-miskin');
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Gagal menambahkan jumlah penduduk miskin")
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Jumlah Penduduk Miskin
        </Title>
      </Group>

      {/* Form Paper */}
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
            label="Tahun"
            type="number"
            value={stateJPM.create.form.year || ''}
            placeholder="Masukkan tahun"
            onChange={(e) => {
              const value = e.currentTarget.value;
              stateJPM.create.form.year = value ? Number(value) : 0;
            }}
            required
          />

          <TextInput
            label="Jumlah Penduduk Miskin"
            type="number"
            value={stateJPM.create.form.totalPoorPopulation}
            placeholder="Masukkan jumlah penduduk miskin"
            onChange={(e) => {
              stateJPM.create.form.totalPoorPopulation = Number(e.currentTarget.value);
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
