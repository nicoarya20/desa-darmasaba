/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Loader,
  MultiSelect,
  Paper,
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
import pasarDesaState from '../../../../_state/ekonomi/pasar-desa/pasar-desa';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';

export default function CreatePasarDesa() {
  const router = useRouter();
  const statePasar = useProxy(pasarDesaState);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
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
      statePasar.pasarDesa.create.form.nama?.trim() !== '' &&
      statePasar.pasarDesa.create.form.harga !== null &&
      statePasar.pasarDesa.create.form.harga > 0 &&
      !isHtmlEmpty(statePasar.pasarDesa.create.form.deskripsi) &&
      file !== null
    );
  };

  useEffect(() => {
    statePasar.kategoriProduk.findManyAll.load();
  }, []);

  const resetForm = () => {
    statePasar.pasarDesa.create.form = {
      nama: '',
      harga: 0,
      alamatUsaha: '',
      imageId: '',
      rating: 0,
      kategoriId: [],
      kontak: '',
      deskripsi: ''
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

      statePasar.pasarDesa.create.form.imageId = uploaded.id;
      await statePasar.pasarDesa.create.create();

      resetForm();
      router.push('/admin/ekonomi/pasar-desa/produk-pasar-desa');
    } catch (error) {
      console.error('Error creating kategori produk:', error);
      toast.error('Gagal membuat kategori produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header dengan tombol kembali */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Produk Pasar Desa
        </Title>
      </Group>

      {/* Card Form */}
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
              Gambar Produk
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

          {/* Nama Produk */}
          <TextInput
            label="Nama Produk"
            placeholder="Masukkan nama produk"
            value={statePasar.pasarDesa.create.form.nama}
            onChange={(e) => (statePasar.pasarDesa.create.form.nama = e.target.value)}
            required
          />

          {/* Harga Produk */}
          <TextInput
            type="number"
            label="Harga Produk"
            placeholder="Masukkan harga produk"
            value={statePasar.pasarDesa.create.form.harga}
            onChange={(e) => (statePasar.pasarDesa.create.form.harga = Number(e.target.value))}
            required
          />

          {/* Rating */}
          <TextInput
            type="number"
            min={0}
            max={5}
            step={0.1}
            label="Rating Produk (0–5)"
            placeholder="Masukkan rating produk"
            value={statePasar.pasarDesa.create.form.rating}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0 && value <= 5) {
                statePasar.pasarDesa.create.form.rating = value;
              }
            }}
          />

          {/* Alamat Usaha */}
          <TextInput
            label="Alamat Usaha"
            placeholder="Masukkan alamat usaha"
            value={statePasar.pasarDesa.create.form.alamatUsaha}
            onChange={(e) => (statePasar.pasarDesa.create.form.alamatUsaha = e.target.value)}
          />

          {/* Kontak */}
          <TextInput
            label="Kontak"
            type="number"
            placeholder="Masukkan kontak"
            value={statePasar.pasarDesa.create.form.kontak}
            onChange={(e) => (statePasar.pasarDesa.create.form.kontak = e.target.value)}
          />

          {/* Kategori Produk */}
          <MultiSelect
            label="Kategori Produk"
            placeholder="Pilih kategori produk"
            value={statePasar.pasarDesa.create.form.kategoriId}
            onChange={(val) => (statePasar.pasarDesa.create.form.kategoriId = val)}
            data={
              statePasar.kategoriProduk.findManyAll.data?.map((v) => ({
                value: v.id,
                label: v.nama,
              })) || []
            }
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Produk
            </Text>
            <CreateEditor
              value={statePasar.pasarDesa.create.form.deskripsi}
              onChange={(val) => {
                statePasar.pasarDesa.create.form.deskripsi = val;
              }}
            />
          </Box>

          {/* Tombol Submit */}
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
