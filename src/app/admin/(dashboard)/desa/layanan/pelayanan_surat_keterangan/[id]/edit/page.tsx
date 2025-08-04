'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditSuratKeterangan() {
  const router = useRouter()
  const params = useParams()
  const stateSurat = useProxy(stateLayananDesa.suratKeterangan)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImage2, setPreviewImage2] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: stateSurat.edit.form.name,
    deskripsi: stateSurat.edit.form.deskripsi,
    imageId: stateSurat.edit.form.imageId,
    image2Id: stateSurat.edit.form.image2Id,
  })

  useEffect(() => {
    const loadSurat = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await stateSurat.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || "",
            deskripsi: data.deskripsi || "",
            imageId: data.imageId || "",
            image2Id: data.image2Id || "",
          });

          if (data.image?.link) {
            setPreviewImage(data.image.link);
          } else {
            setPreviewImage(null);
          }

          if (data.image2?.link) {
            setPreviewImage2(data.image2.link);
          } else {
            setPreviewImage2(null);
          }
        }
      } catch (error) {
        console.error("Error loading surat:", error);
        toast.error("Gagal memuat data surat");
      }
    };
    loadSurat();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateSurat.edit.form = {
        ...stateSurat.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        imageId: formData.imageId,
        image2Id: formData.image2Id,
      }
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        stateSurat.edit.form.imageId = uploaded.id;
      }

      if (file2) {
        const res = await ApiFetch.api.fileStorage.create.post({ file: file2, name: file2.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        stateSurat.edit.form.image2Id = uploaded.id;
      }

      await stateSurat.edit.update()
      toast.success("Surat berhasil diperbarui!")
      router.push("/admin/desa/layanan/pelayanan_surat_keterangan")
    } catch (error) {
      console.error("Error updating surat:", error);
      toast.error("Terjadi kesalahan saat memperbarui surat");
    }
  }


  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit Surat Keterangan</Title>
          <TextInput
            value={formData.name}
            onChange={(val) => {
              setFormData({ ...formData, name: val.target.value });
            }}
            label={<Text fz={"sm"} fw={"bold"}>Nama Surat Keterangan</Text>}
            placeholder="masukkan nama surat keterangan"
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Konten</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData({ ...formData, deskripsi: htmlContent });
              }}
            />
          </Box>
          <Box>
            <Text fz={"md"} fw={"bold"}>Gambar</Text>
            <Box >
              <Dropzone
                onDrop={(files) => {
                  const file = files[0]; // Hanya ambil file pertama
                  if (file) {
                    setFile(file);
                    setPreviewImage(URL.createObjectURL(file)); // Buat preview
                  }
                }}
                maxSize={5 * 1024 ** 2} // 5MB
                accept={{
                  'image/*': ['.jpeg', '.jpg', '.png', '.webp']
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
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={280}
                  height={180}
                  fit="cover"
                  radius="sm"
                  mt="md"
                />
              )}
            </Box>
          </Box>
          <Box>
            <Text fz={"md"} fw={"bold"}>Gambar</Text>
            <Box >
              <Dropzone
                onDrop={(files) => {
                  const file = files[0]; // Hanya ambil file pertama
                  if (file) {
                    setFile2(file);
                    setPreviewImage2(URL.createObjectURL(file)); // Buat preview
                  }
                }}
                maxSize={5 * 1024 ** 2} // 5MB
                accept={{
                  'image/*': ['.jpeg', '.jpg', '.png', '.webp']
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
              {previewImage2 && (
                <Image
                  src={previewImage2}
                  alt="Preview"
                  width={280}
                  height={180}
                  fit="cover"
                  radius="sm"
                  mt="md"
                />
              )}
            </Box>
          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditSuratKeterangan;
