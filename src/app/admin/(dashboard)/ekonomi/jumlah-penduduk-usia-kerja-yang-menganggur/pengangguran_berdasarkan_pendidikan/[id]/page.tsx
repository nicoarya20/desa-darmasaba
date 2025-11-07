/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import grafikNganggur from '@/app/admin/(dashboard)/_state/ekonomi/usia-kerja-nganggur';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

function EditGrafikBerdasarkanPendidikan() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanPendidikan);
  const id = params.id;

  // state lokal untuk form
  const [formData, setFormData] = useState({
    SD: '',
    SMP: '',
    SMA: '',
    D3: '',
    S1: '',
  });

  useEffect(() => {
    if (id) {
      stategrafik.findUnique.load(id).then(() => {
        const data = stategrafik.findUnique.data;
        if (data) {
          setFormData({
            SD: data.SD || '',
            SMP: data.SMP || '',
            SMA: data.SMA || '',
            D3: data.D3 || '',
            S1: data.S1 || '',
          });
        }
      });
    }
  }, [id]);

  const handleChange = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.currentTarget.value,
      }));
    };

  const handleSubmit = async () => {
    stategrafik.update.id = id;
    stategrafik.update.form = { ...formData }; // update global state pas submit aja
    await stategrafik.update.submit();
    router.push(
      '/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan'
    );
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
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
          Edit Grafik Pengangguran Berdasarkan Pendidikan
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
            value={formData.SD}
            onChange={handleChange('SD')}
          />
          <TextInput
            label="SMP"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.SMP}
            onChange={handleChange('SMP')}
          />
          <TextInput
            label="SMA"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.SMA}
            onChange={handleChange('SMA')}
          />
          <TextInput
            label="D3"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.D3}
            onChange={handleChange('D3')}
          />
          <TextInput
            label="S1"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.S1}
            onChange={handleChange('S1')}
          />

          <Group justify="right">
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
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditGrafikBerdasarkanPendidikan;
