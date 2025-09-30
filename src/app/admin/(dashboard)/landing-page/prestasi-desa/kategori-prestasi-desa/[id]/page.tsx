/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKategoriPrestasi() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const stateKategori = useProxy(prestasiState.kategoriPrestasi);

  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  // Load data kategori prestasi saat component mount
  useEffect(() => {
    if (!id) return;

    const loadKategori = async () => {
      setLoading(true);
      try {
        const data = await stateKategori.edit.load(id);
        if (data) {
          stateKategori.edit.id = id;
          setFormData({ name: data.name || '' });
        }
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data kategori prestasi desa');
      } finally {
        setLoading(false);
      }
    };

    loadKategori();
  }, [id]);

  // Submit: update global state hanya saat submit
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nama kategori prestasi tidak boleh kosong');
      return;
    }

    try {
      stateKategori.edit.form = { name: formData.name.trim() };
      stateKategori.edit.id ||= id; // fallback jika id belum ada

      const success = await stateKategori.edit.update();
      if (success) {
        toast.success('Kategori prestasi berhasil diperbarui');
        router.push('/admin/landing-page/prestasi-desa/kategori-prestasi-desa');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui kategori prestasi desa');
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
          Edit Kategori Prestasi
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
            label="Nama Kategori Prestasi"
            placeholder="Masukkan nama kategori prestasi"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />

          <Group justify="right">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              loading={loading}
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

export default EditKategoriPrestasi;
