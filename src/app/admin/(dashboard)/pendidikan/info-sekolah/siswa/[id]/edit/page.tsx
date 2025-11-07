/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
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
  const siswaState = useProxy(infoSekolahPaud.siswa);
  const params = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<FormSiswa>({
    nama: '',
    lembagaId: '',
  });

  // Load data siswa
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
        console.error('Error loading siswa:', error);
        toast.error('Gagal memuat data siswa');
      }
    };

    infoSekolahPaud.lembagaPendidikan.findMany.load();
    loadSiswa();
  }, [params?.id]);

  // Handler update local formData
  const handleChange = (field: keyof FormSiswa, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit ke global state
  const handleSubmit = async () => {
    try {
      siswaState.edit.form = {
        ...siswaState.edit.form,
        nama: formData.nama.trim(),
        lembagaId: formData.lembagaId.trim(),
      };
      await siswaState.edit.update();
      toast.success('Data siswa berhasil diperbarui!');
      router.push('/admin/pendidikan/info-sekolah/siswa');
    } catch (error) {
      console.error('Error updating siswa:', error);
      toast.error('Terjadi kesalahan saat memperbarui siswa');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Siswa
        </Title>
      </Group>

      {/* Form Card */}
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
            label={<Text fz="sm" fw="bold">Nama Siswa</Text>}
            placeholder="Masukkan nama siswa"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            required
          />

          <Select
            label={<Text fz="sm" fw="bold">Lembaga Pendidikan</Text>}
            placeholder="Pilih lembaga pendidikan"
            data={
              infoSekolahPaud.lembagaPendidikan.findMany.data?.map((k) => ({
                value: k.id,
                label: k.nama,
              })) ?? []
            }
            value={formData.lembagaId}
            onChange={(val) => handleChange('lembagaId', val ?? '')}
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

export default EditSiswa;
