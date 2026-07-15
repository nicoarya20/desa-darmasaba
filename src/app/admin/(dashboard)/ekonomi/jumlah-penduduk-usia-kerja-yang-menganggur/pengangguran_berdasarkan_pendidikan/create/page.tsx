'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import grafikNganggur from '@/app/admin/(dashboard)/_state/ekonomi/usia-kerja-nganggur';
import colors from '@/con/colors';
import { Box, Button, Loader, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateGrafikBerdasarkanPendidikan() {
  const router = useRouter();
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanPendidikan, { sync: true }); // sync: cegah caret jump di controlled input
  const [donutData, setDonutData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      stategrafik.create.form.SD?.trim() !== '' &&
      stategrafik.create.form.SMP?.trim() !== '' &&
      stategrafik.create.form.SMA?.trim() !== '' &&
      stategrafik.create.form.D3?.trim() !== '' &&
      stategrafik.create.form.S1?.trim() !== ''
    );
  };

  const resetForm = () => {
    stategrafik.create.form = {
      ...stategrafik.create.form,
      SD: '',
      SMP: '',
      SMA: '',
      D3: '',
      S1: '',
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
      router.push(
        '/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan'
      );
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat menambahkan data grafik');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Data Pengangguran Berdasarkan Pendidikan
        </Title>
      </Group>

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
            label="SD"
            type="number"
            placeholder="Masukkan jumlah"
            value={stategrafik.create.form.SD}
            onChange={(val) => (stategrafik.create.form.SD = val.currentTarget.value)}
            required
          />
          <TextInput
            label="SMP"
            type="number"
            placeholder="Masukkan jumlah"
            value={stategrafik.create.form.SMP}
            onChange={(val) => (stategrafik.create.form.SMP = val.currentTarget.value)}
            required
          />
          <TextInput
            label="SMA"
            type="number"
            placeholder="Masukkan jumlah"
            value={stategrafik.create.form.SMA}
            onChange={(val) => (stategrafik.create.form.SMA = val.currentTarget.value)}
            required
          />
          <TextInput
            label="D3"
            type="number"
            placeholder="Masukkan jumlah"
            value={stategrafik.create.form.D3}
            onChange={(val) => (stategrafik.create.form.D3 = val.currentTarget.value)}
            required
          />
          <TextInput
            label="S1"
            type="number"
            placeholder="Masukkan jumlah"
            value={stategrafik.create.form.S1}
            onChange={(val) => (stategrafik.create.form.S1 = val.currentTarget.value)}
            required
          />

          <Group justify="right" mt="md">
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

export default CreateGrafikBerdasarkanPendidikan;
