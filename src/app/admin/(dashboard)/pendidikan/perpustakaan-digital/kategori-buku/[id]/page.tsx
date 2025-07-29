/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKategoriBuku() {
  const editState = useProxy(perpustakaanDigitalState.kategoriBuku)
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
          console.error("Error loading kategori buku:", error);
          toast.error("Gagal memuat data kategori buku");
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
        toast.success('Kategori Buku berhasil diperbarui!');
        router.push('/admin/pendidikan/perpustakaan-digital/kategori-buku');
      } catch (error) {
        console.error('Error updating kategori buku:', error);
        toast.error('Terjadi kesalahan saat memperbarui kategori buku');
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
          <Title order={3}>Edit Kategori Buku</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Nama Kategori Buku</Text>}
            placeholder="masukkan nama kategori buku"
          />

          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKategoriBuku;
