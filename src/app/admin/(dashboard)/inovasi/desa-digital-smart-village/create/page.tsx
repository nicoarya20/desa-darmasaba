'use client';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import desaDigitalState from '../../../_state/inovasi/desa-digital';
import { Dropzone } from '@mantine/dropzone';
import ExifOrientationImg from 'react-exif-orientation-img';

export default function CreateDesaDigital() {
  const stateDesaDigital = useProxy(desaDigitalState);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

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
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan tombol kembali */}
      <Group mb="md" align="center">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
            style={{ transition: 'background 0.2s ease' }}
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
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
            defaultValue={stateDesaDigital.create.form.name}
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
              accept={{ 'image/*': [] }}
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
              </Box>
            )}
          </Box>

          {/* Tombol Submit */}
          <Group justify="flex-end" mt="sm">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget.style.transform = 'translateY(-2px)');
                (e.currentTarget.style.boxShadow =
                  '0 6px 20px rgba(79, 172, 254, 0.5)');
              }}
              onMouseLeave={(e) => {
                (e.currentTarget.style.transform = 'translateY(0)');
                (e.currentTarget.style.boxShadow =
                  '0 4px 15px rgba(79, 172, 254, 0.4)');
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
