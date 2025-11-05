/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes';
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
  Title
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconFile, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditAPBDes() {
  const apbdesState = useProxy(apbdes);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: '',
    jumlah: '',
    imageId: '',
    fileId: ''
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await apbdesState.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            jumlah: data.jumlah || '',
            imageId: data.imageId || '',
            fileId: data.fileId || ''
          });
          setPreviewImage(data.image?.link || null);
          setPreviewDoc(data.file?.link || null);
        }
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data APBDes');
      }
    };

    loadData();
  }, [params?.id]);

  // Generic Dropzone handler
  const handleDrop = (fileType: 'image' | 'doc') => (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (fileType === 'image') {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setDocFile(file);
      setPreviewDoc(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      // Update global state with local form data first
      apbdesState.edit.form = { ...apbdesState.edit.form, ...formData };

      // Helper function for uploading file
      const uploadFile = async (file: File | null) => {
        if (!file) return null;
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) throw new Error('Upload gagal');
        return uploaded.id;
      };

      // Upload files if selected
      const uploadedImageId = await uploadFile(imageFile);
      const uploadedDocId = await uploadFile(docFile);

      if (uploadedImageId) apbdesState.edit.form.imageId = uploadedImageId;
      if (uploadedDocId) apbdesState.edit.form.fileId = uploadedDocId;

      await apbdesState.edit.update();
      toast.success('APBDes berhasil diperbarui!');
      router.push('/admin/landing-page/apbdes');
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memperbarui APBDes');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit APBDes
        </Title>
      </Group>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" style={{ border: '1px solid #e0e0e0' }}>
        <Stack gap="md">
          {/* Controlled Inputs */}
          <TextInput
            label="Nama APBDes"
            placeholder="Masukkan nama APBDes"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextInput
            label="Jumlah Anggaran"
            placeholder="Masukkan jumlah anggaran"
            value={formData.jumlah}
            onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
            required
          />

          {/* Image Dropzone */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>Gambar APBDes</Text>
            <Dropzone
              onDrop={handleDrop('image')}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': [] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept><IconUpload size={48} color={colors['blue-button']} stroke={1.5} /></Dropzone.Accept>
                <Dropzone.Reject><IconX size={48} color="red" stroke={1.5} /></Dropzone.Reject>
                <Dropzone.Idle><IconPhoto size={48} color="#868e96" stroke={1.5} /></Dropzone.Idle>
                <Stack gap="xs" align="center">
                  <Text size="md" fw={500}>Seret gambar atau klik untuk memilih file</Text>
                  <Text size="sm" c="dimmed">Maksimal 5MB, format gambar wajib</Text>
                </Stack>
              </Group>
            </Dropzone>
            {previewImage && (
              <Box mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Image src={previewImage} alt="Preview Gambar" radius="md" style={{ maxHeight: 300, objectFit: 'contain', border: `1px solid ${colors['blue-button']}` }} loading="lazy" />
              </Box>
            )}
          </Box>

          {/* Document Dropzone */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>Dokumen APBDes</Text>
            <Dropzone
              onDrop={handleDrop('doc')}
              onReject={() => toast.error('File tidak valid, gunakan format dokumen')}
              maxSize={10 * 1024 ** 2}
              accept={{
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/vnd.ms-excel': ['.xls'],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={150}>
                <Dropzone.Accept><IconUpload size={48} color={colors['blue-button']} stroke={1.5} /></Dropzone.Accept>
                <Dropzone.Reject><IconX size={48} color="red" stroke={1.5} /></Dropzone.Reject>
                <Dropzone.Idle><IconFile size={48} color="#868e96" stroke={1.5} /></Dropzone.Idle>
                <Stack gap="xs" align="center">
                  <Text size="md" fw={500}>Seret dokumen atau klik untuk memilih file</Text>
                  <Text size="sm" c="dimmed">Maksimal 10MB, format PDF/DOC/DOCX/XLS/XLSX</Text>
                </Stack>
              </Group>
            </Dropzone>
            {previewDoc && (
              <Box mt="sm">
                <Text size="sm" c="dimmed" mb="xs">Dokumen terpilih: {docFile?.name || 'Dokumen'}</Text>
                <Button component="a" href={previewDoc} target="_blank" rel="noopener noreferrer" variant="light" leftSection={<IconFile size={16} />} size="sm">
                  Lihat Dokumen
                </Button>
              </Box>
            )}
          </Box>

          <Group justify="right" mt="md">
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

export default EditAPBDes;
