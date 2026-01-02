/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ nama: '' });
  const [originalData, setOriginalData] = useState({ nama: '' });
  const [loading, setLoading] = useState(true);

  // Load data once
  useEffect(() => {
    if (!id) return;

    const loadKategori = async () => {
      try {
        const data = await stateKategori.edit.load(id);
        if (data) {
          stateKategori.edit.id = id;
          setFormData({ nama: data.nama || '' });
          setOriginalData({ nama: data.nama || '' });
        }
      } catch (err) {
        console.error('Error loading kategori kegiatan:', err);
        toast.error('Gagal memuat data kategori kegiatan');
      } finally {
        setLoading(false);
      }
    };

    loadKategori();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const trimmedNama = formData.nama.trim();
    if (!trimmedNama) {
      toast.error('Nama kategori kegiatan tidak boleh kosong');
      return;
    }

    try {
      setIsSubmitting(true);
      stateKategori.edit.form = { nama: trimmedNama };
      if (!stateKategori.edit.id) stateKategori.edit.id = id;

      const success = await stateKategori.edit.update();
      if (success) {
        toast.success('Kategori kegiatan berhasil diperbarui!');
        router.push('/admin/lingkungan/gotong-royong/kategori-kegiatan');
      }
    } catch (err) {
      console.error('Error updating kategori kegiatan:', err);
      toast.error('Gagal memperbarui kategori kegiatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md" align="center">
        <Button variant="subtle" p="xs" radius="md" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
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
            onChange={(e) => handleChange('nama', e.target.value)}
            label={<Text fw="bold" fz="sm">Nama Kategori Kegiatan</Text>}
            placeholder="Masukkan nama kategori kegiatan"
            required
          />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
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

export default EditKategoriKegiatan;
