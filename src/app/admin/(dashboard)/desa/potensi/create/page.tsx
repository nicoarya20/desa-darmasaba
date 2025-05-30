'use client';

import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import potensiDesaState from '../../../_state/desa/potensi';
import { useRouter } from 'next/navigation';
import CreateEditor from '../../../_com/createEditor';


function CreatePotensi() {
  const potensiState = useProxy(potensiDesaState);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!file) return toast.warn('Pilih file gambar terlebih dahulu');

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error('Gagal upload gambar');
    }

    potensiState.create.form.imageId = uploaded.id;

    await potensiState.create.create();

    resetForm();
    router.push('/admin/desa/potensi');
  };

  const resetForm = () => {
    potensiState.create.form = {
      name: '',
      deskripsi: '',
      kategori: '',
      imageId: '',
      content: '',
    };

    setPreviewImage(null);
    setFile(null);
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Create Potensi</Title>

          <TextInput
            value={potensiState.create.form.name}
            onChange={(val) => (potensiState.create.form.name = val.target.value)}
            label={<Text fz="sm" fw="bold">Judul</Text>}
            placeholder="masukkan judul"
          />

          <TextInput
            value={potensiState.create.form.deskripsi}
            onChange={(val) => (potensiState.create.form.deskripsi = val.target.value)}
            label={<Text fz="sm" fw="bold">Deskripsi</Text>}
            placeholder="masukkan deskripsi"
          />

          <TextInput
            value={potensiState.create.form.kategori}
            onChange={(val) => (potensiState.create.form.kategori = val.target.value)}
            label={<Text fz="sm" fw="bold">Kategori</Text>}
            placeholder="masukkan kategori"
          />

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

          <Box>
            <Text fz="sm" fw="bold">Konten</Text>
            <CreateEditor
              value={potensiState.create.form.content}
              onChange={(htmlContent) => {
                potensiState.create.form.content = htmlContent;
              }}
            />
          </Box>

          <Button bg={colors['blue-button']} onClick={handleSubmit}>
            Simpan Potensi
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePotensi;
