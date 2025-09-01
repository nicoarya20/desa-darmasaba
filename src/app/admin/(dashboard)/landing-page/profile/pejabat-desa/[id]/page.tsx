/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Alert, Box, Button, Center, Group, Image, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
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

  // UI States
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
        profileLandingPageState.pejabatDesa.edit.initialize(profileData);


        if (profileData && profileData.image?.link) {
          setPreviewImage(profileData.image.link);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Gagal memuat data profile");
      }
    };

    loadData();

    return () => {
      profileLandingPageState.pejabatDesa.edit.reset(); // cleanup form
    };
  }, [params?.id, router]);

  const handleFieldChange = (field: string, value: string) => {
    profileLandingPageState.pejabatDesa.edit.updateField(field as any, value);
  };

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

  const handleSubmit = async () => {
    if (isSubmitting || !profileLandingPageState.pejabatDesa.edit.form.name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file jika ada
      if (file) {
        const uploadResponse = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = uploadResponse.data?.data;

        if (!uploaded?.id) {
          toast.error("Gagal upload gambar");
          return;
        }

        profileLandingPageState.pejabatDesa.edit.form.imageId = uploaded.id;
      }

      // Submit form
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

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (allState.edit.loading) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data profile...</Text>
        </Center>
      </Box>
    );
  }

  // Error state
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
          <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
            <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
              <IconArrowBack color={colors['blue-button']} size={24} />
            </Button>
          </Tooltip>
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
              value={allState.edit.form.name}
              onChange={(e) => handleFieldChange('name', e.currentTarget.value)}
              error={!allState.edit.form.name && "Nama wajib diisi"}
            />

            {/* Posisi Field */}
            <TextInput
              label={<Text fw="bold">Posisi</Text>}
              placeholder="Masukkan posisi"
              value={allState.edit.form.position}
              onChange={(e) => handleFieldChange('position', e.currentTarget.value)}
              error={!allState.edit.form.position && "Posisi wajib diisi"}
            />

            {/* File Upload */}
            <Box>
              <Text fz={"md"} fw={"bold"}>Gambar</Text>
              <Box>
                <Dropzone
                  onDrop={(files) => handleFileChange(files[0])}
                  onReject={() => toast.error('File tidak valid.')}
                  maxSize={5 * 1024 ** 2} // Maks 5MB
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

                {/* Tampilkan preview kalau ada */}
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
            </Box>

            {/* Preview Gambar */}
            <Box>
              <Text fz="sm" fw="bold" mb="xs">Preview Gambar</Text>
              {previewImage ? (
                <Image alt="Profile preview" src={previewImage} w={200} h={200} fit="cover" radius="md" />
              ) : (
                <Center w={200} h={200} bg="gray.2">
                  <Stack align="center" gap="xs">
                    <IconImageInPicture size={48} color="gray" />
                    <Text size="sm" c="gray">Tidak ada gambar</Text>
                  </Stack>
                </Center>
              )}
            </Box>

            {/* Submit Button */}
            <Group>
              <Button
                bg={colors['blue-button']}
                onClick={handleSubmit}
                loading={isSubmitting || allState.edit.loading}
                disabled={!allState.edit.form.name}
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