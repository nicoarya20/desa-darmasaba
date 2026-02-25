'use client';

import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateSuratKeterangan() {
  const stateSurat = useProxy(stateLayananDesa.suratKeterangan);
  const [previewImage2, setPreviewImage2] = useState<{ preview: string; file: File } | null>(null);
  const [previewImage, setPreviewImage] = useState<{ preview: string; file: File } | null>(null);
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
      stateSurat.create.form.name?.trim() !== '' &&
      !isHtmlEmpty(stateSurat.create.form.deskripsi) &&
      previewImage !== null
    );
  };

  const resetForm = () => {
    stateSurat.create.form = {
      name: '',
      deskripsi: '',
      imageId: '',
      image2Id: '',
    };
    setPreviewImage(null);
    setPreviewImage2(null);
  };

  const handleSubmit = async () => {
    if (!stateSurat.create.form.name?.trim()) {
      toast.error('Nama surat keterangan wajib diisi');
      return;
    }

    if (isHtmlEmpty(stateSurat.create.form.deskripsi)) {
      toast.error('Konten wajib diisi');
      return;
    }

    if (!previewImage) {
      toast.error('Gambar konten pelayanan wajib dipilih');
      return;
    }

    try {
      setIsSubmitting(true);
      // Upload gambar utama
      const res1 = await ApiFetch.api.fileStorage.create.post({
        file: previewImage.file,
        name: `main_${previewImage.file.name}`,
      });

      const uploadedImage1 = res1.data?.data;
      if (!uploadedImage1?.id) {
        return toast.error('Gagal upload gambar utama');
      }

      let uploadedImage2 = null;
      if (previewImage2) {
        const res2 = await ApiFetch.api.fileStorage.create.post({
          file: previewImage2.file,
          name: `secondary_${previewImage2.file.name}`,
        });
        uploadedImage2 = res2.data?.data;
      }

      stateSurat.create.form.imageId = uploadedImage1.id;
      if (uploadedImage2?.id) {
        stateSurat.create.form.image2Id = uploadedImage2.id;
      }

      await stateSurat.create.create();
      resetForm();
      toast.success('Data surat keterangan berhasil ditambahkan');
      router.push('/admin/desa/layanan/pelayanan_surat_keterangan');
    } catch (error) {
      console.error('Error creating surat keterangan:', error);
      toast.error('Terjadi kesalahan saat menambahkan surat keterangan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Surat Keterangan
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
          {/* Nama Surat */}
          <TextInput
            value={stateSurat.create.form.name}
            onChange={(val) => (stateSurat.create.form.name = val.target.value)}
            label="Nama Surat Keterangan"
            placeholder="Masukkan nama surat keterangan"
            required
          />

          {/* Konten */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Konten
            </Text>
            <CreateEditor
              value={stateSurat.create.form.deskripsi}
              onChange={(htmlContent) => {
                stateSurat.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>

          {/* Gambar Konten Pelayanan */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Konten Pelayanan
            </Text>
            <Dropzone
              onDrop={(files) => {
                const file = files[0];
                if (file) {
                  setPreviewImage({
                    file,
                    preview: URL.createObjectURL(file),
                  });
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
            </Dropzone>

            {previewImage && (
              <Box pos={"relative"} mt="sm" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage.preview}
                  alt="Preview Gambar Utama"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
                  loading="lazy"
                />
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

          {/* Gambar Alur Pelayanan Surat */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Alur Pelayanan Surat
            </Text>
            <Dropzone
              onDrop={(files) => {
                const file = files[0];
                if (file) {
                  setPreviewImage2({
                    file,
                    preview: URL.createObjectURL(file),
                  });
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
            </Dropzone>

            {previewImage2 ? (
              <Box pos={"relative"} mt="sm" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage2.preview}
                  alt="Preview Gambar Tambahan"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
                  loading="lazy"
                />
                <ActionIcon
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="sm"
                  pos="absolute"
                  top={5}
                  right={5}
                  onClick={() => {
                    setPreviewImage2(null);
                  }}
                  style={{
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            ) : (
              <Text size="sm" c="dimmed" mt="sm" ta="center">
                Kosongkan jika tidak ada gambar tambahan
              </Text>
            )}
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

export default CreateSuratKeterangan;
