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
  Title,
  Loader,
  ActionIcon
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalData, setOriginalData] = useState({
    name: "",
    jumlah: "",
    imageId: "",
    fileId: "",
    imageUrl: "",
    docUrl: "",
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
          const newForm = {
            name: data.name || "",
            jumlah: data.jumlah || "",
            imageId: data.imageId || "",
            fileId: data.fileId || "",
          };
          setFormData(newForm);

          // simpan juga versi original
          setOriginalData({
            ...newForm,
            imageUrl: data.image?.link || "",
            docUrl: data.file?.link || "",
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
      setIsSubmitting(true);
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
      router.push('/admin/landing-page/APBDes');
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memperbarui APBDes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      jumlah: originalData.jumlah,
      imageId: originalData.imageId,
      fileId: originalData.fileId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setImageFile(null);
    setPreviewDoc(originalData.docUrl || null);
    setDocFile(null);
    toast.info("Form dikembalikan ke data awal");
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
                    setImageFile(null);
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
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Text size="sm" c="dimmed" mb="xs">Dokumen terpilih: {docFile?.name || 'Dokumen'}</Text>
                <Button component="a" href={previewDoc} target="_blank" rel="noopener noreferrer" variant="light" leftSection={<IconFile size={16} />} size="sm">
                  Lihat Dokumen
                </Button>
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
                    setPreviewDoc(null);
                    setDocFile(null);
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

export default EditAPBDes;
