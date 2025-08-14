'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import penghargaanState from '@/app/admin/(dashboard)/_state/desa/penghargaan';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPenghargaan() {
  const statePenghargaan = useProxy(penghargaanState)
  const router = useRouter()
  const params = useParams()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: statePenghargaan.findUnique.data?.name || '',
    juara: statePenghargaan.findUnique.data?.juara || '',
    deskripsi: statePenghargaan.findUnique.data?.deskripsi || '',
    imageId: statePenghargaan.findUnique.data?.imageId || '',
  })

  useEffect(() => {
    const loadPenghargaan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await statePenghargaan.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            juara: data.juara || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading penghargaan:", error);
        toast.error("Gagal memuat data penghargaan");
      }
    };

    loadPenghargaan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      statePenghargaan.edit.form = {
        ...statePenghargaan.edit.form,
        name: formData.name,
        juara: formData.juara,
        deskripsi: formData.deskripsi,
        imageId: formData.imageId,
      }

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        statePenghargaan.edit.form.imageId = uploaded.id;
      }

      await statePenghargaan.edit.update();
      toast.success("Penghargaan berhasil diperbarui!");
      router.push("/admin/desa/penghargaan");
    } catch (error) {
      console.error("Error updating penghargaan:", error);
      toast.error("Terjadi kesalahan saat memperbarui penghargaan");
    }
  }

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>
      <Paper bg={"white"} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit Penghargaan</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Judul</Text>}
            placeholder="masukkan judul"
          />

          <TextInput
            value={formData.juara}
            onChange={(e) => setFormData({ ...formData, juara: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Juara</Text>}
            placeholder="masukkan juara"
          />
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

          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                statePenghargaan.edit.form.deskripsi = htmlContent;
              }}
            />
          </Box>

          <Button onClick={handleSubmit}>Edit Penghargaan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPenghargaan;
