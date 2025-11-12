'use client';

import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { ActionIcon, Alert, Box, Button, Center, Group, Image, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconAlertCircle, IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';
import Biodata from '../_com/biodata/biodataForm';
import PengalamanOrganisasi from '../_com/pengalaman_organisasi/pengalamanForm';
import ProgramKerjaUnggulan from '../_com/program_kerja_unggulan/programKerjaForm';
import RiwayatKarir from '../_com/riwayat_karir/riwayatKarirForm';


// import komponen rich text jika ada


function EditProfilePPID() {
  const allState = useProxy(stateProfilePPID);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    stateProfilePPID.loadForEdit(id).then((data) => {
      if (data?.image?.link) setPreviewImage(data.image.link);
    });
  }, [id]);

  const handleFieldChange = (field: keyof typeof allState.editForm.form, value: string) => {
    stateProfilePPID.editForm.updateField(field, value);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateProfilePPID.editForm.loading = true;

      let imageId = allState.editForm.form.imageId;

      // Upload file baru jika ada
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) {
          toast.error("Gagal upload gambar");
          return;
        }
        imageId = uploaded.id;
      }

      // Update form di state
      allState.editForm.form.imageId = imageId;

      const success = await stateProfilePPID.editForm.submit();
      if (success) {
        toast.success("Profil berhasil diperbarui!");
        router.push("/admin/ppid/profil-ppid");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Terjadi kesalahan saat memperbarui profil");
    } finally {
      stateProfilePPID.editForm.loading = false;
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    if (!allState.profile.data) return;

    // Reset form ke data awal yang di-load
    const original = allState.profile.data;

    stateProfilePPID.editForm.form = {
      name: original.name || '',
      imageId: original.imageId || '',
      biodata: original.biodata || '',
      riwayat: original.riwayat || '',
      pengalaman: original.pengalaman || '',
      unggulan: original.unggulan || '',
    };

    // Reset preview gambar juga
    setPreviewImage(original.image?.link || null);
    setFile(null);

    toast.info('Perubahan dibatalkan');
  };


  const handleBack = () => router.back();

  // Kondisi loading & error handling
  if (allState.profile.loading) {
    return (
      <Center h={400}>
        <Text>Memuat data profil...</Text>
      </Center>
    );
  }

  if (allState.profile.error) {
    return (
      <Stack gap="md">
        <Button variant="subtle" onClick={handleBack}>
          <IconArrowBack color={colors['blue-button']} size={20} />
        </Button>
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          <Text fw="bold">Error</Text>
          <Text>{allState.profile.error}</Text>
        </Alert>
      </Stack>
    );
  }

  if (!allState.profile.data) {
    return (
      <Stack gap="md">
        <Button variant="subtle" onClick={handleBack}>
          <IconArrowBack color={colors['blue-button']} size={20} />
        </Button>
        <Alert icon={<IconAlertCircle size={16} />} color="yellow">
          <Text fw="bold">Data tidak ditemukan</Text>
          <Text>Profil PPID tidak dapat ditemukan</Text>
        </Alert>
      </Stack>
    );
  }

  return (
    <Box p="md">
      <Stack gap="md">
        <Group mb="md">
          <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
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
            <Title order={3} c={colors['blue-button']}>Edit Profil PPID</Title>

            {/* Nama */}
            <TextInput
              label={<Text fw="bold">Nama Perbekel</Text>}
              placeholder="Masukkan nama perbekel"
              value={allState.editForm.form.name}
              onChange={(e) => handleFieldChange('name', e.currentTarget.value)}
              error={!allState.editForm.form.name && "Nama wajib diisi"}
            />

            {/* Upload Gambar */}
            <Box>
              <Text fz={"md"} fw={"bold"}>Gambar</Text>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                    setPreviewImage(URL.createObjectURL(selectedFile));
                  }
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
                      Tarik gambar ke sini atau klik untuk memilih file
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                    Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp
                    </Text>
                  </div>
                </Group>
              </Dropzone>

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

            {/* Form Rich Text */}
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

            {/* ======= Tombol Aksi ======= */}
            <Group justify="right">
              {/* Tombol Batal */}
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

export default EditProfilePPID;
