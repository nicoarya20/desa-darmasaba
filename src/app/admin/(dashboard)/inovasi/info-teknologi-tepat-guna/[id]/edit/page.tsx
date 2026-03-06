'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import infoTeknoState from '@/app/admin/(dashboard)/_state/inovasi/info-tekno';
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

function EditInfoTeknologiTepatGuna() {
  const stateInfoTekno = useProxy(infoTeknoState);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    deskripsi: '',
    imageId: '',
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    deskripsi: '',
    imageId: '',
    imageUrl: '',
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
      !isHtmlEmpty(formData.deskripsi)
    );
  };

  // Load data pertama kali
  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    const loadData = async () => {
      try {
        const data = await stateInfoTekno.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
          });
          setOriginalData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
            imageUrl: data.image?.link || '',
          });
          if (data?.image?.link) setPreviewImage(data.image.link);
        }
      } catch (error) {
        console.error('Error loading info teknologi tepat guna:', error);
        toast.error('Gagal memuat data info teknologi tepat guna');
      }
    };

    loadData();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      deskripsi: originalData.deskripsi,
      imageId: originalData.imageId,
    });
    setFile(null);
    setPreviewImage(originalData.imageUrl);
    toast.info("Form dikembalikan ke data awal");
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // sync local → global pas submit
      stateInfoTekno.edit.form = {
        ...stateInfoTekno.edit.form,
        ...formData,
      };

      // upload file kalau ada
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name,
        });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error('Gagal upload gambar');
        }

        stateInfoTekno.edit.form.imageId = uploaded.id;
      }

      await stateInfoTekno.edit.update();
      toast.success('Info teknologi tepat guna berhasil diperbarui!');
      router.push('/admin/inovasi/info-teknologi-tepat-guna');
    } catch (error) {
      console.error('Error updating info teknologi tepat guna:', error);
      toast.error('Terjadi kesalahan saat memperbarui info teknologi tepat guna');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol back + title */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Info Teknologi Tepat Guna
        </Title>
      </Group>

      {/* Card form */}
      <Paper
        w={{ base: '100%', md: '60%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          {/* Input Judul */}
          <TextInput
            label="Judul"
            placeholder="Masukkan judul info teknologi tepat guna"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          {/* Upload gambar */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
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
                    Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp
                  </Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box pos={"relative"} mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{
                    maxHeight: 200,
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                  }}
                  loading="lazy"
                />

                {/* Tombol hapus (pojok kanan atas) */}
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

          {/* Deskripsi pakai editor */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }))
              }
            />
          </Box>

          {/* Tombol submit */}
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

export default EditInfoTeknologiTepatGuna;
