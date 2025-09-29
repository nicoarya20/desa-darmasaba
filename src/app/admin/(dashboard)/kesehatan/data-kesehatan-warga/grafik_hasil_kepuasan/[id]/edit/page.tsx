/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import grafikkepuasan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/grafikKepuasan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditGrafikHasilKepuasan() {
  const editState = useProxy(grafikkepuasan);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    nama: editState.update.form.nama || '',
    tanggal: editState.update.form.tanggal || '',
    jenisKelamin: editState.update.form.jenisKelamin || '',
    alamat: editState.update.form.alamat || '',
    penyakit: editState.update.form.penyakit || '',
  });

  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.update.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
            tanggal: data.tanggal || '',
            jenisKelamin: data.jenisKelamin || '',
            alamat: data.alamat || '',
            penyakit: data.penyakit || '',
          });
        }
      } catch (error) {
        console.error("Error loading grafik hasil kepuasan:", error);
        toast.error("Gagal memuat data grafik hasil kepuasan");
      }
    };

    loadData();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      editState.update.form = {
        ...editState.update.form,
        ...formData,
      };
      await editState.update.submit();
      toast.success('Grafik hasil kepuasan berhasil diperbarui!');
      router.push('/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan');
    } catch (error) {
      console.error('Error updating grafik hasil kepuasan:', error);
      toast.error('Terjadi kesalahan saat memperbarui grafik hasil kepuasan');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Grafik Hasil Kepuasan
        </Title>
      </Group>

      {/* Form */}
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
            defaultValue={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            label="Nama"
            placeholder="Masukkan nama"
            required
          />
          <TextInput
            type="date"
            defaultValue={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
            label="Tanggal"
            placeholder="Masukkan tanggal"
            required
          />
          <TextInput
            defaultValue={formData.jenisKelamin}
            onChange={(e) =>
              setFormData({ ...formData, jenisKelamin: e.target.value })
            }
            label="Jenis Kelamin"
            placeholder="Masukkan jenis kelamin"
            required
          />
          <TextInput
            defaultValue={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            label="Alamat"
            placeholder="Masukkan alamat"
            required
          />
          <TextInput
            defaultValue={formData.penyakit}
            onChange={(e) => setFormData({ ...formData, penyakit: e.target.value })}
            label="Penyakit"
            placeholder="Masukkan penyakit"
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

export default EditGrafikHasilKepuasan;
