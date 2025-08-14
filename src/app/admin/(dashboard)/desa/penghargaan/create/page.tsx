'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import penghargaanState from '../../../_state/desa/penghargaan';


function CreatePenghargaan() {
  const statePenghargaan = useProxy(penghargaanState)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter()

  const resetForm = () => {
    statePenghargaan.create.form = {
      name: "",
      juara: "",
      deskripsi: "",
      imageId: "",
    }
    setPreviewImage(null)
    setFile(null)
  }

  const handleSubmit = async () => {
    if (!file) {
      return toast.error("Silahkan pilih file gambar terlebih dahulu")
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file: file,
      name: file.name
    })

    const uploaded = res.data?.data
    if (!uploaded?.id) {
      return toast.error("Gagal upload gambar")
    }

    statePenghargaan.create.form.imageId = uploaded.id

    await statePenghargaan.create.create()
    resetForm()
    router.push("/admin/desa/penghargaan")

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
          <Title order={3}>Create Penghargaan</Title>
          <TextInput
            value={statePenghargaan.create.form.name}
            onChange={(val) => {
              statePenghargaan.create.form.name = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Nama Penghargaan</Text>}
            placeholder="masukkan nama penghargaan"
          />
          <TextInput
            value={statePenghargaan.create.form.juara}
            onChange={(val) => {
              statePenghargaan.create.form.juara = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Juara</Text>}
            placeholder="masukkan juara"
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <CreateEditor
              value={statePenghargaan.create.form.deskripsi}
              onChange={(htmlContent) => {
                statePenghargaan.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>
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
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePenghargaan;
