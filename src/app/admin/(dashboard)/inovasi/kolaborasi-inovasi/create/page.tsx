'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconImageInPicture, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import kolaborasiInovasiState from '../../../_state/inovasi/kolaborasi-inovasi';
import { useState } from 'react';
import { toast } from 'react-toastify';
import ApiFetch from '@/lib/api-fetch';
import { Dropzone } from '@mantine/dropzone';


function CreateProgramKreatifDesa() {
  const stateCreate = useProxy(kolaborasiInovasiState)
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      tahun: 0,
      slug: "",
      deskripsi: "",
      kolaborator: "",
      imageId: "",
    }

    setPreviewImage(null);
    setFile(null);
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

    // Simpan ID gambar ke form
    stateCreate.create.form.imageId = uploaded.id;

    // Submit data berita
    await stateCreate.create.create();

    // Reset form setelah submit
    resetForm();
    router.push("/admin/inovasi/kolaborasi-inovasi")
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
          <Title order={3}>Create Kolaborasi Inovasi</Title>
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Nama Kolaborasi Inovasi</Text>}
            placeholder="masukkan nama kolaborasi inovasi"
            onChange={(val) => stateCreate.create.form.name = val.target.value}
          />
          <TextInput
            type='number'
            label={<Text fz={"sm"} fw={"bold"}>Tahun</Text>}
            placeholder="masukkan tahun"
            onChange={(val) => stateCreate.create.form.tahun = parseInt(val.target.value)}
          />
          <TextInput
            onChange={(e) => stateCreate.create.form.slug = e.currentTarget.value}
            label={<Text fw={"bold"} fz={"sm"}>Deskripsi Singkat Kolaborasi Inovasi</Text>}
            placeholder='Masukkan deskripsi singkat kolaborasi inovasi'
          />
          <TextInput
            onChange={(e) => stateCreate.create.form.kolaborator = e.currentTarget.value}
            label={<Text fw={"bold"} fz={"sm"}>Kolaborator</Text>}
            placeholder='Masukkan kolaborator'
          />
          <Box>
            <Stack gap={"xs"}>
              <Text fz={"md"} fw={"bold"}>Gambar</Text>
              <Box>
                <Dropzone
                  onDrop={(files) => {
                    const newImages = files.map((file) => ({
                      file,
                      preview: URL.createObjectURL(file),
                      label: '',
                    }));
                    setFile(newImages[0].file);
                    setPreviewImage(newImages[0].preview); // ← ini yang kurang
                  }}

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
                        Drag images here or click to select files
                      </Text>
                      <Text size="sm" c="dimmed" inline mt={7}>
                        Attach as many files as you like, each file should not exceed 5mb
                      </Text>
                    </div>
                  </Group>
                </Dropzone>
              </Box>
              {previewImage ? (
                <Image alt="" src={previewImage} w={200} h={200} />
              ) : (
                <Center w={200} h={200} bg={"gray"}>
                  <IconImageInPicture />
                </Center>
              )}
            </Stack>
          </Box>
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Kolaborasi Inovasi</Text>
            <CreateEditor
              value={stateCreate.create.form.deskripsi}
              onChange={(htmlContent) => stateCreate.create.form.deskripsi = htmlContent}
            />
          </Box>
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateProgramKreatifDesa;
