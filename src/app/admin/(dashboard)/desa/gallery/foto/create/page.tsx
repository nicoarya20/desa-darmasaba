'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';



function CreateFoto() {
  const fotoState = useProxy(stateGallery.foto)
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    fotoState.create.form = {
      name: "",
      deskripsi: "",
      imagesId: "",
    };

    setPreviewImage(null)
    setFile(null)
  };

  const handleSubmit = async () => {
    if (!file) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error("Gagal upload gambar");
    }

    fotoState.create.form.imagesId = uploaded.id;
    await fotoState.create.create();
    resetForm();
    router.push("/admin/desa/gallery/foto")
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
          <Title order={4}>Create Foto</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Judul Foto</Text>}
            placeholder='Masukkan judul foto'
            value={fotoState.create.form.name}
            onChange={(val) => {
              fotoState.create.form.name = val.target.value;
            }}
          />
          <FileInput
            label={<Text fz={"sm"} fw={"bold"}>Upload Gambar</Text>}
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
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Foto</Text>
            <CreateEditor
              value={fotoState.create.form.deskripsi}
              onChange={(val) => {
                fotoState.create.form.deskripsi = val;
              }}
            />
          </Box>
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateFoto;
