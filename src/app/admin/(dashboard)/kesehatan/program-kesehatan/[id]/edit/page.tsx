/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import programKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/program-kesehatan/programKesehatan';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    deskripsiSingkat: '',
    deskripsi: '',
    imageId: '',
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    deskripsiSingkat: '',
    deskripsi: '',
    imageId: '',
    imageUrl: ''
  });

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      !isHtmlEmpty(formData.deskripsiSingkat) &&
      !isHtmlEmpty(formData.deskripsi)
    );
  };

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
        setOriginalData({
          name: data.name || '',
          deskripsiSingkat: data.deskripsiSingkat || '',
          deskripsi: data.deskripsi || '',
          imageId: data.imageId || '',
          imageUrl: data.image?.link || '',
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

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      deskripsiSingkat: originalData.deskripsiSingkat,
      deskripsi: originalData.deskripsi,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
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
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
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
              <Box mt="sm" pos={"relative"}>
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

          <Group justify="right">
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
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default EditProgramKesehatan;
