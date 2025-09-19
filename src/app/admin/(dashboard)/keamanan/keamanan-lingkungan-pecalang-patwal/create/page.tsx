'use client'
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
  Tooltip,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import {
  IconArrowBack,
  IconPhoto,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import keamananLingkunganState from '../../../_state/keamanan/keamanan-lingkungan';

function CreateKeamananLingkungan() {
  const keamananState = useProxy(keamananLingkunganState);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const resetForm = () => {
    keamananState.create.form = {
      name: '',
      deskripsi: '',
      imageId: '',
    };
    setPreviewImage(null);
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      return toast.warn('Pilih file gambar terlebih dahulu');
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;

    if (!uploaded?.id) {
      return toast.error('Gagal mengupload file');
    }

    keamananState.create.form.imageId = uploaded.id;

    await keamananState.create.create();

    resetForm();
    router.push('/admin/keamanan/keamanan-lingkungan-pecalang-patwal');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Data Keamanan Lingkungan
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
          {/* Upload Gambar */}
          <Box>
            <Text fz="sm" fw="bold">
              Gambar
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid.')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': [] }}
            >
              <Group
                justify="center"
                gap="xl"
                mih={220}
                style={{ pointerEvents: 'none' }}
              >
                <Dropzone.Accept>
                  <IconUpload
                    size={52}
                    color="var(--mantine-color-blue-6)"
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    size={52}
                    color="var(--mantine-color-red-6)"
                    stroke={1.5}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto
                    size={52}
                    color="var(--mantine-color-dimmed)"
                    stroke={1.5}
                  />
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
              <Box mt="sm">
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
              </Box>
            )}
          </Box>

          {/* Input Nama */}
          <TextInput
            value={keamananState.create.form.name}
            onChange={(val) => {
              keamananState.create.form.name = val.target.value;
            }}
            label={<Text fw="bold" fz="sm">Nama Keamanan Lingkungan</Text>}
            placeholder="Masukkan nama Keamanan Lingkungan"
            required
          />

          {/* Input Deskripsi */}
          <Box>
            <Text fw="bold" fz="sm">
              Deskripsi Keamanan Lingkungan
            </Text>
            <CreateEditor
              value={keamananState.create.form.deskripsi}
              onChange={(val) => {
                keamananState.create.form.deskripsi = val;
              }}
            />
          </Box>

          {/* Tombol Submit */}
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

export default CreateKeamananLingkungan;
