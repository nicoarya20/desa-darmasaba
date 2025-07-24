/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowBack, IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import colors from '@/con/colors';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import ApiFetch from '@/lib/api-fetch';
import { Dropzone } from '@mantine/dropzone';
import { toast } from 'react-toastify';

interface FormPrestasiDesa {
  name: string;
  deskripsi: string;
  kategoriId: string;
  imageId: string;
}

function EditPrestasiDesa() {
  const editState = useProxy(prestasiState.prestasiDesa)
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<FormPrestasiDesa>({
    name: '',
    deskripsi: '',
    kategoriId: '',
    imageId: '',
  })

  useEffect(() => {
    const loadDesaAntiKorupsi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.edit.load(id);
        if (data) {
          // ⬇️ FIX PENTING: tambahkan ini
          editState.edit.id = id;

          editState.edit.form = {
            name: data.name,
            deskripsi: data.deskripsi,
            kategoriId: data.kategoriId,
            imageId: data.imageId,
          };

          setFormData({
            name: data.name,
            deskripsi: data.deskripsi,
            kategoriId: data.kategoriId,
            imageId: data.imageId,
          });

          if (data?.image?.link) {
            setPreviewFile(data.image.link)
          }
        }
      } catch (error) {
        console.error("Error loading prestasi desa:", error);
        toast.error("Gagal memuat data prestasi desa");
      }
    }

    loadDesaAntiKorupsi();
  }, [params?.id]);


  const handleSubmit = async () => {

    try {
      // Update global state with form data
      editState.edit.form = {
        ...editState.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        kategoriId: formData.kategoriId || '',
        imageId: formData.imageId // Keep existing imageId if not changed
      };

      // Jika ada file baru, upload
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // Update imageId in global state
        editState.edit.form.imageId = uploaded.id;
      }

      await editState.edit.update();
      toast.success("prestasi desa berhasil diperbarui!");
      router.push("/admin/landing-page/prestasi-desa/list-prestasi-desa");
    } catch (error) {
      console.error("Error updating prestasi desa:", error);
      toast.error("Terjadi kesalahan saat memperbarui prestasi desa");
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Edit List Prestasi Desa</Text>
          {editState.findUnique.data ? (
            <Paper key={editState.findUnique.data.id}>
              <Stack gap={"xs"}>
                <TextInput
                  value={formData.name}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      name: val.target.value
                    })
                  }}
                  label={<Text fw={"bold"} fz={"sm"}>Judul</Text>}
                  placeholder='Masukkan judul'
                />
                <Box>
                  <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
                  <EditEditor
                    value={formData.deskripsi}
                    onChange={(val) => {
                      setFormData({
                        ...formData,
                        deskripsi: val
                      })
                    }}
                  />
                </Box>
                <Select
                  value={formData.kategoriId}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      kategoriId: val ?? ""
                    })
                  }}
                  label={<Text fw={"bold"} fz={"sm"}>Kategori</Text>}
                  placeholder="Pilih kategori"
                  data={
                    prestasiState.kategoriPrestasi.findMany.data?.map((v) => ({
                      value: v.id,
                      label: v.name,
                    })) || []
                  }
                />
                <Box>
                  <Text fz={"md"} fw={"bold"}>File Image</Text>
                  <Stack gap={"xs"}>
                    <Dropzone
                      onDrop={(files) => {
                        const selectedFile = files[0]; // Ambil file pertama
                        if (selectedFile) {
                          setFile(selectedFile);
                          setPreviewFile(URL.createObjectURL(selectedFile)); // Buat preview
                        }
                      }}
                      onReject={() => toast.error('File tidak valid.')}
                      maxSize={5 * 1024 ** 2} // Maks 5MB
                      accept={{
                        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
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
                          <IconFile size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                        </Dropzone.Idle>

                        <div>
                          <Text size="xl" inline>
                            Drag file ke sini atau klik untuk pilih file
                          </Text>
                          <Text size="sm" c="dimmed" inline mt={7}>
                            Maksimal 5MB dan harus format image
                          </Text>
                        </div>
                      </Group>
                    </Dropzone>
                    <Box>
                      <Text fw={"bold"} fz={"lg"}>Image</Text>
                      {previewFile ? (
                        <Image
                          alt=''
                          src={previewFile}
                          width="100%"
                          height="500px"
                          style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                        />
                      ) : (
                        <Text>Tidak ada image tersedia</Text>
                      )}
                    </Box>
                  </Stack>
                </Box>
                <Group>
                  <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
                </Group>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPrestasiDesa;