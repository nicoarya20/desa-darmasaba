'use client';

import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePotensi() {
  const potensiState = useProxy(potensiDesaState.potensiDesa);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    potensiDesaState.kategoriPotensi.findMany.load();
  }, []);

  const handleSubmit = async () => {
    if (!file) return toast.warn('Pilih file gambar terlebih dahulu');

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error('Gagal upload gambar');
    }

    potensiState.create.form.imageId = uploaded.id;

    await potensiState.create.create();

    resetForm();
    router.push('/admin/desa/potensi/list-potensi');
  };

  const resetForm = () => {
    potensiState.create.form = {
      name: '',
      deskripsi: '',
      kategoriId: '',
      imageId: '',
      content: '',
    };

    setPreviewImage(null);
    setFile(null);
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
          Tambah Potensi Desa
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
          {/* Judul */}
          <TextInput
            value={potensiState.create.form.name}
            onChange={(val) => (potensiState.create.form.name = val.target.value)}
            label={<Text fz="sm" fw="bold">Judul</Text>}
            placeholder="Masukkan judul potensi"
            required
          />

          {/* Deskripsi */}
          <TextInput
            value={potensiState.create.form.deskripsi}
            onChange={(val) => (potensiState.create.form.deskripsi = val.target.value)}
            label={<Text fz="sm" fw="bold">Deskripsi</Text>}
            placeholder="Masukkan deskripsi singkat"
            required
          />

          {/* Kategori */}
          <Select
            label={<Text fz="sm" fw="bold">Kategori</Text>}
            placeholder="Pilih kategori"
            value={potensiState.create.form.kategoriId || ""}
            onChange={(val) => {
              potensiState.create.form.kategoriId = val ?? "";
            }}
            data={potensiDesaState.kategoriPotensi.findMany.data?.map((item) => ({
              value: item.id,
              label: item.nama,
            }))}
          />

          {/* Upload Gambar */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Potensi
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
                  <IconUpload size={48} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
              </Group>
              <Text ta="center" mt="sm" size="sm" color="dimmed">
                Seret gambar atau klik untuk memilih file (maks 5MB)
              </Text>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
                  loading='lazy'
                />
              </Box>
            )}
          </Box>

          {/* Konten Editor */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Konten Lengkap
            </Text>
            <CreateEditor
              value={potensiState.create.form.content}
              onChange={(htmlContent) => {
                potensiState.create.form.content = htmlContent;
              }}
            />
          </Box>

          {/* Tombol Simpan */}
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

export default CreatePotensi;
