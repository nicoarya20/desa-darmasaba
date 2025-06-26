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
import penangananDarurat from '../../../_state/kesehatan/penanganan-darurat/penangananDarurat';


function CreatePenangananDarurat() {
  const router = useRouter();
  const penangananDaruratState = useProxy(penangananDarurat)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    penangananDaruratState.create.form = {
      name: "",
      deskripsi: "",
      imageId: "",
    };
    setPreviewImage(null);
    setFile(null);
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

    penangananDaruratState.create.form.imageId = uploaded.id;

    await penangananDaruratState.create.create();

    resetForm();
    router.push("/admin/kesehatan/penanganan-darurat")
  }
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Create Penanganan Darurat</Title>

          <TextInput
            value={penangananDaruratState.create.form.name}
            onChange={(val) => {
              penangananDaruratState.create.form.name = val.target.value;
            }}
            label={<Text fz="sm" fw="bold">Judul</Text>}
            placeholder="masukkan judul"
          />

          <Box>
            <Text fz="sm" fw="bold">Deskripsi</Text>
            <CreateEditor
              value={penangananDaruratState.create.form.deskripsi}
              onChange={(val) => {
                penangananDaruratState.create.form.deskripsi = val;
              }}
            />
          </Box>

            <FileInput
              label={<Text fz="sm" fw="bold">Upload Gambar</Text>}
              value={file}
              onChange={async (e) => {
                if (!e) return;
                setFile(e);
                const base64 = await e.arrayBuffer().then((buf) =>
                  'data:image/png;base64,' + Buffer.from(buf).toString('base64')
                );
                setPreviewImage(base64);
              }}
            />

            {previewImage ? (
              <Image alt="" src={previewImage} w={200} h={200} />
            ) : (
              <Center w={200} h={200} bg="gray">
                <IconImageInPicture />
              </Center>
            )}

            <Button onClick={handleSubmit} bg={colors['blue-button']}>
              Simpan 
            </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePenangananDarurat;
