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
  Tooltip
} from '@mantine/core';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import programKesehatan from '../../../_state/kesehatan/program-kesehatan/programKesehatan';
import { Dropzone } from '@mantine/dropzone';

function CreateProgramKesehatan() {
  const router = useRouter();
  const programKesehatanState = useProxy(programKesehatan);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    programKesehatanState.create.form = {
      name: "",
      deskripsiSingkat: "",
      deskripsi: "",
      imageId: "",
    };
    setPreviewImage(null);
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!programKesehatanState.create.form.name) {
      return toast.warn("Judul wajib diisi");
    }
    if (!programKesehatanState.create.form.deskripsiSingkat) {
      return toast.warn("Deskripsi singkat wajib diisi");
    }
    if (!file) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error("Gagal upload gambar");
    }

    programKesehatanState.create.form.imageId = uploaded.id;
    await programKesehatanState.create.create();

    resetForm();
    router.push("/admin/kesehatan/program-kesehatan");
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
          Tambah Program Kesehatan
        </Title>
      </Group>

      {/* Form Card */}
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
            value={programKesehatanState.create.form.name}
            onChange={(val) => {
              programKesehatanState.create.form.name = val.target.value;
            }}
            label="Judul"
            placeholder="Masukkan judul"
            required
          />

          <TextInput
            value={programKesehatanState.create.form.deskripsiSingkat}
            onChange={(val) => {
              programKesehatanState.create.form.deskripsiSingkat = val.target.value;
            }}
            label="Deskripsi Singkat"
            placeholder="Masukkan deskripsi singkat"
            required
          />

          <Box>
            <Title order={6} mb={6}>
              Deskripsi
            </Title>
            <CreateEditor
              value={programKesehatanState.create.form.deskripsi}
              onChange={(val) => {
                programKesehatanState.create.form.deskripsi = val;
              }}
            />
          </Box>

          <Box>
            <Title order={6} mb={6}>
              Gambar
            </Title>
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

export default CreateProgramKesehatan;
