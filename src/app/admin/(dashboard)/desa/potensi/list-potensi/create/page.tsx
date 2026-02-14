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
  Loader,
  ActionIcon
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      potensiState.create.form.name?.trim() !== '' &&
      !isHtmlEmpty(potensiState.create.form.deskripsi) &&
      potensiState.create.form.kategoriId !== '' &&
      file !== null &&
      !isHtmlEmpty(potensiState.create.form.content)
    );
  };

  useEffect(() => {
    potensiDesaState.kategoriPotensi.findMany.load();
  }, []);

  const handleSubmit = async () => {
    if (!potensiState.create.form.name?.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }
    
    if (isHtmlEmpty(potensiState.create.form.deskripsi)) {
      toast.error('Deskripsi singkat wajib diisi');
      return;
    }
    
    if (!potensiState.create.form.kategoriId) {
      toast.error('Kategori wajib dipilih');
      return;
    }
    
    if (!file) {
      toast.error('Gambar wajib dipilih');
      return;
    }
    
    if (isHtmlEmpty(potensiState.create.form.content)) {
      toast.error('Konten lengkap wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
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
    } catch (error) {
      console.error('Error creating potensi:', error);
      toast.error('Terjadi kesalahan saat menambahkan potensi');
    } finally {
      setIsSubmitting(false);
    }
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
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
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
            label="Judul"
            placeholder="Masukkan judul potensi"
            required
          />

          {/* Deskripsi */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi Singkat
            </Text>
            <CreateEditor
              value={potensiState.create.form.deskripsi}
              onChange={(htmlContent) => {
                potensiState.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>

          {/* Kategori */}
          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            data={potensiDesaState.kategoriPotensi.findMany.data?.map((item) => ({
              label: item.nama,
              value: item.id,
            })) || []}
            value={potensiState.create.form.kategoriId || null}
            onChange={(val: string | null) => {
              if (val) {
                const selected = potensiDesaState.kategoriPotensi.findMany.data?.find(
                  (item) => item.id === val
                );
                if (selected) {
                  potensiState.create.form.kategoriId = selected.id;
                }
              } else {
                potensiState.create.form.kategoriId = '';
              }
            }}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
            required
          />

          {/* <Select
            label="Kategori"
            placeholder="Pilih kategori"
            value={potensiState.create.form.kategoriId || ""}
            onChange={(val) => {
              potensiState.create.form.kategoriId = val ?? "";
            }}
            data={potensiDesaState.kategoriPotensi.findMany.data?.map((item) => ({
              value: item.id,
              label: item.nama,
            }))}
          /> */}

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
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
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
              <Text size="sm" c="dimmed">
                Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp
              </Text>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{
                    maxHeight: 200,
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                  }}
                  loading="lazy"
                />

                {/* Tombol hapus (pojok kanan atas) */}
                <ActionIcon
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="sm"
                  pos="absolute"
                  top={5}
                  right={5}
                  onClick={() => {
                    setPreviewImage(null);
                    setFile(null);
                  }}
                  style={{
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
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
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
            </Button>

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePotensi;
