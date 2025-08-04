/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconFile, IconImageInPicture, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import apbdes from '../../../_state/landing-page/apbdes';


function CreateAPBDes() {
  const router = useRouter();
  const stateAPBDes = useProxy(apbdes)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  


  useEffect(() => {
    stateAPBDes.findMany.load();
  }, []);

  const resetForm = () => {
    stateAPBDes.create.form = {
      name: "",
      jumlah: "",
      imageId: "",
      fileId: "",
    };
    setImageFile(null);
    setDocFile(null);
    setPreviewImage(null);
  };
  const handleSubmit = async () => {
    if (!imageFile || !docFile) {
      return toast.warn("Pilih gambar dan dokumen terlebih dahulu");
    }
  
    try {
      const [uploadImageRes, uploadDocRes] = await Promise.all([
        ApiFetch.api.fileStorage.create.post({ file: imageFile, name: imageFile.name }),
        ApiFetch.api.fileStorage.create.post({ file: docFile, name: docFile.name }),
      ]);
  
      const imageId = uploadImageRes?.data?.data?.id;
      const fileId = uploadDocRes?.data?.data?.id;
  
      if (!imageId || !fileId) {
        return toast.error("Gagal mengupload file");
      }
  
      stateAPBDes.create.form.imageId = imageId;
      stateAPBDes.create.form.fileId = fileId;
  
      await stateAPBDes.create.create();
  
      toast.success("Berhasil menambahkan APBDes");
      resetForm();
      router.push("/admin/landing-page/APBDes");
    } catch (error) {
      console.error("Gagal submit:", error);
      toast.error("Gagal menyimpan data");
    }
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
          <Title order={4}>Create APBDes</Title>
          <Box>
            <Text fz={"md"} fw={"bold"}>File Image</Text>
            <Box>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0]; // Ambil file pertama
                  if (selectedFile) {
                    setImageFile(selectedFile);
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
                    height="500px"
                    style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                  />
                ) : (
                  <Text>Tidak ada image tersedia</Text>
                )}
              </Box>
            </Box>
          </Box>
          <Box>
            <Text fz={"md"} fw={"bold"}>File Dokumen</Text>
            <Box>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0]; // Ambil file pertama
                  if (selectedFile) {
                    setDocFile(selectedFile);
                    setPreviewDoc(URL.createObjectURL(selectedFile)); // Buat preview
                  }
                }}
                onReject={() => toast.error('File tidak valid.')}
                maxSize={5 * 1024 ** 2} // Maks 5MB
                accept={{
                  'application/*': ['.pdf', '.doc', '.docx'],
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
                    <IconFile size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                  </Dropzone.Idle>

                  <div>
                    <Text size="xl" inline>
                      Drag file ke sini atau klik untuk pilih file
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Maksimal 5MB dan harus format dokumen
                    </Text>
                  </div>
                </Group>
              </Dropzone>
              <Box>
                <Text fw={"bold"} fz={"lg"}>Dokumen</Text>
                {previewDoc ? (
                  <iframe
                    src={previewDoc}
                    width="100%"
                    height="500px"
                    style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                  />
                ) : (
                  <Text>Tidak ada dokumen tersedia</Text>
                )}
              </Box>
            </Box>
          </Box>
          <TextInput
            value={stateAPBDes.create.form.name}
            onChange={(val) => {
              stateAPBDes.create.form.name = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Judul</Text>}
            placeholder='Masukkan judul'
          />
           <TextInput
            value={stateAPBDes.create.form.jumlah}
            onChange={(val) => {
              stateAPBDes.create.form.jumlah = val.target.value;
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

export default CreateAPBDes;
