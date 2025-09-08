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
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import puskesmasState from '../../../_state/kesehatan/puskesmas/puskesmas';

function CreatePuskesmas() {
  const statePuskesmas = useProxy(puskesmasState);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const resetForm = () => {
    statePuskesmas.create.form = {
      name: '',
      alamat: '',
      jam: {
        workDays: '',
        weekDays: '',
        holiday: '',
      },
      kontak: {
        kontakPuskesmas: '',
        email: '',
        facebook: '',
        kontakUGD: '',
      },
      imageId: '',
      image: undefined,
    };
    setFile(null);
    setPreviewImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      return toast.warn('Pilih file gambar terlebih dahulu');
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error('Gagal upload gambar');
    }

    statePuskesmas.create.form.imageId = uploaded.id;
    await statePuskesmas.create.submit();

    toast.success('Data berhasil disimpan');
    resetForm();
    router.push('/admin/kesehatan/puskesmas');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md" component="form" onSubmit={handleSubmit}>
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Data Puskesmas
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
            label="Nama Puskesmas"
            placeholder="Masukkan nama puskesmas"
            value={statePuskesmas.create.form.name}
            onChange={(e) => (statePuskesmas.create.form.name = e.target.value)}
            required
          />
          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat"
            value={statePuskesmas.create.form.alamat}
            onChange={(e) => (statePuskesmas.create.form.alamat = e.target.value)}
            required
          />
          <TextInput
            label="Jam Buka"
            placeholder="Masukkan jam buka"
            value={statePuskesmas.create.form.jam.workDays}
            onChange={(e) => (statePuskesmas.create.form.jam.workDays = e.target.value)}
          />
          <TextInput
            label="Jam Tutup"
            placeholder="Masukkan jam tutup"
            value={statePuskesmas.create.form.jam.weekDays}
            onChange={(e) => (statePuskesmas.create.form.jam.weekDays = e.target.value)}
          />
          <TextInput
            label="Holiday"
            placeholder="Masukkan hari libur"
            value={statePuskesmas.create.form.jam.holiday}
            onChange={(e) => (statePuskesmas.create.form.jam.holiday = e.target.value)}
          />

          <TextInput
            label="Kontak Puskesmas"
            placeholder="Masukkan kontak puskesmas"
            value={statePuskesmas.create.form.kontak.kontakPuskesmas}
            onChange={(e) =>
              (statePuskesmas.create.form.kontak.kontakPuskesmas = e.target.value)
            }
          />
          <TextInput
            label="Email"
            placeholder="Masukkan email"
            value={statePuskesmas.create.form.kontak.email}
            onChange={(e) => (statePuskesmas.create.form.kontak.email = e.target.value)}
          />
          <TextInput
            label="Facebook"
            placeholder="Masukkan facebook"
            value={statePuskesmas.create.form.kontak.facebook}
            onChange={(e) => (statePuskesmas.create.form.kontak.facebook = e.target.value)}
          />
          <TextInput
            label="Kontak UGD"
            placeholder="Masukkan kontak UGD"
            value={statePuskesmas.create.form.kontak.kontakUGD}
            onChange={(e) => (statePuskesmas.create.form.kontak.kontakUGD = e.target.value)}
          />

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
              <Group justify="center" gap="xl" mih={200} style={{ pointerEvents: 'none' }}>
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
                />
              </Box>
            )}
          </Box>

          {/* Action Button */}
          <Group justify="right">
            <Button
              type="submit"
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

export default CreatePuskesmas;
