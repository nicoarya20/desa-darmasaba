/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useProxy } from 'valtio/utils';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';

import colors from '@/con/colors';
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import ApiFetch from '@/lib/api-fetch';

interface FormPrestasiDesa {
  name: string;
  deskripsi: string;
  kategoriId: string;
  imageId: string;
}

export default function EditPrestasiDesa() {
  const editState = useProxy(prestasiState.prestasiDesa);
  const [formData, setFormData] = useState<FormPrestasiDesa>({
    name: '',
    deskripsi: '',
    kategoriId: '',
    imageId: '',
  });
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const params = useParams();
  const router = useRouter();

  // Load kategori & prestasi desa
  useEffect(() => {
    prestasiState.kategoriPrestasi.findMany.load();

    const loadPrestasi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.edit.load(id);
        if (data) {
          editState.edit.id = id;
          editState.edit.form = {
            name: data.name,
            deskripsi: data.deskripsi,
            kategoriId: data.kategoriId,
            imageId: data.imageId,
          };

          setFormData({
            name: data.name,
            deskripsi: data.deskripsi,
            kategoriId: data.kategoriId,
            imageId: data.imageId,
          });

          if (data.image?.link) setPreviewFile(data.image.link);
        }
      } catch (error) {
        console.error('Error loading prestasi desa:', error);
        toast.error('Gagal memuat data prestasi desa');
      }
    };

    loadPrestasi();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      // Jika ada file baru, upload dulu
      let imageId = formData.imageId;
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        imageId = uploaded.id;
      }

      // Update global state sekaligus
      editState.edit.form = { ...formData, imageId };
      await editState.edit.update();

      toast.success('Prestasi desa berhasil diperbarui!');
      router.push('/admin/landing-page/prestasi-desa/list-prestasi-desa');
    } catch (error) {
      console.error('Error updating prestasi desa:', error);
      toast.error('Terjadi kesalahan saat memperbarui prestasi desa');
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
        <Title order={4} ml="sm" c="dark">Edit Prestasi Desa</Title>
      </Group>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" style={{ border: '1px solid #e0e0e0' }}>
        <Stack gap="md">
          <TextInput
            label="Judul Prestasi"
            placeholder="Masukkan judul prestasi"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>Deskripsi</Text>
            <EditEditor value={formData.deskripsi} onChange={(val) => setFormData({ ...formData, deskripsi: val })} />
          </Box>

          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            value={formData.kategoriId}
            onChange={(val) => setFormData({ ...formData, kategoriId: val ?? '' })}
            data={prestasiState.kategoriPrestasi.findMany.data?.map((v) => ({ value: v.id, label: v.name })) || []}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>Gambar Prestasi</Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewFile(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': [] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept><IconUpload size={48} color={colors['blue-button']} stroke={1.5} /></Dropzone.Accept>
                <Dropzone.Reject><IconX size={48} color="red" stroke={1.5} /></Dropzone.Reject>
                <Dropzone.Idle><IconPhoto size={48} color="#868e96" stroke={1.5} /></Dropzone.Idle>
                <Stack gap="xs" align="center">
                  <Text size="md" fw={500}>Seret gambar atau klik untuk memilih file</Text>
                  <Text size="sm" c="dimmed">Maksimal 5MB, format gambar wajib</Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewFile && (
              <Box mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={previewFile}
                  alt="Preview Gambar"
                  radius="md"
                  style={{ maxHeight: 220, objectFit: 'contain', border: `1px solid ${colors['blue-button']}` }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          <Group justify="right" mt="md">
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
