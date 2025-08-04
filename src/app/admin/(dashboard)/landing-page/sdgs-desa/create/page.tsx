/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconImageInPicture, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import sdgsDesa from '../../../_state/landing-page/sdgs-desa';


function CreateSDGsDesa() {
  const router = useRouter();
  const stateSDGSDesa = useProxy(sdgsDesa)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);


  useEffect(() => {
    stateSDGSDesa.findMany.load();
  }, []);

  const resetForm = () => {
    stateSDGSDesa.create.form = {
      name: "",
      jumlah: "",
      imageId: "",
    };
    setFile(null);
    setPreviewImage(null);
  };
  const handleSubmit = async () => {
    if (!file) {
      return toast.warn("Pilih file image terlebih dahulu");
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    })

    const uploaded = res.data?.data;

    if (!uploaded?.id) {
      return toast.error("Gagal mengupload file");
    }

    stateSDGSDesa.create.form.imageId = uploaded.id;

    await stateSDGSDesa.create.create();

    resetForm();
    router.push("/admin/landing-page/SDGs-Desa")
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
          <Title order={4}>Create SDGs Desa</Title>
          <Box>
            <Text fz={"md"} fw={"bold"}>File Image</Text>
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
                accept={{
                  'application/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
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
                    <IconImageInPicture size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                  </Dropzone.Idle>

                  <div>
                    <Text size="xl" inline>
                      Drag file ke sini atau klik untuk pilih file
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Maksimal 5MB dan harus format image
                    </Text>
                  </div>
                </Group>
              </Dropzone>
              <Box>
                <Text fw={"bold"} fz={"lg"}>Dokumen</Text>
                {previewImage ? (
                  <iframe
                    src={previewImage}
                    width="100%"
                    height="250px"
                    style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                  />
                ) : (
                  <Text>Tidak ada image tersedia</Text>
                )}
              </Box>
            </Box>
          </Box>
          <TextInput
            value={stateSDGSDesa.create.form.name}
            onChange={(val) => {
              stateSDGSDesa.create.form.name = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Judul</Text>}
            placeholder='Masukkan judul'
          />
           <TextInput
           type='number'
            value={stateSDGSDesa.create.form.jumlah}
            onChange={(val) => {
              stateSDGSDesa.create.form.jumlah = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Jumlah</Text>}
            placeholder='Masukkan jumlah'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateSDGsDesa;
