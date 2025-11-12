'use client'

import colors from '@/con/colors';
import {
  ActionIcon,
  Alert, Box, Button, Center, Group, Image,
  Paper, Stack, Text, TextInput, Title, Loader
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';
import ApiFetch from '@/lib/api-fetch';
import { Dropzone } from '@mantine/dropzone';
import { IconAlertCircle, IconArrowBack, IconImageInPicture, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

function EditPejabatDesa() {
  const allState = useProxy(profileLandingPageState.pejabatDesa);
  const params = useParams();
  const router = useRouter();

  // Local form state
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    imageId: ''
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    position: '',
    imageId: "",
    imageUrl: "",
  });

  // UI states
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) {
        toast.error("ID tidak valid");
        router.push("/admin/landing-page/profil/pejabat-desa");
        return;
      }

      try {
        const profileData = await profileLandingPageState.pejabatDesa.findUnique.load(id);

        if (profileData) {
          // isi form awal
          const newForm = {
            name: profileData.name || "",
            position: profileData.position || "",
            imageId: profileData.imageId || "",
          };
          setFormData(newForm);

          // simpan juga versi original
          setOriginalData({
            ...newForm,
            imageUrl: profileData.image?.link || "",
          });

          setPreviewImage(profileData.image?.link || null);
        }
      } catch (error) {
        console.error("Error loading program inovasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengambil data program inovasi"
        );
      }
    };

    loadData();
    return () => profileLandingPageState.pejabatDesa.edit.reset();
  }, [params?.id, router]);

  // Handle input change
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Submit form
  const handleSubmit = async () => {
    if (isSubmitting || !formData.name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageId = formData.imageId;

      // Upload file jika ada
      if (file) {
        const uploadResponse = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = uploadResponse.data?.data;

        if (!uploaded?.id) {
          toast.error("Gagal upload gambar");
          return;
        }
        imageId = uploaded.id;
      }

      // Ensure we have the ID from the URL
      const id = params?.id as string;
      if (!id) {
        throw new Error("ID tidak ditemukan");
      }

      // Update global state with the ID and form data
      profileLandingPageState.pejabatDesa.edit.id = id;
      profileLandingPageState.pejabatDesa.edit.form = {
        ...formData,
        imageId: imageId || '', // Ensure imageId is always a string
      };

      const success = await profileLandingPageState.pejabatDesa.edit.submit();
      if (success) {
        toast.success("Berhasil menyimpan perubahan");
        router.push("/admin/landing-page/profil/pejabat-desa");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Gagal menyimpan profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      position: originalData.position,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  const handleBack = () => router.back();

  // Loading
  if (allState.edit.loading) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data profile...</Text>
        </Center>
      </Box>
    );
  }

  // Error
  if (allState.edit.error) {
    return (
      <Box>
        <Stack gap="md">
          <Button variant="subtle" onClick={handleBack}>
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Text fw="bold">Error</Text>
            <Text>{allState.edit.error}</Text>
          </Alert>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap="xs">
        <Group mb="md">
          <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
          <Title order={4} ml="sm" c="dark">
            Edit Pejabat Desa
          </Title>
        </Group>

        <Paper
          w={{ base: "100%", md: "50%" }}
          bg={colors['white-1']}
          p="md"
          radius="md"
          shadow="sm"
          style={{ border: '1px solid #e0e0e0' }}
        >
          <Stack gap="xs">
            <Title order={3}>Edit Profile Pejabat Desa</Title>

            {/* Nama Field */}
            <TextInput
              label={<Text fw="bold">Nama Perbekel</Text>}
              placeholder="Masukkan nama perbekel"
              value={formData.name}
              onChange={(e) => handleChange('name', e.currentTarget.value)}
              error={!formData.name && "Nama wajib diisi"}
            />

            {/* Posisi Field */}
            <TextInput
              label={<Text fw="bold">Posisi</Text>}
              placeholder="Masukkan posisi"
              value={formData.position}
              onChange={(e) => handleChange('position', e.currentTarget.value)}
              error={!formData.position && "Posisi wajib diisi"}
            />

            {/* File Upload */}
            <Box>
              <Text fw="bold" fz="sm" mb={6}>
                Gambar Program Inovasi
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

              {/* ✅ Preview gambar + tombol X */}
              {previewImage && (
                <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
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

            {/* Preview */}
            <Box>
              <Text fz="sm" fw="bold" mb="xs">Preview Gambar</Text>
              {previewImage ? (
                <Image alt="Profile preview" src={previewImage} w={200} h={200} fit="cover" radius="md" loading="lazy" />
              ) : (
                <Center w={200} h={200} bg="gray.2">
                  <Stack align="center" gap="xs">
                    <IconImageInPicture size={48} color="gray" />
                    <Text size="sm" c="gray">Tidak ada gambar</Text>
                  </Stack>
                </Center>
              )}
            </Box>

            {/* Submit */}
            <Group justify='right'>
              <Button
                variant="outline"
                color="gray"
                radius="md"
                size="md"
                onClick={handleResetForm}
                disabled={isSubmitting || allState.edit.loading}
              >
                Batal
              </Button>

              <Button
                onClick={handleSubmit}
                loading={isSubmitting || allState.edit.loading}
                disabled={!formData.name}
                radius="md"
                size="md"
                style={{
                  background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
                }}
              >
                {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
              </Button>

            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default EditPejabatDesa;
