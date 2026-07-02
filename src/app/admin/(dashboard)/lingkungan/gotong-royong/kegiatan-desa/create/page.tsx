/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
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
  Select,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateKegiatanDesa() {
  const router = useRouter();
  const stateKegiatanDesa = useProxy(gotongRoyongState.kegiatanDesa);
  // Snapshot cabang kategoriKegiatan agar Select re-render saat findMany.load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const kategoriState = useProxy(gotongRoyongState.kategoriKegiatan);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    stateKegiatanDesa.findMany.load();
    gotongRoyongState.kategoriKegiatan.findMany.load();
  }, []);

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
      stateKegiatanDesa.create.form.judul?.trim() !== '' &&
      !isHtmlEmpty(stateKegiatanDesa.create.form.deskripsiSingkat) &&
      stateKegiatanDesa.create.form.partisipan !== null &&
      stateKegiatanDesa.create.form.partisipan >= 0 &&
      stateKegiatanDesa.create.form.tanggal !== null &&
      stateKegiatanDesa.create.form.lokasi?.trim() !== '' &&
      !isHtmlEmpty(stateKegiatanDesa.create.form.deskripsiLengkap) &&
      stateKegiatanDesa.create.form.kategoriKegiatanId?.trim() !== '' &&
      file !== null
    );
  };

  const resetForm = () => {
    stateKegiatanDesa.create.form = {
      judul: '',
      deskripsiSingkat: '',
      deskripsiLengkap: '',
      tanggal: new Date(),
      lokasi: '',
      partisipan: 0,
      imageId: '',
      kategoriKegiatanId: '',
    };
    setPreviewImage(null);
    setFile(null);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!file) {
        return toast.warn('Silakan pilih file gambar terlebih dahulu');
      }

      const res = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      });

      const uploaded = res.data?.data;

      if (!uploaded?.id) {
        return toast.error('Gagal mengunggah gambar, silakan coba lagi');
      }

      stateKegiatanDesa.create.form.imageId = uploaded.id;

      await stateKegiatanDesa.create.create();

      resetForm();
      router.push('/admin/lingkungan/gotong-royong/kegiatan-desa');
    } catch (error) {
      console.error('Error creating kegiatan desa:', error);
      toast.error('Gagal membuat kegiatan desa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Kegiatan Desa
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
          {/* Upload Gambar */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Kegiatan
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
            </Dropzone>

            {previewImage && (
              <Box pos={"relative"} mt="sm" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
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

          {/* Input Form */}
          <TextInput
            label="Judul Kegiatan"
            placeholder="Masukkan judul kegiatan"
            value={stateKegiatanDesa.create.form.judul}
            onChange={(e) => (stateKegiatanDesa.create.form.judul = e.target.value)}
            required
          />
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Singkat
            </Text>
            <CreateEditor
              value={stateKegiatanDesa.create.form.deskripsiSingkat}
              onChange={(val) => (stateKegiatanDesa.create.form.deskripsiSingkat = val)}
            />
          </Box>
          <TextInput
            type="number"
            min={0}
            value={stateKegiatanDesa.create.form.partisipan}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0) {
                stateKegiatanDesa.create.form.partisipan = value;
              }
            }}
            label="Partisipan"
            placeholder="Masukkan jumlah partisipan"
            required
          />
          <TextInput
            label="Tanggal"
            type="date"
            placeholder="Contoh: 2022-01-01"
            value={
              stateKegiatanDesa.create.form.tanggal
                ? stateKegiatanDesa.create.form.tanggal.toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => {
              const dateValue = e.currentTarget.value;
              stateKegiatanDesa.create.form.tanggal = dateValue ? new Date(dateValue) : new Date();
            }}
            required
          />
          <TextInput
            label="Lokasi"
            placeholder="Masukkan lokasi kegiatan"
            value={stateKegiatanDesa.create.form.lokasi}
            onChange={(e) => (stateKegiatanDesa.create.form.lokasi = e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Lengkap
            </Text>
            <CreateEditor
              value={stateKegiatanDesa.create.form.deskripsiLengkap}
              onChange={(val) => (stateKegiatanDesa.create.form.deskripsiLengkap = val)}
            />
          </Box>

          <Select
            label="Kategori Kegiatan"
            placeholder="Pilih kategori kegiatan"
            value={stateKegiatanDesa.create.form.kategoriKegiatanId}
            onChange={(val) => (stateKegiatanDesa.create.form.kategoriKegiatanId = val ?? '')}
            data={
              kategoriState.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama,
              })) || []
            }
            required
          />

          {/* Submit */}
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

export default CreateKegiatanDesa;
