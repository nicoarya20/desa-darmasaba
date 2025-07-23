/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKategoriDesaAntiKorupsi() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const stateKategori = useProxy(korupsiState.kategoriDesaAntiKorupsi);

  const [formData, setFormData] = useState({
    name: "",
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
            name: data.name || '',
          });
        }
      } catch (error) {
        console.error("Error loading kategori desa anti korupsi:", error);
        toast.error("Gagal memuat data kategori desa anti korupsi");
      }
    };

    loadKategorikegiatan();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Nama kategori desa anti korupsi tidak boleh kosong');
        return;
      }

      stateKategori.edit.form = {
        name: formData.name.trim(),
      };

      // Safety check tambahan: pastikan ID tidak kosong
      if (!stateKategori.edit.id) {
        stateKategori.edit.id = id; // fallback
      }

      const success = await stateKategori.edit.update();

      if (success) {
        router.push("/admin/landing-page/desa-anti-korupsi/kategori-desa-anti-korupsi");
      }
    } catch (error) {
      console.error("Error updating kategori desa anti korupsi:", error);
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
          <Title order={4}>Edit Kategori Desa Anti Korupsi</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nama Kategori Desa Anti Korupsi</Text>}
            placeholder='Masukkan nama kategori desa anti korupsi'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKategoriDesaAntiKorupsi;
