/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
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
  Title,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as React from 'react';

// 🔹 Types
interface FormData {
  name: string;
  deskripsi: string;
  imageId: string;
  image2Id: string;
  imageUrl: string;
  image2Url: string;
}

interface FileUploaderProps {
  title: string;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  preview: string | null;
  setPreview: React.Dispatch<React.SetStateAction<string | null>>;
}

// 🔹 File Uploader Component
const FileUploader: React.FC<FileUploaderProps> = ({ 
  title, 
  file, 
  setFile, 
  preview, 
  setPreview 
}) => {
  const handleDrop = (files: File[]) => {
    const selected = files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFile(null);
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Text fw="bold" fz="sm" mb={6}>
        {title}
      </Text>
      <Dropzone
        onDrop={handleDrop}
        onReject={() => toast.error('File tidak valid, gunakan format gambar')}
        maxSize={5 * 1024 ** 2}
        accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
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
              Maksimal 5MB, format .png, .jpg, .jpeg, .webp
            </Text>
          </Stack>
        </Group>
      </Dropzone>

      {preview && (
        <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
          <Image
            src={preview}
            alt="Preview Gambar"
            radius="md"
            style={{
              maxHeight: 200,
              objectFit: 'contain',
              border: '1px solid #ddd',
            }}
          />
          <ActionIcon
            variant="filled"
            color="red"
            radius="xl"
            size="sm"
            pos="absolute"
            top={5}
            right={5}
            onClick={handleRemove}
            style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
          >
            <IconX size={14} />
          </ActionIcon>
        </Box>
      )}
    </Box>
  );
};

// 🔹 Main Component
function EditSuratKeterangan() {
  const router = useRouter();
  const params = useParams();

  // 🧩 State
  const [formData, setFormData] = useState<FormData>({
    name: '',
    deskripsi: '',
    imageId: '',
    image2Id: '',
    imageUrl: '',
    image2Url: '',
  });
  const [originalData, setOriginalData] = useState<FormData>(formData);
  const [file, setFile] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImage2, setPreviewImage2] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🧭 Load Initial Data
  useEffect(() => {
    const loadSurat = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateLayananDesa.suratKeterangan.edit.load(id);
        if (!data) return;

        const mapped: FormData = {
          name: data.name || '',
          deskripsi: data.deskripsi || '',
          imageId: data.imageId || '',
          image2Id: data.image2Id || '',
          imageUrl: data.image?.link || '',
          image2Url: data.image2?.link || ''
        };

        setFormData(mapped);
        setOriginalData(mapped);

        if (data.image?.link) setPreviewImage(data.image.link);
        if (data.image2?.link) setPreviewImage2(data.image2.link);
      } catch (error) {
        console.error('Error loading surat:', error);
        toast.error('Gagal memuat data surat');
      }
    };

    loadSurat();
  }, [params?.id]);

  // 📤 Upload File Helper
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const res = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      });
      const uploaded = res.data?.data;
      return uploaded?.id || null;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  // 🔁 Reset Form
  const handleResetForm = () => {
    setFormData(originalData);
    setPreviewImage(originalData.imageUrl || null);
    setPreviewImage2(originalData.image2Url || null);
    setFile(null);
    setFile2(null);
    toast.info('Form dikembalikan ke data awal');
  };

  // 💾 Submit Handler
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // ✅ Access original state directly (not proxy)
      const originalState = stateLayananDesa.suratKeterangan;

      // Update form data properties individually
      originalState.edit.form.name = formData.name;
      originalState.edit.form.deskripsi = formData.deskripsi;
      originalState.edit.form.imageId = formData.imageId;
      originalState.edit.form.image2Id = formData.image2Id;

      // Upload file 1 if exists
      if (file) {
        const uploadedId = await uploadFile(file);
        if (!uploadedId) {
          toast.error('Gagal upload gambar pertama');
          return;
        }
        originalState.edit.form.imageId = uploadedId;
      }

      // Upload file 2 if exists
      if (file2) {
        const uploadedId = await uploadFile(file2);
        if (!uploadedId) {
          toast.error('Gagal upload gambar kedua');
          return;
        }
        originalState.edit.form.image2Id = uploadedId;
      }

      // Submit update
      await originalState.edit.update();
      toast.success('Surat berhasil diperbarui!');
      router.push('/admin/desa/layanan/pelayanan_surat_keterangan');
    } catch (error) {
      console.error('Error updating surat:', error);
      toast.error('Terjadi kesalahan saat memperbarui surat');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, file, file2, router]);

  // 📝 Form Field Handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleDeskripsiChange = (html: string) => {
    setFormData(prev => ({ ...prev, deskripsi: html }));
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Surat Keterangan
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
          {/* Nama Surat */}
          <TextInput
            label="Nama Surat Keterangan"
            placeholder="Masukkan nama surat keterangan"
            value={formData.name}
            onChange={handleNameChange}
            required
          />

          {/* Deskripsi */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Konten
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={handleDeskripsiChange}
            />
          </Box>

          {/* Gambar 1 */}
          <FileUploader
            title="Gambar Konten Pelayanan"
            file={file}
            setFile={setFile}
            preview={previewImage}
            setPreview={setPreviewImage}
          />

          {/* Gambar 2 */}
          <FileUploader
            title="Gambar Alur Pelayanan Surat"
            file={file2}
            setFile={setFile2}
            preview={previewImage2}
            setPreview={setPreviewImage2}
          />

          {/* Action Buttons */}
          <Group justify="right">
            <Button 
              variant="outline" 
              color="gray" 
              radius="md" 
              onClick={handleResetForm}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              disabled={isSubmitting}
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79,172,254,0.4)',
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

export default EditSuratKeterangan;