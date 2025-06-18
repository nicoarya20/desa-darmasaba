/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import {
  Alert,
  Box,
  Button, Center, FileInput, Group, Image, Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconAlertCircle, IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateStrukturPPID from '../../../_state/ppid/struktur_ppid/struktur_PPID';
import { toast } from 'react-toastify';
import ApiFetch from '@/lib/api-fetch';


function EditStrukturPPID() {
  const strukturPPID = useProxy(stateStrukturPPID);
  const params = useParams();
  const router = useRouter()

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) {
        toast.error("ID tidak valid");
        router.push("/admin/ppid/struktur-ppid");
        return;
      }

      try {
        const profileData = await strukturPPID.loadForEdit(id);

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
      strukturPPID.editStruktur.reset(); // cleanup form
    };
  }, [params?.id, router]);

  const handleFieldChange = (field: string, value: string) => {
    strukturPPID.editStruktur.updateField(field as any, value);
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
    if (isSubmitting || !strukturPPID.editStruktur.form.name.trim()) {
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

        strukturPPID.editStruktur.form.imageId = uploaded.id;
      }

      // Submit form
      const success = await strukturPPID.editStruktur.submit();

      if (success) {
        toast.success("Berhasil menyimpan perubahan");
        router.push("/admin/ppid/struktur-ppid");
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

  if (strukturPPID.struktur.loading) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data struktur...</Text>
        </Center>
      </Box>
    );
  }

   // Error state
   if (strukturPPID.struktur.error) {
    return (
      <Box>
        <Stack gap="md">
          <Button variant="subtle" onClick={handleBack}>
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Text fw="bold">Error</Text>
            <Text>{strukturPPID.struktur.error}</Text>
          </Alert>
        </Stack>
      </Box>
    );
  }

  // No data state
  if (!strukturPPID.struktur.data) {
    return (
      <Box>
        <Stack gap="md">
          <Button variant="subtle" onClick={handleBack}>
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
          <Alert icon={<IconAlertCircle size={16} />} color="yellow">
            <Text fw="bold">Data tidak ditemukan</Text>
            <Text>Profile PPID tidak dapat ditemukan</Text>
          </Alert>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap={'xs'}>
        <Box>
          <Button
            variant={'subtle'}
            onClick={handleBack}
          >
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
        </Box>
        <Box>
          <Paper bg={colors['white-1']} p={'md'} radius={10} w={{ base: '100%', md: '50%' }}>
            <Stack gap={'xs'}>
              <Title order={3}>Edit Struktur PPID</Title>
              <TextInput
                value={strukturPPID.editStruktur.form.name}
                onChange={(e) => handleFieldChange('name', e.currentTarget.value)}
                label={<Text fz="sm" fw="bold">Judul</Text>}
                placeholder="Masukkan judul"
              />
              {/* File Upload */}
              <FileInput
                label={<Text fz="sm" fw="bold">Upload Gambar Baru (Opsional)</Text>}
                value={file}
                onChange={handleFileChange}
                accept="image/*"
              />

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

              <Group>
                <Button
                  bg={colors['blue-button']}
                  onClick={handleSubmit}
                  disabled={isSubmitting || strukturPPID.editStruktur.loading}
                >
                  Submit
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default EditStrukturPPID;
