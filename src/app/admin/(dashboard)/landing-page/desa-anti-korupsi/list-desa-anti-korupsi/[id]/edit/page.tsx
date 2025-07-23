/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Group, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowBack, IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import colors from '@/con/colors';

import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import ApiFetch from '@/lib/api-fetch';
import { Dropzone } from '@mantine/dropzone';
import { toast } from 'react-toastify';
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';

interface FormDesaAntiKorupsi {
  name: string;
  deskripsi: string;
  kategoriId: string;
  fileId: string;
}

function EditDesaAntiKorupsi() {
  const desaAntiKorupsiState = useProxy(korupsiState.desaAntikorupsi)
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<FormDesaAntiKorupsi>({
    name: '',
    deskripsi: '',
    kategoriId: '',
    fileId: '',
  })

  useEffect(() => {
    const loadDesaAntiKorupsi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await desaAntiKorupsiState.edit.load(id);
        if (data) {
          // ⬇️ FIX PENTING: tambahkan ini
          desaAntiKorupsiState.edit.id = id;

          desaAntiKorupsiState.edit.form = {
            name: data.name,
            deskripsi: data.deskripsi,
            kategoriId: data.kategoriId,
            fileId: data.fileId,
          };

          setFormData({
            name: data.name,
            deskripsi: data.deskripsi,
            kategoriId: data.kategoriId,
            fileId: data.fileId,
          });

          if (data?.file?.link) {
            setPreviewFile(data.file.link)
          }
        }
      } catch (error) {
        console.error("Error loading program penghijauan:", error);
        toast.error("Gagal memuat data program penghijauan");
      }
    }

    loadDesaAntiKorupsi();
  }, [params?.id]);


  const handleSubmit = async () => {

    try {
      // Update global state with form data
      desaAntiKorupsiState.edit.form = {
        ...desaAntiKorupsiState.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        kategoriId: formData.kategoriId || '',
        fileId: formData.fileId // Keep existing imageId if not changed
      };

      // Jika ada file baru, upload
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // Update imageId in global state
        desaAntiKorupsiState.edit.form.fileId = uploaded.id;
      }

      await desaAntiKorupsiState.edit.update();
      toast.success("desa anti korupsi berhasil diperbarui!");
      router.push("/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi");
    } catch (error) {
      console.error("Error updating desa anti korupsi:", error);
      toast.error("Terjadi kesalahan saat memperbarui desa anti korupsi");
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
          <Text fz={"xl"} fw={"bold"}>Edit List Desa Anti Korupsi</Text>
          {desaAntiKorupsiState.findUnique.data ? (
            <Paper key={desaAntiKorupsiState.findUnique.data.id}>
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
                    korupsiState.kategoriDesaAntiKorupsi.findMany.data?.map((v) => ({
                      value: v.id,
                      label: v.name,
                    })) || []
                  }
                />
                <Box>
                  <Text fz={"md"} fw={"bold"}>File Document</Text>
                  <Box>
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
                        'application/*': ['.pdf', '.doc', '.docx'],
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
                            Maksimal 5MB dan harus format document
                          </Text>
                        </div>
                      </Group>
                    </Dropzone>
                    <Box>
                      <Text fw={"bold"} fz={"lg"}>Dokumen</Text>
                      {previewFile ? (
                        <iframe
                          src={previewFile}
                          width="100%"
                          height="500px"
                          style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                        />
                      ) : (
                        <Text>Tidak ada dokumen tersedia</Text>
                      )}
                    </Box>
                  </Box>
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

export default EditDesaAntiKorupsi;