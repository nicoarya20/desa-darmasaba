'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import desaDigitalState from '../../../_state/inovasi/desa-digital';
import { Dropzone } from '@mantine/dropzone';


function CreateDesaDigital() {
  const stateDesaDigital = useProxy(desaDigitalState)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter()

  const resetForm = () => {
    stateDesaDigital.create.form = {
      name: "",
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

    try {
      // Upload the image first
      const uploadRes = await ApiFetch.api.fileStorage.create.post({
        file: file,
        name: file.name
      })

      const uploaded = uploadRes.data?.data
      if (!uploaded?.id) {
        return toast.error("Gagal upload gambar")
      }

      // Set the image ID in the form
      stateDesaDigital.create.form.imageId = uploaded.id

      // Submit the form
      const success = await stateDesaDigital.create.create()

      if (success) {
        resetForm()
        router.push("/admin/inovasi/desa-digital-smart-village")
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast.error("Terjadi kesalahan saat menyimpan data")
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
          <Title order={3}>Create Desa Digital Smart Village</Title>
          <TextInput
            value={stateDesaDigital.create.form.name}
            onChange={(val) => {
              stateDesaDigital.create.form.name = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Nama Desa Digital Smart Village</Text>}
            placeholder="masukkan nama desa digital smart village"
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <CreateEditor
              value={stateDesaDigital.create.form.deskripsi}
              onChange={(htmlContent) => {
                stateDesaDigital.create.form.deskripsi = htmlContent;
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

export default CreateDesaDigital;
