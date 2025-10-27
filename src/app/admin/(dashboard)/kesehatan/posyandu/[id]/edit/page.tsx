/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import posyandustate from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu';
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
  Tooltip,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPosyandu() {
  const statePosyandu = useProxy(posyandustate);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nomor: '',
    deskripsi: '',
    imageId: '',
    jadwalPelayanan: '',
  });

  // Load data posyandu
  useEffect(() => {
    const loadPosyandu = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await statePosyandu.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            nomor: data.nomor || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
            jadwalPelayanan: data.jadwalPelayanan || '',
          });
          if (data?.image?.link) setPreviewImage(data.image.link);
        }
      } catch (error) {
        console.error('Error loading posyandu:', error);
        toast.error('Gagal memuat data posyandu');
      }
    };
    loadPosyandu();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      // Update global state hanya saat submit
      const updatedForm = { ...statePosyandu.edit.form, ...formData };

      // Upload file jika ada
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        updatedForm.imageId = uploaded.id;
      }

      statePosyandu.edit.form = updatedForm;
      await statePosyandu.edit.update();

      toast.success('Posyandu berhasil diperbarui!');
      router.push('/admin/kesehatan/posyandu');
    } catch (error) {
      console.error('Error updating posyandu:', error);
      toast.error('Terjadi kesalahan saat memperbarui posyandu');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Tombol Back */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Posyandu
        </Title>
      </Group>

      {/* Card utama */}
      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          {/* Upload Gambar */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Posyandu
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
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          {/* Input Form */}
          <TextInput
            label="Nama Posyandu"
            placeholder="Masukkan nama posyandu"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextInput
            label="Nomor Posyandu"
            placeholder="Masukkan nomor posyandu"
            value={formData.nomor}
            onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Posyandu
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => setFormData({ ...formData, deskripsi: htmlContent })}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Jadwal Pelayanan
            </Text>
            <EditEditor
              value={formData.jadwalPelayanan}
              onChange={(htmlContent) =>
                setFormData({ ...formData, jadwalPelayanan: htmlContent })
              }
            />
          </Box>

          {/* Tombol Submit */}
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

export default EditPosyandu;
