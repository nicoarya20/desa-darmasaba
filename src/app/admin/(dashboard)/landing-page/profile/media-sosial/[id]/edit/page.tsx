/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditMediaSosial() {
  const stateMediaSosial = useProxy(profileLandingPageState.mediaSosial)
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: stateMediaSosial.update.form.name || "",
    iconUrl: stateMediaSosial.update.form.iconUrl || "",
    imageId: stateMediaSosial.update.form.imageId || ""
  })

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    const loadMediaSosial = async () => {
      try {
        const data = await stateMediaSosial.update.load(id);

        if (data) {
          setFormData({
            name: data.name || "",
            iconUrl: data.iconUrl || "",
            imageId: data.imageId || "",
          });
          // Tampilkan preview gambar
          if (data.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading program inovasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengambil data program inovasi"
        );
      }
    }

    loadMediaSosial();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateMediaSosial.update.form = {
        ...stateMediaSosial.update.form,
        name: formData.name,
        iconUrl: formData.iconUrl,
        imageId: formData.imageId ?? "",
      }
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // Update imageId in global state
        stateMediaSosial.update.form.imageId = uploaded.id;
      }

      await stateMediaSosial.update.update();
      toast.success("Media Sosial berhasil diperbarui!");
      router.push("/admin/landing-page/profile/media-sosial");
    } catch (error) {
      console.error("Error updating media sosial:", error);
      toast.error("Terjadi kesalahan saat memperbarui media sosial");
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Media Sosial</Title>
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
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nama Media Sosial / Nama Kontak</Text>}
            placeholder='Masukkan nama media sosial'
          />
          <TextInput
            value={formData.iconUrl}
            onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Icon URL / No Telephone</Text>}
            placeholder='Masukkan icon url'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditMediaSosial;
