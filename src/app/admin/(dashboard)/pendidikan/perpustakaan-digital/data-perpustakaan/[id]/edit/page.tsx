/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { toast } from 'react-toastify';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';

function EditPerpustakaanDigital() {
  const router = useRouter();
  const params = useParams();
  const editState = useProxy(perpustakaanDigitalState.dataPerpustakaan);

  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategoriId: '',
    imageId: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Load kategori & data awal
  useEffect(() => {
    perpustakaanDigitalState.kategoriBuku.findMany.load();

    const loadData = async () => {
      const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
      if (!id) return;

      try {
        const data = await editState.update.load(id);
        if (!data) return;

        setFormData({
          judul: data.judul || '',
          deskripsi: data.deskripsi || '',
          kategoriId: data.kategoriId || '',
          imageId: data.imageId || '',
        });

        if (data.image?.link) setPreviewImage(data.image.link);
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : 'Gagal memuat data perpustakaan');
      }
    };

    loadData();
  }, [params?.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Update global state hanya pas submit
      editState.update.form = { ...editState.update.form, ...formData };

      // Upload file jika ada
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        editState.update.form.imageId = uploaded.id;
      }

      await editState.update.update();
      toast.success('Data perpustakaan berhasil diperbarui!');
      router.push('/admin/pendidikan/perpustakaan-digital/data-perpustakaan');
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat memperbarui data perpustakaan');
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
          Edit Data Perpustakaan Digital
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
          {/* Dropzone Image */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selected = files[0];
                if (selected) {
                  setFile(selected);
                  setPreviewImage(URL.createObjectURL(selected));
                }
              }}
              onReject={() => toast.error('File tidak valid.')}
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
                  alt="Preview"
                  radius="md"
                  style={{ maxHeight: 220, objectFit: 'contain', border: `1px solid ${colors['blue-button']}` }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          {/* Judul */}
          <TextInput
            label="Judul"
            placeholder="Masukkan judul"
            value={formData.judul}
            onChange={(e) => handleInputChange('judul', e.target.value)}
            required
          />

          {/* Deskripsi */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor value={formData.deskripsi} onChange={(val) => handleInputChange('deskripsi', val)} />
          </Box>

          {/* Kategori */}
          <Select
            value={formData.kategoriId}
            onChange={(val) => handleInputChange('kategoriId', val || '')}
            label="Kategori"
            placeholder="Pilih kategori"
            data={perpustakaanDigitalState.kategoriBuku.findMany.data?.map((v) => ({ value: v.id, label: v.name })) || []}
            clearable
            searchable
            required
            error={!formData.kategoriId ? 'Pilih kategori' : undefined}
          />

          {/* Submit Button */}
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

export default EditPerpustakaanDigital;
