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
import infoWabahPenyakit from '../../../_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';

function CreateInfoWabahPenyakit() {
  const router = useRouter();
  const infoWabahPenyakitState = useProxy(infoWabahPenyakit)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    // Reset state di valtio
    infoWabahPenyakitState.create.form = {
      name: "",
      deskripsiSingkat: "",
      deskripsiLengkap: "",
      imageId: "",
    };

    // Reset state lokal
    setPreviewImage(null);
    setFile(null);
  };

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

    // Simpan ID gambar ke form
    infoWabahPenyakitState.create.form.imageId = uploaded.id;

    // Submit data berita
    await infoWabahPenyakitState.create.create();

    // Reset form setelah submit
    resetForm();
    router.push("/admin/kesehatan/info-wabah-penyakit")
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
          <Title order={3}>Create Info Wabah Penyakit</Title>
          <TextInput
            value={infoWabahPenyakitState.create.form.name}
            onChange={(val) => {
              infoWabahPenyakitState.create.form.name = val.target.value;
            }}
            label={<Text fz="sm" fw="bold">Judul</Text>}
            placeholder="masukkan judul"
          />

          <TextInput
            value={infoWabahPenyakitState.create.form.deskripsiSingkat}
            onChange={(val) => {
              infoWabahPenyakitState.create.form.deskripsiSingkat = val.target.value;
            }}
            label={<Text fz="sm" fw="bold">Deskripsi Singkat</Text>}
            placeholder="masukkan deskripsi"
          />

          <Box>
            <Text fz="sm" fw="bold">Deskripsi</Text>
            <CreateEditor
              value={infoWabahPenyakitState.create.form.deskripsiLengkap}
              onChange={(val) => {
                infoWabahPenyakitState.create.form.deskripsiLengkap = val;
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

export default CreateInfoWabahPenyakit;
