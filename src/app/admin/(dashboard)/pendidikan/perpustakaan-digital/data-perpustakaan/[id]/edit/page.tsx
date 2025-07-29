/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPasarDesa() {
  const editState = useProxy(perpustakaanDigitalState.dataPerpustakaan)
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    judul: editState.update.form.judul || "",
    deskripsi: editState.update.form.deskripsi || "",
    imageId: editState.update.form.imageId || "",
    kategoriId: editState.update.form.kategoriId || "",
  })

  useEffect(() => {
    perpustakaanDigitalState.kategoriBuku.findMany.load();
    const loadDataPerpustakaan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.update.load(id);
        if (data) {
          setFormData({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            imageId: data.imageId || "",
            kategoriId: data.kategoriId || "",
          });
          // Tampilkan preview gambar
          if (data.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading data perpustakaan:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengambil data perpustakaan"
        );
      }
    }

    loadDataPerpustakaan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      editState.update.form = {
        ...editState.update.form,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        kategoriId: formData.kategoriId,
        imageId: formData.imageId,
      }
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // Update imageId in global state
        editState.update.form.imageId = uploaded.id;
      }

      await editState.update.update();
      toast.success("Data perpustakaan berhasil diperbarui!");
      router.push("/admin/pendidikan/perpustakaan-digital/data-perpustakaan");
    } catch (error) {
      console.error("Error updating data perpustakaan:", error);
      toast.error("Terjadi kesalahan saat memperbarui data perpustakaan");
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
          <Title order={4}>Edit Data Perpustakaan</Title>
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
            value={formData.judul}
            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Judul</Text>}
            placeholder='Masukkan judul'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) => {
                setFormData({ ...formData, deskripsi: val });
              }}
            />
          </Box>
          <Select
            value={formData.kategoriId}
            onChange={(val) => setFormData({ ...formData, kategoriId: val || "" })}
            label={<Text fw={"bold"} fz={"sm"}>Kategori</Text>}
            placeholder='Pilih kategori'
            data={
              perpustakaanDigitalState.kategoriBuku.findMany.data?.map((v) => ({
                value: v.id,
                label: v.name
              })) || []
            }
            clearable
            searchable
            required
            error={!formData.kategoriId ? "Pilih kategori" : undefined}
          />

          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPasarDesa;
