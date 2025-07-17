/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditJenisPengaduan() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const state = useProxy(layananonlineDesa.jenisPengaduan);

  const [formData, setFormData] = useState({
    nama: "",
  });

  useEffect(() => {
    const loadJenisPengaduan = async () => {
      if (!id) return;

      try {
        const data = await state.edit.load(id);

        if (data) {
          // pastikan id-nya masuk ke state edit
          state.edit.id = id;
          setFormData({
            nama: data.nama || '',
          });
        }
      } catch (error) {
        console.error("Error loading jenis pengaduan:", error);
        toast.error("Gagal memuat data jenis pengaduan");
      }
    };

    loadJenisPengaduan();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!formData.nama.trim()) {
        toast.error('Nama jenis pengaduan tidak boleh kosong');
        return;
      }

      state.edit.form = {
        nama: formData.nama.trim(),
      };

      // Safety check tambahan: pastikan ID tidak kosong
      if (!state.edit.id) {
        state.edit.id = id; // fallback
      }

      const success = await state.edit.update();

      if (success) {
        router.push("/admin/inovasi/layanan-online-desa/jenis-pengaduan");
      }
    } catch (error) {
      console.error("Error updating jenis pengaduan:", error);
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
          <Title order={4}>Edit Jenis Pengaduan</Title>
          <TextInput
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nama Jenis Pengaduan</Text>}
            placeholder='Masukkan nama jenis pengaduan'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditJenisPengaduan;
