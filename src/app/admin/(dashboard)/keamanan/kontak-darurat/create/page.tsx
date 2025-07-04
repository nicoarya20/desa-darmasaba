'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import kontakDaruratKeamananState from '../../../_state/keamanan/kontak-darurat-keamanan';


function CreateKontakDarurat() {
  const kontakState = useProxy(kontakDaruratKeamananState)
  const router = useRouter();
  const [fileUtama, setFileUtama] = useState<File | null>(null);
  const [previewUtama, setPreviewUtama] = useState<string | null>(null);
  const [fileItem, setFileItem] = useState<File | null>(null);
  const [previewItem, setPreviewItem] = useState<string | null>(null);


  const resetForm = () => {
    kontakState.create.form = {
      nama: "",
      imageId: "",
      kontakItems: [
        {
          nama: "",
          nomorTelepon: "",
          imageId: "",
        },
      ],
    }
    setPreviewUtama(null);
    setFileUtama(null);
    setPreviewItem(null);
    setFileItem(null);
  }

  const handleSubmit = async () => {
    if (!fileUtama) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }

    const res = await ApiFetch.api.fileStorage.create.post({
      file: fileUtama,
      name: fileUtama.name,
    })

    const uploaded = res.data?.data;

    if (!uploaded?.id) {
      return toast.error("Gagal mengupload file");
    }

    kontakState.create.form.imageId = uploaded.id;

    if (!fileItem) {
      return toast.error("Pilih file gambar terlebih dahulu");
    }

    const resItem = await ApiFetch.api.fileStorage.create.post({
      file: fileItem,
      name: fileItem.name,
    })

    const uploadedItem = resItem.data?.data;

    if (!uploadedItem?.id) {
      return toast.error("Gagal mengupload file");
    }

    kontakState.create.form.kontakItems[0].imageId = uploadedItem.id;

    await kontakState.create.create();

    resetForm();
    router.push('/admin/keamanan/kontak-darurat');
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
          <Title order={4}>Create Kontak Darurat</Title>
          <TextInput
            value={kontakState.create.form.nama}
            onChange={(val) => {
              kontakState.create.form.nama = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nama Kategori Darurat</Text>}
            placeholder='Masukkan nama Kategori Darurat'
          />
          <Box>
            <Text fz={"md"} fw={"bold"}>Gambar</Text>
            <Box>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0]; // Ambil file pertama
                  if (selectedFile) {
                    setFileUtama(selectedFile);
                    setPreviewUtama(URL.createObjectURL(selectedFile)); // Buat preview
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
              {previewUtama && (
                <Box mt="sm">
                  <Image
                    src={previewUtama}
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
            label={<Text fw={"bold"} fz={"sm"}>Nama Kontak</Text>}
            placeholder='Masukkan nama Kontak'
            value={kontakState.create.form.kontakItems[0].nama}
            onChange={(val) => {
              kontakState.create.form.kontakItems[0].nama = val.target.value;
            }}
          />
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Nomor Telepon Kontak</Text>}
            placeholder='Masukkan nomor telepon Kontak'
            value={kontakState.create.form.kontakItems[0].nomorTelepon}
            onChange={(val) => {
              kontakState.create.form.kontakItems[0].nomorTelepon = val.target.value;
            }}
          />
          <Box>
            <Text fz={"md"} fw={"bold"}>Gambar</Text>
            <Box>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0]; // Ambil file pertama
                  if (selectedFile) {
                    setFileItem(selectedFile);
                    setPreviewItem(URL.createObjectURL(selectedFile)); // Buat preview
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
              {previewItem && (
                <Box mt="sm">
                  <Image
                    src={previewItem}
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
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateKontakDarurat;
