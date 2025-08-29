/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import { Box, Button, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


interface FormSiswa {
  nama: string;
  lembagaId: string;
}

function EditSiswa() {
  const siswaState = useProxy(infoSekolahPaud.siswa)
  const params = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState<FormSiswa>({
    nama: '',
    lembagaId: ''
  })

  useEffect(() => {
    const loadSiswa = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await siswaState.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
            lembagaId: data.lembagaId || '',
          });
        }
      } catch (error) {
        console.error("Error loading siswa:", error);
        toast.error("Gagal memuat data siswa");
      }
    }
    infoSekolahPaud.lembagaPendidikan.findMany.load()
    loadSiswa();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      siswaState.edit.form = {
        ...siswaState.edit.form,
        nama: formData.nama.trim(),
        lembagaId: formData.lembagaId.trim(),
      }
      await siswaState.edit.update()
      router.push("/admin/pendidikan/info-sekolah/siswa");
    } catch (error) {
      console.error("Error updating siswa:", error);
      toast.error("Terjadi kesalahan saat memperbarui siswa");
    }
  }

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Edit Siswa</Title>
          <TextInput
            value={formData.nama}
            label={<Text fz="sm" fw="bold">Nama Siswa</Text>}
            placeholder="masukkan nama siswa"
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          />
          <Select
            label="Lembaga Pendidikan"
            data={infoSekolahPaud.lembagaPendidikan.findMany.data?.map(k => ({
              value: k.id,
              label: k.nama
            })) ?? []}
            value={formData.lembagaId}
            onChange={(val) => setFormData({ ...formData, lembagaId: val ?? '' })}
          />
          <Button bg={colors['blue-button']} onClick={handleSubmit} >
            Simpan
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditSiswa;
