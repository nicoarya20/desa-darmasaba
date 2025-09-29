/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKategoriBuku() {
  const editState = useProxy(perpustakaanDigitalState.kategoriBuku);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: editState.update.form.name || '',
  });

  useEffect(() => {
    const loadKategori = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
          });
        }
      } catch (error) {
        console.error('Error loading kategori buku:', error);
        toast.error('Gagal memuat data kategori buku');
      }
    };

    loadKategori();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      editState.update.form = { ...editState.update.form, name: formData.name };
      await editState.update.update();
      toast.success('Kategori Buku berhasil diperbarui!');
      router.push('/admin/pendidikan/perpustakaan-digital/kategori-buku');
    } catch (error) {
      console.error('Error updating kategori buku:', error);
      toast.error('Terjadi kesalahan saat memperbarui kategori buku');
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
          Edit Kategori Buku
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
            label="Nama Kategori Buku"
            placeholder="Masukkan nama kategori buku"
            defaultValue={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

export default EditKategoriBuku;
