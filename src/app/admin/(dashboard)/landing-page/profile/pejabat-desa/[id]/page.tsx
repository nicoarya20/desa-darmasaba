'use client'

import colors from '@/con/colors';
import {
  Alert, Box, Button, Center, Group, Image,
  Paper, Stack, Text, TextInput, Title
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
    imageId: null as string | null,
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
        router.push("/admin/landing-page/profile/pejabat-desa");
        return;
      }

      try {
        const profileData = await profileLandingPageState.pejabatDesa.findUnique.load(id);

        if (profileData) {
          // Initialize form data
          setFormData({
            name: profileData.name || '',
            position: profileData.position || '',
            imageId: profileData.imageId || null,
          });

          // Initialize edit state with profile data
          profileLandingPageState.pejabatDesa.edit.initialize({
            ...profileData,
            imageId: profileData.imageId || ''
          });

          if (profileData.image?.link) {
            setPreviewImage(profileData.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Gagal memuat data profile");
      }
    };

    loadData();
    return () => profileLandingPageState.pejabatDesa.edit.reset();
  }, [params?.id, router]);

  // Handle input change
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle file change
  const handleFileChange = (newFile: File | null) => {
    if (!newFile) {
      setFile(null);
      return;
    }

    setFile(newFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(newFile);
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
        router.push("/admin/landing-page/profile/pejabat-desa");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Gagal menyimpan profile");
    } finally {
      setIsSubmitting(false);
    }
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
              <Text fz={"md"} fw={"bold"}>Gambar</Text>
              <Dropzone
                onDrop={(files) => handleFileChange(files[0])}
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
                      maxHeight: '150px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                    loading="lazy"
                  />
                </Box>
              )}
            </Box>

            {/* Preview */}
            <Box>
              <Text fz="sm" fw="bold" mb="xs">Preview Gambar</Text>
              {previewImage ? (
                <Image alt="Profile preview" src={previewImage} w={200} h={200} fit="cover" radius="md" loading="lazy"/>
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
            <Group>
              <Button
                bg={colors['blue-button']}
                onClick={handleSubmit}
                loading={isSubmitting || allState.edit.loading}
                disabled={!formData.name}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>

              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting || allState.edit.loading}
              >
                Batal
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default EditPejabatDesa;
