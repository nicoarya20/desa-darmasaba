/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKategoriKegiatan() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const stateKategori = useProxy(gotongRoyongState.kategoriKegiatan);

  const [formData, setFormData] = useState({
    nama: '',
  });

  useEffect(() => {
    const loadKategorikegiatan = async () => {
      if (!id) return;

      try {
        const data = await stateKategori.edit.load(id);

        if (data) {
          stateKategori.edit.id = id;
          setFormData({
            nama: data.nama || '',
          });
        }
      } catch (error) {
        console.error('Error loading kategori kegiatan:', error);
        toast.error('Gagal memuat data kategori kegiatan');
      }
    };

    loadKategorikegiatan();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!formData.nama.trim()) {
        toast.error('Nama kategori kegiatan tidak boleh kosong');
        return;
      }

      stateKategori.edit.form = { nama: formData.nama.trim() };
      if (!stateKategori.edit.id) stateKategori.edit.id = id;

      const success = await stateKategori.edit.update();

      if (success) {
        toast.success('Kategori kegiatan berhasil diperbarui!');
        router.push('/admin/lingkungan/gotong-royong/kategori-kegiatan');
      }
    } catch (error) {
      console.error('Error updating kategori kegiatan:', error);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md" align="center">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" p="xs" radius="md" onClick={() => router.back()}>
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Kategori Kegiatan
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
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            label={<Text fw="bold" fz="sm">Nama Kategori Kegiatan</Text>}
            placeholder="Masukkan nama kategori kegiatan"
            required
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

export default EditKategoriKegiatan;
