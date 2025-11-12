/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import penangananDarurat from '@/app/admin/(dashboard)/_state/kesehatan/penanganan-darurat/penangananDarurat';
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
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPenangananDarurat() {
  const penangananDaruratState = useProxy(penangananDarurat)
  const router = useRouter();
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    deskripsi: '',
    imageId: '',
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    deskripsi: '',
    imageId: '',
    imageUrl: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data satu kali saat component mount
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await penangananDaruratState.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
          });

          setOriginalData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
            imageUrl: data.image?.link || '',
          });

          if (data.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (err) {
        console.error('Error loading penanganan darurat:', err);
        toast.error('Gagal memuat data penanganan darurat');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params?.id]);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDrop = (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setFile(selected);
    setPreviewImage(URL.createObjectURL(selected));
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      deskripsi: originalData.deskripsi,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
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

        if (!uploaded?.id) return toast.error("Gagal upload gambar");

        imageId = uploaded.id;
      }

      // update global state sekali saat submit
      penangananDaruratState.edit.form = {
        ...penangananDaruratState.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        imageId,
      };

      await penangananDaruratState.edit.update();
      toast.success("Penanganan darurat berhasil diperbarui!");
      router.push("/admin/kesehatan/penanganan-darurat");
    } catch (err) {
      console.error("Error updating penanganan darurat:", err);
      toast.error("Gagal memperbarui data penanganan darurat");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Penanganan Darurat
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
          <TextInput
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            label="Judul"
            placeholder="Masukkan judul"
            required
          />

          <Box>
            <Text fz="sm" fw="bold">Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) => handleChange('deskripsi', val)}
            />
          </Box>

          <Box>
            <Text fz="sm" fw="bold">Gambar</Text>
            <Dropzone
              onDrop={handleDrop}
              onReject={() => toast.error('File tidak valid.')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
            >
              <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Drag gambar ke sini atau klik untuk pilih file
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Maksimal 5MB dan harus format gambar
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" pos="relative">
                <Image
                  src={previewImage}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
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

          <Group justify="right">
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
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default EditPenangananDarurat;
