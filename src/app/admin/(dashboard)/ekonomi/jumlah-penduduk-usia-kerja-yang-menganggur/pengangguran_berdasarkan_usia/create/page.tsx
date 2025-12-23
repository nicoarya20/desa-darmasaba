/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import grafikNganggur from '@/app/admin/(dashboard)/_state/ekonomi/usia-kerja-nganggur';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateGrafikBerdasarkanUsiaKerjaYangMenganggur() {
  const router = useRouter();
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanUsiaKerjaNganggur);
  const [donutData, setDonutData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    stategrafik.create.form = {
      ...stategrafik.create.form,
      usia18_25: '',
      usia26_35: '',
      usia36_45: '',
      usia46_keatas: '',
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const id = await stategrafik.create.create();
      if (id) {
        const idStr = String(id);
        await stategrafik.findUnique.load(idStr);
        if (stategrafik.findUnique.data) {
          setDonutData([stategrafik.findUnique.data]);
        }
      }
      resetForm();
      router.push('/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia');
    } catch (error) {
      console.error('Error creating:', error);
      toast.error('Terjadi kesalahan saat membuat data');
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
          Tambah Data Pengangguran Berdasarkan Usia
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
            label="Usia 18 - 25"
            type="number"
            placeholder="Masukkan jumlah"
            value={stategrafik.create.form.usia18_25}
            onChange={(val) => (stategrafik.create.form.usia18_25 = val.currentTarget.value)}
            required
          />
          <TextInput
            label="Usia 26 - 35"
            type="number"
            placeholder="Masukkan jumlah"
            value={stategrafik.create.form.usia26_35}
            onChange={(val) => (stategrafik.create.form.usia26_35 = val.currentTarget.value)}
            required
          />
          <TextInput
            label="Usia 36 - 45"
            type="number"
            placeholder="Masukkan jumlah"
            value={stategrafik.create.form.usia36_45}
            onChange={(val) => (stategrafik.create.form.usia36_45 = val.currentTarget.value)}
            required
          />
          <TextInput
            label="Usia 46 +"
            type="number"
            placeholder="Masukkan jumlah"
            value={stategrafik.create.form.usia46_keatas}
            onChange={(val) => (stategrafik.create.form.usia46_keatas = val.currentTarget.value)}
            required
          />

          {/* Submit Button */}
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

export default CreateGrafikBerdasarkanUsiaKerjaYangMenganggur;
