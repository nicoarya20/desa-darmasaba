/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import programKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/program-kesehatan/programKesehatan';
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
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditProgramKesehatan() {
  const programKesehatanState = useProxy(programKesehatan);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    deskripsiSingkat: '',
    deskripsi: '',
    imageId: '',
  });

  // Load data awal
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await programKesehatanState.edit.load(id);
        if (!data) return;

        setFormData({
          name: data.name || '',
          deskripsiSingkat: data.deskripsiSingkat || '',
          deskripsi: data.deskripsi || '',
          imageId: data.imageId || '',
        });

        if (data?.image?.link) setPreviewImage(data.image.link);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data program kesehatan');
      }
    };

    loadData();
  }, [params?.id]);

  // Handler input controlled
  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      const updatedForm = { ...programKesehatanState.edit.form, ...formData };

      // Upload file kalau ada
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error('Gagal upload gambar');

        updatedForm.imageId = uploaded.id;
      }

      programKesehatanState.edit.form = updatedForm;
      await programKesehatanState.edit.update();
      toast.success('Program kesehatan berhasil diperbarui!');
      router.push('/admin/kesehatan/program-kesehatan');
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memperbarui program kesehatan');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Program Kesehatan
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
          {[
            { label: 'Judul', key: 'name', placeholder: 'Masukkan judul' },
          ].map((field) => (
            <TextInput
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              value={formData[field.key as keyof typeof formData]}
              onChange={(e) => handleChange(field.key as keyof typeof formData, e.target.value)}
              required
            />
          ))}

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi Singkat
            </Text>
            <EditEditor
              value={formData.deskripsiSingkat}
              onChange={(val) => handleChange('deskripsiSingkat', val)}
            />
          </Box>

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) => handleChange('deskripsi', val)}
            />
          </Box>

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Gambar
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (!selectedFile) return;
                setFile(selectedFile);
                setPreviewImage(URL.createObjectURL(selectedFile));
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

export default EditProgramKesehatan;
