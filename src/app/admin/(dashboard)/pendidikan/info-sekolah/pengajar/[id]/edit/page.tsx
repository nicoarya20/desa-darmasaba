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


interface FormPengajar {
  nama: string;
  lembagaId: string;
}

function EditPengajar() {
  const pengajarState = useProxy(infoSekolahPaud.pengajar)
  const params = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState<FormPengajar>({
    nama: '',
    lembagaId: ''
  })

  useEffect(() => {
    const loadPengajar = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await pengajarState.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
            lembagaId: data.lembagaId || '',
          });
        }
      } catch (error) {
        console.error("Error loading pengajar:", error);
        toast.error("Gagal memuat data pengajar");
      }
    }
    infoSekolahPaud.lembagaPendidikan.findMany.load()
    loadPengajar();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      pengajarState.edit.form = {
        ...pengajarState.edit.form,
        nama: formData.nama.trim(),
        lembagaId: formData.lembagaId.trim(),
      }
      await pengajarState.edit.update()
      router.push("/admin/pendidikan/info-sekolah/pengajar");
    } catch (error) {
      console.error("Error updating pengajar:", error);
      toast.error("Terjadi kesalahan saat memperbarui pengajar");
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
          <Title order={3}>Edit Pengajar</Title>
          <TextInput
            value={formData.nama}
            label={<Text fz="sm" fw="bold">Nama Pengajar</Text>}
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

export default EditPengajar;
