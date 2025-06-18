'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateSuratKeterangan() {
  const stateSurat = useProxy(stateLayananDesa.suratKeterangan)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter()

  const resetForm = () => {
    stateSurat.create.form = {
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

    const res = await ApiFetch.api.fileStorage.create.post({
      file: file,
      name: file.name
    })

    const uploaded = res.data?.data
    if (!uploaded?.id) {
      return toast.error("Gagal upload gambar")
    }

    stateSurat.create.form.imageId = uploaded.id

    await stateSurat.create.create()
    resetForm()
    router.push("/admin/desa/layanan/pelayanan_surat_keterangan")

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
          <Title order={3}>Create Surat Keterangan</Title>
          <TextInput
            value={stateSurat.create.form.name}
            onChange={(val) => {
              stateSurat.create.form.name = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Nama Surat Keterangan</Text>}
            placeholder="masukkan nama surat keterangan"
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Konten</Text>
            <CreateEditor
              value={stateSurat.create.form.deskripsi}
              onChange={(htmlContent) => {
                stateSurat.create.form.deskripsi = htmlContent;
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

export default CreateSuratKeterangan;
