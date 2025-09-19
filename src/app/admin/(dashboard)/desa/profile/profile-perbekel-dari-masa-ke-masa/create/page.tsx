'use client';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePerbekelDariMasaKeMasa() {
  const state = useProxy(stateProfileDesa.mantanPerbekel);
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    state.create.form = {
      nama: '',
      daerah: '',
      periode: '',
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
    if (!uploaded?.id) return toast.error('Gagal upload gambar');

    state.create.form.imageId = uploaded.id;
    await state.create.create();
    resetForm();
    router.push('/admin/desa/profile/profile-perbekel-dari-masa-ke-masa');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Back button + Title */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Create Perbekel Dari Masa Ke Masa
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
          <TextInput
            label={<Text fw="bold" fz="sm">Nama Perbekel</Text>}
            placeholder="Masukkan nama perbekel"
            value={state.create.form.nama}
            onChange={(e) => (state.create.form.nama = e.target.value)}
            required
          />
          <TextInput
            label={<Text fw="bold" fz="sm">Daerah</Text>}
            placeholder="Masukkan daerah"
            value={state.create.form.daerah}
            onChange={(e) => (state.create.form.daerah = e.target.value)}
            required
          />
          <TextInput
            label={<Text fw="bold" fz="sm">Periode</Text>}
            placeholder="Masukkan periode"
            value={state.create.form.periode}
            onChange={(e) => (state.create.form.periode = e.target.value)}
            required
          />

          {/* Dropzone */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>Gambar Perbekel</Text>
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

            {previewImage && (
              <Box mt="sm" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
                  loading='lazy'
                />
              </Box>
            )}
          </Box>

          {/* Submit */}
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

export default CreatePerbekelDariMasaKeMasa;
