'use client';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ExifOrientationImg from 'react-exif-orientation-img';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import desaDigitalState from '../../../_state/inovasi/desa-digital';

export default function CreateDesaDigital() {
  const stateDesaDigital = useProxy(desaDigitalState);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    stateDesaDigital.create.form = {
      name: '',
      deskripsi: '',
      imageId: '',
    };
    setPreviewImage(null);
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      return toast.warn('Silakan pilih file gambar terlebih dahulu');
    }

    try {
      setIsSubmitting(true);
      const uploadRes = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      });

      const uploaded = uploadRes.data?.data;
      if (!uploaded?.id) {
        return toast.error('Gagal mengunggah gambar');
      }

      stateDesaDigital.create.form.imageId = uploaded.id;

      const success = await stateDesaDigital.create.create();
      if (success) {
        resetForm();
        router.push('/admin/inovasi/desa-digital-smart-village');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header dengan tombol kembali */}
      <Group mb="md" align="center">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
          style={{ transition: 'background 0.2s ease' }}
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Desa Digital Smart Village
        </Title>
      </Group>

      {/* Card Form */}
      <Paper
        w={{ base: '100%', md: '60%' }}
        bg={colors['white-1']}
        p={{ base: 'md', md: 'xl' }}
        radius="lg"
        shadow="md"
        style={{
          border: '1px solid #eaeaea',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <Stack gap="lg">
          {/* Input Nama */}
          <TextInput
            label="Nama Desa Digital"
            placeholder="Masukkan nama desa digital"
            value={stateDesaDigital.create.form.name}
            onChange={(e) => (stateDesaDigital.create.form.name = e.target.value)}
            radius="md"
            withAsterisk
          />

          {/* Deskripsi */}
          <Box>
            <Text fw={500} fz="sm" mb={6}>
              Deskripsi
            </Text>
            <CreateEditor
              value={stateDesaDigital.create.form.deskripsi}
              onChange={(val) => {
                stateDesaDigital.create.form.deskripsi = val;
              }}
            />
          </Box>

          {/* Upload Gambar */}
          <Box>
            <Text fw={500} fz="sm" mb={6}>
              Gambar Desa Digital
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
              style={{
                border: '2px dashed #cfd8dc',
                backgroundColor: '#fafafa',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
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

            {/* Preview */}
            {previewImage && (
              <Box
                pos={"relative"}
                mt="sm"
                style={{
                  textAlign: 'center',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <ExifOrientationImg
                  src={previewImage}
                  alt="Preview"
                  style={{
                    maxHeight: 220,
                    objectFit: 'cover',
                    border: '1px solid #e0e0e0',
                    borderRadius: 12,
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

          {/* Tombol Submit */}
          <Group justify="right">
            {/* Tombol Batal */}
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
