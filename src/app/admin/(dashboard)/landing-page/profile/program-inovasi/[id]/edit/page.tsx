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

function EditProgramInovasi() {
  const stateProgramInovasi = useProxy(profileLandingPageState.programInovasi)
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: stateProgramInovasi.update.form.name || "",
    description: stateProgramInovasi.update.form.description || "",
    imageId: stateProgramInovasi.update.form.imageId || "",
    link: stateProgramInovasi.update.form.link || "",
  })

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    const loadProgramInovasi = async () => {
      try {
        const data = await stateProgramInovasi.update.load(id);
        if (data) {
          setFormData({
            name: data.name || "",
            description: data.description || "",
            imageId: data.imageId || "",
            link: data.link || ""
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

    loadProgramInovasi();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateProgramInovasi.update.form = {
        ...stateProgramInovasi.update.form,
        name: formData.name,
        description: formData.description,
        imageId: formData.imageId,
        link: formData.link,
      }
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // Update imageId in global state
        stateProgramInovasi.update.form.imageId = uploaded.id;
      }

      await stateProgramInovasi.update.update();
      toast.success("Program Inovasi berhasil diperbarui!");
      router.push("/admin/landing-page/profile/program-inovasi");
    } catch (error) {
      console.error("Error updating program inovasi:", error);
      toast.error("Terjadi kesalahan saat memperbarui program inovasi");
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
          <Title order={4}>Edit Program Inovasi</Title>
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
            label={<Text fw={"bold"} fz={"sm"}>Nama Produk</Text>}
            placeholder='Masukkan nama produk'
          />
          <TextInput
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Deskripsi</Text>}
            placeholder='Masukkan deskripsi'
          />
          <TextInput
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Link</Text>}
            placeholder='Masukkan link'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditProgramInovasi;
