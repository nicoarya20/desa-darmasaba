/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import profileLandingPageState from '../../../../_state/landing-page/profile';

function CreateProgramInovasi() {
  const router = useRouter();
  const stateProgramInovasi = useProxy(profileLandingPageState.programInovasi)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    stateProgramInovasi.findMany.load();
  }, []);

  const resetForm = () => {
    stateProgramInovasi.create.form = {
      name: "",
      description: "",
      imageId: "",
      link: "",
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
    })

    const uploaded = res.data?.data;

    if (!uploaded?.id) {
      return toast.error("Gagal mengupload file");
    }

    stateProgramInovasi.create.form.imageId = uploaded.id;

    await stateProgramInovasi.create.create();

    resetForm();
    router.push("/admin/landing-page/profile/program-inovasi")
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
          <Title order={4}>Create Program Inovasi</Title>
          <Box>
            <Text fz={"md"} fw={"bold"}>Gambar</Text>
            <Box>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0]; // Ambil file pertama
                  if (selectedFile) {
                    setFile(selectedFile);
                    setPreviewImage(URL.createObjectURL(selectedFile)); // Buat preview
                  }
                }}
                onReject={() => toast.error('File tidak valid.')}
                maxSize={5 * 1024 ** 2} // Maks 5MB
                accept={{ 'image/*': [] }}
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
                      Drag gambar ke sini atau klik untuk pilih file
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Maksimal 5MB dan harus format gambar
                    </Text>
                  </div>
                </Group>
              </Dropzone>

              {/* Tampilkan preview kalau ada */}
              {previewImage && (
                <Box mt="sm">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                  />
                </Box>
              )}

            </Box>
          </Box>
          <TextInput
            value={stateProgramInovasi.create.form.name || ''}
            onChange={(val) => {
              stateProgramInovasi.create.form.name = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nama Program Inovasi</Text>}
            placeholder='Masukkan nama program inovasi'
          />
          <TextInput
            value={stateProgramInovasi.create.form.description || ''}
            onChange={(val) => {
              stateProgramInovasi.create.form.description = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Deskripsi</Text>}
            placeholder='Masukkan deskripsi'
          />

          <TextInput
            value={stateProgramInovasi.create.form.link || ''}
            onChange={(val) => {
              stateProgramInovasi.create.form.link = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Link</Text>}
            placeholder='Masukkan link'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateProgramInovasi;
