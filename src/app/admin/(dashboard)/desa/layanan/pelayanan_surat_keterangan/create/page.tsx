'use client';

import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateSuratKeterangan() {
  const stateSurat = useProxy(stateLayananDesa.suratKeterangan);
  const [previewImage2, setPreviewImage2] = useState<{ preview: string; file: File } | null>(null);
  const [previewImage, setPreviewImage] = useState<{ preview: string; file: File } | null>(null);
  const router = useRouter();

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
    if (!previewImage) {
      return toast.warn('Pilih file gambar utama terlebih dahulu');
    }

    try {
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
            defaultValue={stateSurat.create.form.name}
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
                  src={previewImage.preview}
                  alt="Preview Gambar Utama"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
                  loading="lazy"
                />
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

            {previewImage2 ? (
              <Box mt="sm" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage2.preview}
                  alt="Preview Gambar Tambahan"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
                  loading="lazy"
                />
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

export default CreateSuratKeterangan;
