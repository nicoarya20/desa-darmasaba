/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import jumlahPendudukMiskin from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-penduduk-miskin';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title, Group, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import { toast } from 'react-toastify';

function EditJumlahPendudukMiskin() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stateJPM = useProxy(jumlahPendudukMiskin);

  const id = params.id;

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        await stateJPM.findUnique.load(id);
        const data = stateJPM.findUnique.data;
        if (data) {
          stateJPM.update.form = {
            year: data.year || 0,
            totalPoorPopulation: data.totalPoorPopulation || 0,
          };
        }
      } catch (error) {
        console.error('Gagal memuat data:', error);
        toast.error('Gagal memuat data jumlah penduduk miskin');
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async () => {
    try {
      stateJPM.update.id = id;
      await stateJPM.update.submit();
      toast.success('Data jumlah penduduk miskin berhasil diperbarui!');
      router.push('/admin/ekonomi/jumlah-penduduk-miskin');
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Jumlah Penduduk Miskin
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
            label="Tahun"
            placeholder="Masukkan tahun"
            type="number"
            required
            value={stateJPM.update.form.year}
            onChange={(val) => {
              stateJPM.update.form.year = Number(val.currentTarget.value);
            }}
          />

          <TextInput
            label="Jumlah Penduduk Miskin"
            placeholder="Masukkan jumlah penduduk miskin"
            type="number"
            required
            value={stateJPM.update.form.totalPoorPopulation}
            onChange={(val) => {
              stateJPM.update.form.totalPoorPopulation = Number(val.currentTarget.value);
            }}
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

export default EditJumlahPendudukMiskin;
