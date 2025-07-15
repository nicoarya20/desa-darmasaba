'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import infoTeknoState from '../../../_state/inovasi/info-tekno';


function CreateInfoTeknologiTepatGuna() {
  const stateInfoTekno = useProxy(infoTeknoState)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter()

  const resetForm = () => {
    stateInfoTekno.create.form = {
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
      stateInfoTekno.create.form.imageId = uploaded.id

      // Submit the form
      const success = await stateInfoTekno.create.create()
      
      if (success) {
        resetForm()
        router.push("/admin/inovasi/info-teknologi-tepat-guna")
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
          <Title order={3}>Create Info Teknologi Tepat Guna</Title>
          <TextInput
            value={stateInfoTekno.create.form.name}
            onChange={(val) => {
              stateInfoTekno.create.form.name = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Nama Info Teknologi Tepat Guna</Text>}
            placeholder="masukkan nama info teknologi tepat guna"
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <CreateEditor
              value={stateInfoTekno.create.form.deskripsi}
              onChange={(htmlContent) => {
                stateInfoTekno.create.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <FileInput
            label={<Text fz={"sm"} fw={"bold"}>Upload Gambar Konten</Text>}
            value={file}
            onChange={async (e) => {
              if (!e) return;
              setFile(e);
              const base64 = await e.arrayBuffer().then((buf) =>
                "data:image/png;base64," + Buffer.from(buf).toString("base64")
              );
              setPreviewImage(base64);
            }}
          />
          {previewImage ? (
            <Image alt="" src={previewImage} w={200} h={200} />
          ) : (
            <Center w={200} h={200} bg={"gray"}>
              <IconImageInPicture />
            </Center>
          )}
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateInfoTeknologiTepatGuna;
