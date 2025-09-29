/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Alert, Box, Button, Center, Group, Image, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';

import ApiFetch from '@/lib/api-fetch';
import { Dropzone } from '@mantine/dropzone';
import { IconAlertCircle, IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Biodata from './biodata/biodataForm';
import PengalamanOrganisasi from './pengalaman_organisasi/pengalamanForm';
import ProgramKerjaUnggulan from './program_kerja_unggulan/programKerjaForm';
import RiwayatKarir from './riwayat_karir/riwayatKarirForm';

function EditProfilePPID() {
  const allState = useProxy(stateProfilePPID);
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
        router.push("/admin/ppid/profile-ppid");
        return;
      }

      try {
        const profileData = await stateProfilePPID.loadForEdit(id);

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
      stateProfilePPID.editForm.reset(); // cleanup form
    };
  }, [params?.id, router]);

  const handleFieldChange = (field: string, value: string) => {
    stateProfilePPID.editForm.updateField(field as any, value);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !stateProfilePPID.editForm.form.name.trim()) {
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

        stateProfilePPID.editForm.form.imageId = uploaded.id;
      }

      // Submit form
      const success = await stateProfilePPID.editForm.submit();

      if (success) {
        toast.success("Berhasil menyimpan perubahan");
        router.push("/admin/ppid/profile-ppid");
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
  if (allState.profile.loading) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data profile...</Text>
        </Center>
      </Box>
    );
  }

  // Error state
  if (allState.profile.error) {
    return (
      <Box>
        <Stack gap="md">
          <Button variant="subtle" onClick={handleBack}>
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Text fw="bold">Error</Text>
            <Text>{allState.profile.error}</Text>
          </Alert>
        </Stack>
      </Box>
    );
  }

  // No data state
  if (!allState.profile.data) {
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
    <Box p="md">
      <Stack gap="md">
        <Group mb="md">
          <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
            <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
              <IconArrowBack color={colors['blue-button']} size={24} />
            </Button>
          </Tooltip>
          <Title order={4} ml="sm" c="dark">
            Edit Profil PPID
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
          <Stack gap="md">
            <Title order={3} c={colors['blue-button']}>Edit Profile PPID</Title>

            {/* Nama Field */}
            <TextInput
              label={<Text fw="bold">Nama Perbekel</Text>}
              placeholder="Masukkan nama perbekel"
              defaultValue={allState.editForm.form.name}
              onChange={(e) => handleFieldChange('name', e.currentTarget.value)}
              error={!allState.editForm.form.name && "Nama wajib diisi"}
            />

            {/* File Upload */}
            <Box>
              <Text fz={"md"} fw={"bold"}>Gambar</Text>
              <Box>
                <Dropzone
                  onDrop={(files) => {
                    const selectedFile = files[0]; // Ambil file pertama
                    if (selectedFile) {
                      setFile(selectedFile);
                      setPreviewImage(URL.createObjectURL(selectedFile)); // Buat preview
                    }
                  }}
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
                        Tarik gambar ke sini atau klik untuk memilih file
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
                      loading='lazy'
                    />
                  </Box>
                )}

              </Box>
            </Box>

            {/* Rich Components */}
            <Biodata
              value={allState.editForm.form.biodata}
              onChange={(val) => handleFieldChange('biodata', val)}
            />

            <RiwayatKarir
              value={allState.editForm.form.riwayat}
              onChange={(val) => handleFieldChange('riwayat', val)}
            />

            <PengalamanOrganisasi
              value={allState.editForm.form.pengalaman}
              onChange={(val) => handleFieldChange('pengalaman', val)}
            />

            <ProgramKerjaUnggulan
              value={allState.editForm.form.unggulan}
              onChange={(val) => handleFieldChange('unggulan', val)}
            />

            {/* Submit Button */}
            <Group>
              <Button
                bg={colors['blue-button']}
                onClick={handleSubmit}
                loading={isSubmitting || allState.editForm.loading}
                disabled={!allState.editForm.form.name}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>

              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting || allState.editForm.loading}
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

export default EditProfilePPID;