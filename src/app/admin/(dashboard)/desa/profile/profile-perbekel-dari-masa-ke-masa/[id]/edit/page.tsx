'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPerbekelDariMasaKeMasa() {
  const state = useProxy(stateProfileDesa.mantanPerbekel);
  const router = useRouter();
  const params = useParams();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nama: state.update.form.nama || '',
    daerah: state.update.form.daerah || '',
    periode: state.update.form.periode || '',
    imageId: state.update.form.imageId || ''
  });

  useEffect(() => {
    const loadFoto = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await state.update.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
            daerah: data.daerah || '',
            periode: data.periode || '',
            imageId: data.imageId || ''
          });
          if (data?.imageGalleryFoto?.link) setPreviewImage(data.imageGalleryFoto.link);
        }
      } catch (error) {
        console.error('Error loading foto:', error);
        toast.error('Gagal memuat data foto');
      }
    };
    loadFoto();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      state.update.form = { ...state.update.form, ...formData };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name,
        });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error("Gagal upload gambar");
        state.update.form.imageId = uploaded.id;
      }

      await state.update.update();
      toast.success('Perbekel dari masa ke masa berhasil diperbarui!');
      router.push('/admin/desa/profile/profile-perbekel-dari-masa-ke-masa');
    } catch (error) {
      console.error('Error updating perbekel dari masa ke masa:', error);
      toast.error('Terjadi kesalahan saat memperbarui perbekel dari masa ke masa');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Perbekel Dari Masa Ke Masa
        </Title>
      </Group>

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
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Foto Perbekel
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': [] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color={colors['blue-button']} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="red" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="#868e96" stroke={1.5} />
                </Dropzone.Idle>
                <Stack gap="xs" align="center">
                  <Text size="md" fw={500}>
                    Seret gambar atau klik untuk memilih file
                  </Text>
                  <Text size="sm" c="dimmed">
                    Maksimal 5MB, format gambar wajib
                  </Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{
                    maxHeight: 220,
                    objectFit: 'contain',
                    border: `1px solid ${colors['blue-button']}`,
                  }}
                  loading='lazy'
                />
              </Box>
            )}
          </Box>

          <TextInput
            label="Daerah"
            placeholder="Masukkan daerah"
            value={formData.daerah}
            onChange={(e) => setFormData({ ...formData, daerah: e.target.value })}
            required
          />

          <TextInput
            label="Periode"
            placeholder="Masukkan periode"
            value={formData.periode}
            onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
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

export default EditPerbekelDariMasaKeMasa;
