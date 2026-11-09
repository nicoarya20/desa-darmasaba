'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import penghargaanState from '@/app/admin/(dashboard)/_state/desa/penghargaan';
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

function EditPenghargaan() {
  const statePenghargaan = useProxy(penghargaanState);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      formData.juara?.trim() !== '' &&
      !isHtmlEmpty(formData.deskripsi) &&
      (file !== null || originalData.imageId !== '') // Either a new file is selected or an existing image exists
    );
  };

  const [originalData, setOriginalData] = useState({
    name: "",
    juara: "",
    deskripsi: "",
    imageId: "",
    imageUrl: "",
  });

  // Lokal formData
  const [formData, setFormData] = useState({
    name: '',
    juara: '',
    deskripsi: '',
    imageId: '',
  });

  // Load data pertama kali
  useEffect(() => {
    const loadPenghargaan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await statePenghargaan.edit.load(id);
        
        if (data) {
          const newForm = {
            name: data.name || "",
            juara: data.juara || "",
            deskripsi: data.deskripsi || "",
            imageId: data.imageId || "",
          };
          setFormData(newForm);

          // simpan juga versi original
          const imageUrl = data.image?.link || "";
          
          setOriginalData({
            ...newForm,
            imageUrl: imageUrl,
          });

          setPreviewImage(imageUrl || null);
        }
      } catch (error) {
        console.error('Error loading penghargaan:', error);
        toast.error('Gagal memuat data penghargaan');
      }
    };

    loadPenghargaan();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      juara: originalData.juara,
      deskripsi: originalData.deskripsi,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  // Submit
  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast.error('Nama penghargaan wajib diisi');
      return;
    }

    if (!formData.juara?.trim()) {
      toast.error('Juara wajib diisi');
      return;
    }

    if (isHtmlEmpty(formData.deskripsi)) {
      toast.error('Deskripsi wajib diisi');
      return;
    }

    if (!file && !originalData.imageId) {
      toast.error('Gambar wajib dipilih');
      return;
    }

    try {
      setIsSubmitting(true);
      // Sync ke global state saat submit
      let imageId = formData.imageId;
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }
        imageId = uploaded.id;
      }

      // Update global state form (baru di sini)
      statePenghargaan.edit.form = {
        ...statePenghargaan.edit.form,
        name: formData.name,
        juara: formData.juara,
        deskripsi: formData.deskripsi,
        imageId,
      }
      await statePenghargaan.edit.update();
      toast.success('Penghargaan berhasil diperbarui!');
      router.push('/admin/pemerintahan/penghargaan');
    } catch (error) {
      console.error('Error updating penghargaan:', error);
      toast.error('Terjadi kesalahan saat memperbarui penghargaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol Back + Title */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Penghargaan
        </Title>
      </Group>

      {/* Card Form */}
      <Paper
        w={{ base: '100%', md: '50%' }}
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
            placeholder="Masukkan judul penghargaan"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          {/* Input Juara */}
          <TextInput
            label="Juara"
            placeholder="Masukkan juara"
            value={formData.juara}
            onChange={(e) => setFormData((prev) => ({ ...prev, juara: e.target.value }))}
            required
          />

          {/* Upload Gambar */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Penghargaan
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
              <Box pos="relative" mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Box>
                  <Image
                    src={previewImage.startsWith('http') ? previewImage : `${window.location.origin}${previewImage}`}
                    alt="Preview Gambar"
                    radius="md"
                    style={{
                      maxHeight: 200,
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                    }}
                    loading="lazy"
                  />
                </Box>

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

          {/* Deskripsi */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }))
              }
            />
          </Box>

          {/* Tombol Simpan */}
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

export default EditPenghargaan;
