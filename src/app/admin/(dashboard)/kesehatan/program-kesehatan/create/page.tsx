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
import programKesehatan from '../../../_state/kesehatan/program-kesehatan/programKesehatan';

function CreateProgramKesehatan() {
  const router = useRouter();
  const programKesehatanState = useProxy(programKesehatan)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    // Reset state di valtio
    programKesehatanState.create.form = {
      name: "",
      deskripsiSingkat: "",
      deskripsi: "",
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
    programKesehatanState.create.form.imageId = uploaded.id;

    // Submit data berita
    await programKesehatanState.create.create();

    // Reset form setelah submit
    resetForm();
    router.push("/admin/kesehatan/program-kesehatan")
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
          <Title order={3}>Create Program Kesehatan</Title>
          <TextInput
            value={programKesehatanState.create.form.name}
            onChange={(val) => {
              programKesehatanState.create.form.name = val.target.value;
            }}
            label={<Text fz="sm" fw="bold">Judul</Text>}
            placeholder="masukkan judul"
          />

          <TextInput
            value={programKesehatanState.create.form.deskripsiSingkat}
            onChange={(val) => {
              programKesehatanState.create.form.deskripsiSingkat = val.target.value;
            }}
            label={<Text fz="sm" fw="bold">Deskripsi Singkat</Text>}
            placeholder="masukkan deskripsi"
          />

          <Box>
            <Text fz="sm" fw="bold">Deskripsi</Text>
            <CreateEditor
              value={programKesehatanState.create.form.deskripsi}
              onChange={(val) => {
                programKesehatanState.create.form.deskripsi = val;
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

export default CreateProgramKesehatan;
