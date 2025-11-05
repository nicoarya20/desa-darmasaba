/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Alert, Box, Button, Center, Group, Image, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconAlertCircle, IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function Page() {
  const maskotState = useProxy(stateProfileDesa.maskotDesa);
  const router = useRouter();
  const params = useParams();

  const [images, setImages] = useState<
  Array<{ file: File | null; preview: string; label: string; imageId?: string }>
>([]);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    images: [] as Array<{ label: string; imageId: string }>,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) {
        toast.error("ID tidak valid");
        router.push("/admin/desa/profile/profile-desa");
        return;
      }

      try {
        const data = await maskotState.findUnique.load(id);
        if (data) {
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
              imageId: img.image.id, // simpan id lama
            })));
          }
        }
      } catch (error) {
        console.error("Error loading maskot:", error);
        toast.error("Gagal memuat data maskot");
      }
    };

    loadData();

    return () => {
      maskotState.update.reset();
      maskotState.findUnique.reset();
    };
  }, [params?.id, router]);

  const handleBack = () => router.back();

  const handleSubmit = async () => {
    if (isSubmitting || !formData.judul.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedImages = [];

      // Upload semua gambar baru
      for (const img of images) {
        if (!img.file) {
          if (!img.imageId) continue; // kalau benar2 kosong, skip
          uploadedImages.push({ imageId: img.imageId, label: img.label });
          continue;
        }
      
        // upload baru
        const res = await ApiFetch.api.fileStorage.create.post({
          file: img.file,
          name: img.file.name,
        });
        const uploaded = res.data?.data;
        if (!uploaded?.id) {
          toast.error("Gagal upload salah satu gambar");
          return;
        }
        uploadedImages.push({ imageId: uploaded.id, label: img.label || "main" });
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (maskotState.findUnique.loading || maskotState.update.loading) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data...</Text>
        </Center>
      </Box>
    );
  }

  // Error state
  if (maskotState.findUnique.error) {
    return (
      <Box>
        <Stack gap="md">
          <Button variant="subtle" onClick={handleBack}>
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Text fw="bold">Error</Text>
            <Text>{maskotState.findUnique.error}</Text>
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
          <Title order={4} ml="sm" c="dark">Edit Maskot Desa</Title>
        </Group>

        <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p="md" radius="md" shadow="sm" style={{ border: '1px solid #e0e0e0' }}>
          <Stack gap="xs">
            <Title order={3}>Edit Maskot Desa</Title>

            {/* Judul */}
            <TextInput
              label={<Text fw="bold">Judul</Text>}
              placeholder="Masukkan judul maskot"
              defaultValue={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.currentTarget.value })}
              error={!formData.judul && "Judul wajib diisi"}
            />

            {/* Deskripsi */}
            <Box>
              <Text fz={"md"} fw={"bold"}>Deskripsi</Text>
              <EditEditor
                value={formData.deskripsi}
                onChange={(val) => setFormData({ ...formData, deskripsi: val })}
              />
            </Box>

            {/* Upload Gambar */}
            <Box>
              <Text fz={"md"} fw={"bold"}>Gambar</Text>
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
                  <Dropzone.Accept><IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} /></Dropzone.Accept>
                  <Dropzone.Reject><IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} /></Dropzone.Reject>
                  <Dropzone.Idle><IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} /></Dropzone.Idle>
                  <div>
                    <Text size="xl" inline>Drag images here or click to select files</Text>
                    <Text size="sm" c="dimmed" inline mt={7}>Attach as many files as you like, each file max 5mb</Text>
                  </div>
                </Group>
              </Dropzone>
            </Box>

            {/* Preview Gambar */}
            <SimpleGrid cols={{ base: 2, md: 4 }}>
              {images.map((img, index) => (
                <Box key={index} mb="md">
                  <Paper p="sm" radius="md" withBorder style={{ position: 'relative', maxWidth: 300 }}>
                    <Stack gap="xs">
                      <Group justify="space-between">
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
                        loading='lazy'
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

            {/* Buttons */}
            <Group>
              <Button
                bg={colors['blue-button']}
                onClick={handleSubmit}
                loading={isSubmitting || maskotState.update.loading}
                disabled={!formData.judul}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting || maskotState.update.loading}>
                Batal
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default Page;
