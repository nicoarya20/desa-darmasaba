/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import pasarDesaState from '@/app/admin/(dashboard)/_state/ekonomi/pasar-desa/pasar-desa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  Box,
  Button,
  Group,
  Image,
  MultiSelect,
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

type FormData = {
  nama: string;
  harga: number;
  alamatUsaha: string;
  imageId: string;
  rating: number;
  kategoriId: string[];
};

function EditPasarDesa() {
  const pasarState = useProxy(pasarDesaState);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    harga: 0,
    alamatUsaha: '',
    imageId: '',
    rating: 0,
    kategoriId: [],
  });

  // load data awal
  useEffect(() => {
    pasarState.kategoriProduk.findMany.load();

    const loadPasarDesa = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await pasarState.pasarDesa.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
            harga: data.harga || 0,
            alamatUsaha: data.alamatUsaha || '',
            imageId: data.imageId || '',
            rating: data.rating || 0,
            kategoriId: data.KategoriToPasar?.map((k: any) => k.kategoriId) || [],
          });
          if (data.image?.link) setPreviewImage(data.image.link);
        }
      } catch (error) {
        console.error('Error loading pasar desa:', error);
        toast.error(
          error instanceof Error ? error.message : 'Gagal mengambil data pasar desa'
        );
      }
    };

    loadPasarDesa();
  }, [params?.id]);

  const handleChange = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      // upload image kalau ada file baru
      let imageId = formData.imageId;
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        imageId = uploaded.id;
      }

      // update global state hanya saat submit
      pasarState.pasarDesa.edit.form = {
        ...formData,
        imageId,
      };

      await pasarState.pasarDesa.edit.update();
      toast.success('Pasar desa berhasil diperbarui!');
      router.push('/admin/ekonomi/pasar-desa/produk-pasar-desa');
    } catch (error) {
      console.error('Error updating pasar desa:', error);
      toast.error('Terjadi kesalahan saat memperbarui pasar desa');
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
          Edit Pasar Desa
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
          {/* Dropzone upload */}
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

          {/* Controlled Inputs */}
          <TextInput
            label="Nama Produk"
            placeholder="Masukkan nama produk"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            required
          />

          <TextInput
            type="number"
            label="Harga Produk"
            placeholder="Masukkan harga produk"
            value={formData.harga}
            onChange={(e) => handleChange('harga', Number(e.target.value))}
            required
          />

          <TextInput
            type="number"
            min={0}
            max={5}
            step={0.1}
            label="Rating Produk"
            placeholder="Masukkan rating produk (0-5)"
            value={formData.rating}
            onChange={(e) => handleChange('rating', Number(e.target.value))}
            required
          />

          <TextInput
            label="Alamat Usaha"
            placeholder="Masukkan alamat usaha"
            value={formData.alamatUsaha}
            onChange={(e) => handleChange('alamatUsaha', e.target.value)}
            required
          />

          <MultiSelect
            label="Kategori Produk"
            placeholder="Pilih kategori produk"
            value={formData.kategoriId}
            onChange={(val) => handleChange('kategoriId', val)}
            data={
              pasarState.kategoriProduk.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama,
              })) || []
            }
            clearable
            searchable
            required
            error={!formData.kategoriId.length ? 'Pilih minimal satu kategori' : undefined}
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

export default EditPasarDesa;
