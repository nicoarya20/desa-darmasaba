/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditJenjangPendidikan() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const stateJenjang = useProxy(infoSekolahPaud.jenjangPendidikan);

  const [formData, setFormData] = useState({
    nama: "",
  });

  useEffect(() => {
    const loadJenjangPendidikan = async () => {
      if (!id) return;

      try {
        const data = await stateJenjang.edit.load(id);

        if (data) {
          // pastikan id-nya masuk ke state edit
          stateJenjang.edit.id = id;
          setFormData({
            nama: data.nama || '',
          });
        }
      } catch (error) {
        console.error("Error loading jenjang pendidikan:", error);
        toast.error("Gagal memuat data jenjang pendidikan");
      }
    };

    loadJenjangPendidikan();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!formData.nama.trim()) {
        toast.error('Nama jenjang pendidikan tidak boleh kosong');
        return;
      }

      stateJenjang.edit.form = {
        nama: formData.nama.trim(),
      };

      // Safety check tambahan: pastikan ID tidak kosong
      if (!stateJenjang.edit.id) {
        stateJenjang.edit.id = id; // fallback
      }

      const success = await stateJenjang.edit.update();

      if (success) {
        router.push("/admin/pendidikan/info-sekolah-paud/jenjang-pendidikan");
      }
    } catch (error) {
      console.error("Error updating jenjang pendidikan:", error);
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
          <Title order={4}>Edit Jenjang Pendidikan</Title>
          <TextInput
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nama Jenjang Pendidikan</Text>}
            placeholder='Masukkan nama jenjang pendidikan'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditJenjangPendidikan;
