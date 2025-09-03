'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, Group, Image, Paper, Stack, Text, Title, Tooltip } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX, IconImageInPicture } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function ProfilePerbekel() {
  const perbekelState = useProxy(stateProfileDesa.profilPerbekel)
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) {
        toast.error("ID tidak valid");
        router.push("/admin/desa/profile/profile-perbekel");
        return;
      }

      const data = await perbekelState.findUnique.load(id);
      if (data) perbekelState.edit.initialize(data);
      if (data?.image?.link) setPreviewImage(data.image.link);
    };

    loadData();

    return () => {
      perbekelState.edit.reset();
      perbekelState.findUnique.reset();
    };
  }, [params?.id, router]);

  const handleFileChange = (newFile: File | null) => {
    if (!newFile) {
      setFile(null);
      setPreviewImage(null);
      return;
    }
    setFile(newFile);
    const reader = new FileReader();
    reader.onload = (event) => setPreviewImage(event.target?.result as string);
    reader.readAsDataURL(newFile);
  }

  const handleSubmit = async () => {
    if (isSubmitting || !perbekelState.edit.form.biodata.trim()) {
      toast.error("Biodata wajib diisi");
      return;
    }
    setIsSubmitting(true)
    try {
      if (file) {
        const uploadResponse = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = uploadResponse.data?.data;

        if (!uploaded?.id) {
          toast.error("Gagal upload gambar");
          return;
        }
        perbekelState.edit.form.imageId = uploaded.id;
      }
      const success = await perbekelState.edit.submit()
      if (success) {
        toast.success("Data berhasil disimpan");
        router.push("/admin/desa/profile/profile-perbekel");
      }
    } catch (error) {
      console.error("Error update sejarah desa:", error);
      toast.error("Terjadi kesalahan saat update sejarah desa");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBack = () => router.back();

  if (perbekelState.findUnique.loading || perbekelState.edit.loading) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data...</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box py={10}>
      <Stack gap="xs">
        {/* Header */}
        <Group mb="md">
          <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
            <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
              <IconArrowBack color={colors['blue-button']} size={24} />
            </Button>
          </Tooltip>
          <Title order={4} ml="sm" c="dark">
            Edit Profil Perbekel
          </Title>
        </Group>

        <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }} radius="md" shadow="sm" style={{ border: '1px solid #e0e0e0' }}>
          <Stack gap="xs">
            {/* Biodata */}
            <Box>
              <Text fz="md" fw="bold">Biodata</Text>
              <EditEditor
                value={perbekelState.edit.form.biodata}
                onChange={(val) => perbekelState.edit.form.biodata = val}
              />
            </Box>

            {/* Gambar */}
            <Box>
              <Text fz="md" fw="bold">Gambar</Text>
              <Dropzone
                onDrop={(files) => handleFileChange(files[0])}
                onReject={() => toast.error('File tidak valid.')}
                maxSize={5 * 1024 ** 2} // 5MB
                accept={{ 'image/*': [] }}
              >
                <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                  <Dropzone.Accept><IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} /></Dropzone.Accept>
                  <Dropzone.Reject><IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} /></Dropzone.Reject>
                  <Dropzone.Idle><IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} /></Dropzone.Idle>
                  <div>
                    <Text size="xl" inline>Drag gambar ke sini atau klik untuk pilih file</Text>
                    <Text size="sm" c="dimmed" inline mt={7}>Maksimal 5MB dan harus format gambar</Text>
                  </div>
                </Group>
              </Dropzone>

              {/* Preview */}
              <Box mt="sm">
                {previewImage ? (
                  <Image src={previewImage} alt="Preview" w={200} h={200} fit="cover" radius="md" />
                ) : (
                  <Center w={200} h={200} bg="gray.2">
                    <Stack align="center" gap="xs">
                      <IconImageInPicture size={48} color="gray" />
                      <Text size="sm" c="gray">Tidak ada gambar</Text>
                    </Stack>
                  </Center>
                )}
              </Box>
            </Box>

            {/* Pengalaman */}
            <Box>
              <Text fz="md" fw="bold">Pengalaman</Text>
              <EditEditor
                value={perbekelState.edit.form.pengalaman}
                onChange={(val) => perbekelState.edit.form.pengalaman = val}
              />
            </Box>

            {/* Pengalaman Organisasi */}
            <Box>
              <Text fz="md" fw="bold">Pengalaman Organisasi</Text>
              <EditEditor
                value={perbekelState.edit.form.pengalamanOrganisasi}
                onChange={(val) => perbekelState.edit.form.pengalamanOrganisasi = val}
              />
            </Box>

            {/* Program Unggulan */}
            <Box>
              <Text fz="md" fw="bold">Program Unggulan</Text>
              <EditEditor
                value={perbekelState.edit.form.programUnggulan}
                onChange={(val) => perbekelState.edit.form.programUnggulan = val}
              />
            </Box>

            {/* Submit */}
            <Group>
              <Button
                bg={colors['blue-button']}
                onClick={handleSubmit}
                loading={isSubmitting || perbekelState.edit.loading}
                disabled={!perbekelState.edit.form.biodata.trim()}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>

              <Button variant="outline" onClick={handleBack} disabled={isSubmitting || perbekelState.edit.loading}>
                Batal
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}

export default ProfilePerbekel;
