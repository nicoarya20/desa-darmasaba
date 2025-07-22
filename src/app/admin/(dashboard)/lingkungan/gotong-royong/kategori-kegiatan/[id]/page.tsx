/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
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
    nama: "",
  });

  useEffect(() => {
    const loadKategorikegiatan = async () => {
      if (!id) return;

      try {
        const data = await stateKategori.edit.load(id);

        if (data) {
          // pastikan id-nya masuk ke state edit
          stateKategori.edit.id = id;
          setFormData({
            nama: data.nama || '',
          });
        }
      } catch (error) {
        console.error("Error loading kategori kegiatan:", error);
        toast.error("Gagal memuat data kategori kegiatan");
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

      stateKategori.edit.form = {
        nama: formData.nama.trim(),
      };

      // Safety check tambahan: pastikan ID tidak kosong
      if (!stateKategori.edit.id) {
        stateKategori.edit.id = id; // fallback
      }

      const success = await stateKategori.edit.update();

      if (success) {
        router.push("/admin/lingkungan/gotong-royong/kategori-kegiatan");
      }
    } catch (error) {
      console.error("Error updating kategori kegiatan:", error);
      // toast akan ditampilkan dari fungsi update
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Kategori kegiatan</Title>
          <TextInput
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nama Kategori kegiatan</Text>}
            placeholder='Masukkan nama kategori kegiatan'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKategoriKegiatan;
