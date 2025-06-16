'use client'
import colors from '@/con/colors';
import { Box, Button, Center, FileInput, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import penghargaanState from '../../../_state/desa/penghargaan';
import ApiFetch from '@/lib/api-fetch';
import CreateEditor from '../../../_com/createEditor';


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

export default CreatePenghargaan;
