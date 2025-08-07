/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKategoriBerita() {
  const editState = useProxy(stateDashboardBerita.kategoriBerita)
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
          const data = await editState.update.load(id); // akses langsung, bukan dari proxy
          if (data) {
            setFormData({
              name: data.name || '',
            });
          }
        } catch (error) {
          console.error("Error loading kategori Berita:", error);
          toast.error("Gagal memuat data kategori Berita");
        }
      };
  
      loadKategori();
    }, [params?.id]);

    const handleSubmit = async () => {
      try {
        editState.update.form = {
          ...editState.update.form,
          name: formData.name,
        };
        await editState.update.update();
        toast.success('Kategori Berita berhasil diperbarui!');
        router.push('/admin/desa/berita/kategori-berita');
      } catch (error) {
        console.error('Error updating kategori Berita:', error);
        toast.error('Terjadi kesalahan saat memperbarui kategori Berita');
      }
    };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>
      <Paper bg={"white"} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit Kategori Berita</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Nama Kategori Berita</Text>}
            placeholder="masukkan nama kategori Berita"
          />

          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKategoriBerita;
