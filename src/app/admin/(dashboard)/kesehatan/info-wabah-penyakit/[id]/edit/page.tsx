/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import infoWabahPenyakit from '@/app/admin/(dashboard)/_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';
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
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditInfoWabahPenyakit() {
  const infoWabahPenyakitState = useProxy(infoWabahPenyakit);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: '',
    deskripsiSingkat: '',
    deskripsi: '',
    imageId: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Helper untuk update field formData
  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load data edit
  useEffect(() => {
    const loadInfoWabahPenyakit = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await infoWabahPenyakitState.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsiSingkat: data.deskripsiSingkat || '',
            deskripsi: data.deskripsiLengkap || '',
            imageId: data.imageId || '',
          });

          if (data.image?.link) setPreviewImage(data.image.link);
        }
      } catch (error) {
        console.error(error);
        toast.error('Gagal memuat data info wabah penyakit');
      }
    };

    loadInfoWabahPenyakit();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      let uploadedImageId = formData.imageId;

      // Upload file kalau ada
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) return toast.error('Gagal upload gambar');
        uploadedImageId = uploaded.id;
      }

      // Update global state
      infoWabahPenyakitState.edit.form = {
        ...infoWabahPenyakitState.edit.form,
        name: formData.name,
        deskripsiSingkat: formData.deskripsiSingkat,
        deskripsiLengkap: formData.deskripsi,
        imageId: uploadedImageId,
      };

      await infoWabahPenyakitState.edit.update();
      toast.success('Info wabah penyakit berhasil diperbarui!');
      router.push('/admin/kesehatan/info-wabah-penyakit');
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat memperbarui info wabah penyakit');
    }
  };

  const handleDrop = (files: File[]) => {
    const selectedFile = files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
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
          Edit Info Wabah Penyakit
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
          <TextInput
            value={formData.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)}
            label="Judul"
            placeholder="Masukkan judul"
            required
          />

          <TextInput
            value={formData.deskripsiSingkat}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('deskripsiSingkat', e.target.value)
            }
            label="Deskripsi Singkat"
            placeholder="Masukkan deskripsi singkat"
            required
          />

          <Box>
            <Text fz="sm" fw="bold">
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) => updateField('deskripsi', val)}
            />
          </Box>

          <Box>
            <Text fz="sm" fw="bold">
              Gambar
            </Text>
            <Dropzone
              onDrop={handleDrop}
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

export default EditInfoWabahPenyakit;
