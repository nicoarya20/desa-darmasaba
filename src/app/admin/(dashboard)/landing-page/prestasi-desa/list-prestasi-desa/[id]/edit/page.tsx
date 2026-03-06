/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { ActionIcon, Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title, Loader } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import colors from '@/con/colors';
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.kategoriId?.trim() !== '' &&
      (formData.imageId?.trim() !== '' || file !== null)
    );
  };

  const [originalData, setOriginalData] = useState({
    name: "",
    deskripsi: "",
    kategoriId: "",
    imageId: "",
    imageUrl: "",
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

          setOriginalData({
            name: data.name,
            deskripsi: data.deskripsi,
            kategoriId: data.kategoriId,
            imageId: data.imageId,
            imageUrl: data.image?.link || "",
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

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      deskripsi: originalData.deskripsi,
      kategoriId: originalData.kategoriId,
      imageId: originalData.imageId,
    });
    setPreviewFile(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };


  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
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
           data={prestasiState.kategoriPrestasi.findMany.data?.map((item) => ({
             label: item.name,
             value: item.id,
           })) || []}
           value={formData.kategoriId || null}
           onChange={(val: string | null) => {
             if (val) {
               const selected = prestasiState.kategoriPrestasi.findMany.data?.find(
                 (item) => item.id === val
               );
               if (selected) {
                 setFormData({ ...formData, kategoriId: selected.id });
               }
             } else {
               setFormData({ ...formData, kategoriId: '' });
             }
           }}
           searchable
           clearable
           nothingFoundMessage="Tidak ditemukan"
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
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept><IconUpload size={48} color={colors['blue-button']} stroke={1.5} /></Dropzone.Accept>
                <Dropzone.Reject><IconX size={48} color="red" stroke={1.5} /></Dropzone.Reject>
                <Dropzone.Idle><IconPhoto size={48} color="#868e96" stroke={1.5} /></Dropzone.Idle>
                <Stack gap="xs" align="center">
                  <Text size="md" fw={500}>Seret gambar atau klik untuk memilih file</Text>
                  <Text size="sm" c="dimmed">Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp</Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewFile && (
              <Box pos="relative" mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={previewFile}
                  alt="Preview Gambar"
                  radius="md"
                  style={{ maxHeight: 220, objectFit: 'contain', border: `1px solid ${colors['blue-button']}` }}
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
                    setPreviewFile(null);
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

          {/* ======= Tombol Aksi ======= */}
          <Group justify="right">
            {/* Tombol Batal */}
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
            </Button>

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? 'linear-gradient(135deg, #cccccc, #999999)'
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
