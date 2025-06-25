'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import posyandustate from '../../../_state/kesehatan/posyandu/posyandu';

function CreatePosyandu() {
  const statePosyandu = useProxy(posyandustate)
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const resetForm = () => {
    statePosyandu.create.form = {
      name: "",
      nomor: "",
      deskripsi: "",
      imageId: "",
    };

    setFile(null);
    setPreviewImage(null);
  }

  const handleSubmit = async () => {
    if (!file) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }

    // Upload gambar dulu
    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error("Gagal upload gambar");
    }

    statePosyandu.create.form.imageId = uploaded.id;

    await statePosyandu.create.create();

    resetForm();
    router.push("/admin/kesehatan/posyandu")
  }



  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Posyandu</Title>
          {previewImage ? (
            <Image alt="" src={previewImage} w={200} h={200} />
          ) : (
            <Center w={200} h={200} bg={"gray"}>
              <IconImageInPicture />
            </Center>
          )}
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
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Nama Posyandu</Text>}
            placeholder='Masukkan nama posyandu'
            value={statePosyandu.create.form.name}
            onChange={(e) => {
              statePosyandu.create.form.name = e.target.value;
            }}
          />
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Nomor Posyandu</Text>}
            placeholder='Masukkan nomor posyandu'
            value={statePosyandu.create.form.nomor}
            onChange={(e) => {
              statePosyandu.create.form.nomor = e.target.value;
            }}
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Posyandu</Text>
            <CreateEditor
              value={statePosyandu.create.form.deskripsi}
              onChange={(htmlContent) => {
                statePosyandu.create.form.deskripsi = htmlContent;
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

export default CreatePosyandu;
