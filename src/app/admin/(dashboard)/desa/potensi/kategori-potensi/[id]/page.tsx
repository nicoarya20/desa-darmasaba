/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKategoriPotensi() {
  const editState = useProxy(potensiDesaState.kategoriPotensi)
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
      nama: editState.update.form.nama || '',
    });

  useEffect(() => {
      const loadKategori = async () => {
        const id = params?.id as string;
        if (!id) return;
  
        try {
          const data = await editState.update.load(id); // akses langsung, bukan dari proxy
          if (data) {
            setFormData({
              nama: data.nama || '',
            });
          }
        } catch (error) {
          console.error("Error loading kategori potensi:", error);
          toast.error("Gagal memuat data kategori potensi");
        }
      };
  
      loadKategori();
    }, [params?.id]);

    const handleSubmit = async () => {
      try {
        editState.update.form = {
          ...editState.update.form,
          nama: formData.nama,
        };
        await editState.update.update();
        toast.success('Kategori Potensi berhasil diperbarui!');
        router.push('/admin/desa/potensi/kategori-potensi');
      } catch (error) {
        console.error('Error updating kategori potensi:', error);
        toast.error('Terjadi kesalahan saat memperbarui kategori potensi');
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
          <Title order={3}>Edit Kategori Potensi</Title>
          <TextInput
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Nama Kategori Potensi</Text>}
            placeholder="masukkan nama kategori potensi"
          />

          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKategoriPotensi;
