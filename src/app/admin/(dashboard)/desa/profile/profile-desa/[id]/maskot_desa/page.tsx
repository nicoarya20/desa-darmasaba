/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function Page() {
  const maskotState = useProxy(stateProfileDesa.maskotDesa)
  const router = useRouter()
  const params = useParams()

  const [images, setImages] = useState<
    Array<{ file: File; preview: string; label: string }>
  >([]);

  const [formData, setFormData] = useState({
    judul: maskotState.update.form.judul || '',
    deskripsi: maskotState.update.form.deskripsi || '',
    images: [] as Array<{ label: string; imageId: string }>
  })

  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await maskotState.findUnique.load(id);
        if (data) {
          // 🔥 INI YANG KURANG!
          maskotState.update.initialize(data);

          setFormData({
            judul: data.judul || '',
            deskripsi: data.deskripsi || '',
            images: (data.images || []).map((img: any) => ({
              label: img.label,
              imageId: img.image?.id ?? '',
            })),
          });

          if (data?.images?.length > 0 && data.images[0].image?.link) {
            setImages(data.images.map((img: any) => ({
              file: null,
              preview: img.image.link,
              label: img.label,
            })));
          }
        }
      } catch (error) {
        console.error("Error loading berita:", error);
        toast.error("Gagal memuat data berita");
      }
    };

    loadData();
  }, [params?.id]);


  const handleBack = () => {
    router.back()
  }

  const handleSubmit = async () => {
    try {
      const uploadedImages = [];

      // Upload semua gambar baru
      for (const img of images) {
        if (!img.file || !(img.file instanceof File)) {
          toast.error("File tidak valid untuk di-upload");
          continue; // atau return kalau kamu mau hentikan semua
        }

        const res = await ApiFetch.api.fileStorage.create.post({
          file: img.file,
          name: img.file.name,
        });

        const uploaded = res.data?.data;
        if (!uploaded?.id) {
          toast.error("Gagal upload salah satu gambar");
          return;
        }

        uploadedImages.push({
          imageId: uploaded.id,
          label: img.label || 'main',
        });
      }

      // Update ke global state
      maskotState.update.updateField("judul", formData.judul);
      maskotState.update.updateField("deskripsi", formData.deskripsi);
      maskotState.update.updateField("images", uploadedImages);

      const success = await maskotState.update.submit();

      if (success) {
        toast.success("Maskot berhasil diperbarui!");
        router.push("/admin/desa/profile/profile-desa");
      }

    } catch (error) {
      console.error("Error update maskot:", error);
      toast.error("Gagal update maskot");
    }
  };

  return (
    <Box>
      <Stack gap={'xs'}>
        <Group>
          <Button variant="subtle" onClick={handleBack}>
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
        </Group>
        <Paper bg={colors['white-1']} p={'xs'} w={{ base: '100%', md: '100%' }}>
          <Stack gap={'xs'}>
            <Box>
              <Box>
                <Stack>
                  <Title order={4}>Edit Maskot Desa</Title>
                  <TextInput
                    w={{ base: '100%', md: '50%' }}
                    label={<Text fz={"md"} fw={"bold"}>Judul</Text>}
                    placeholder="Masukkan judul"
                    value={formData.judul}
                    onChange={(val) => setFormData({ ...formData, judul: val.currentTarget.value })}
                  />
                  <Box w={{ base: '100%', md: '50%' }}>
                    <Text fz={"md"} fw={"bold"}>Deskripsi</Text>
                    <EditEditor
                      value={formData.deskripsi}
                      onChange={(val) => setFormData({ ...formData, deskripsi: val })}
                    />
                  </Box>
                  <Box>
                    <Text fz={"md"} fw={"bold"}>Gambar</Text>
                    <Box w={{ base: '100%', md: '50%' }}>
                      <Dropzone

                        onDrop={(files) => {
                          const newImages = files.map((file) => ({
                            file,
                            preview: URL.createObjectURL(file),
                            label: '',
                          }));
                          setImages((prev) => [...prev, ...newImages]);
                        }}
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
                              Drag images here or click to select files
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                              Attach as many files as you like, each file should not exceed 5mb
                            </Text>
                          </div>
                        </Group>
                      </Dropzone>
                    </Box>
                  </Box>
                  <SimpleGrid cols={{ base: 2, md: 4 }} >
                    {images.map((img, index) => (
                      <Box key={index} mb="md">
                        <Paper p="sm" radius="md" withBorder style={{ position: 'relative', maxWidth: 300 }}>
                          <Stack gap={'xs'}>
                            <Group>
                              <Button
                                size="xs"
                                color="red"
                                variant="light"
                                onClick={() => {
                                  const updated = [...images];
                                  updated.splice(index, 1);
                                  setImages(updated);
                                }}
                              >
                                Hapus
                              </Button>
                            </Group>
                            <Image
                              src={img.preview}
                              alt={`Preview ${index}`}
                              width={280}
                              height={180}
                              fit="cover"
                              radius="sm"
                            />
                            <TextInput
                              label={`Label Gambar ${index + 1}`}
                              placeholder="Contoh: Logo, Maskot, Dll"
                              value={img.label}
                              onChange={(e) => {
                                const updated = [...images];
                                updated[index].label = e.currentTarget.value;
                                setImages(updated);
                              }}
                            />
                          </Stack>
                        </Paper>
                      </Box>
                    ))}
                  </SimpleGrid>
                  <Group>
                    <Button
                      onClick={handleSubmit}
                      bg={colors['blue-button']}
                    >
                      Submit
                    </Button>
                  </Group>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default Page;
