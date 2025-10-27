/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKematian() {
  const editState = useProxy(persentaseKelahiranKematian.kematian);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    nama: '',
    tanggal: '',
    jenisKelamin: '',
    alamat: '',
    penyebab: '',
  });

  // Load data saat mount
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
            tanggal: data.tanggal || '',
            jenisKelamin: data.jenisKelamin || '',
            alamat: data.alamat || '',
            penyebab: data.penyebab || '',
          });
        }
      } catch (error) {
        console.error('Error loading data kematian:', error);
        toast.error('Gagal memuat data kematian');
      }
    };

    loadData();
  }, [params?.id]);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Update global state saat submit
      editState.edit.form = { ...editState.edit.form, ...formData };
      await editState.edit.update();
      toast.success('Data kematian berhasil diperbarui!');
      router.push(
        '/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian'
      );
    } catch (error) {
      console.error('Error updating data kematian:', error);
      toast.error('Terjadi kesalahan saat memperbarui data kematian');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Data Kematian
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
            label="Nama"
            placeholder="Masukkan nama"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            required
          />

          <TextInput
            type="date"
            label="Tanggal"
            placeholder="Masukkan tanggal"
            value={formData.tanggal}
            onChange={(e) => handleChange('tanggal', e.target.value)}
            required
          />

          <TextInput
            label="Jenis Kelamin"
            placeholder="Masukkan jenis kelamin"
            value={formData.jenisKelamin}
            onChange={(e) => handleChange('jenisKelamin', e.target.value)}
            required
          />

          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat"
            value={formData.alamat}
            onChange={(e) => handleChange('alamat', e.target.value)}
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Penyebab
            </Text>
            <EditEditor
              value={formData.penyebab}
              onChange={(htmlContent) => handleChange('penyebab', htmlContent)}
            />
          </Box>

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

export default EditKematian;
