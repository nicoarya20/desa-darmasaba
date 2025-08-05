'use client';

import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';



function CreatePotensi() {
  const potensiState = useProxy(potensiDesaState.potensiDesa);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    potensiDesaState.kategoriPotensi.findMany.load()
  }, [])

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
    router.push('/admin/desa/potensi/list-potensi');
  };

  const resetForm = () => {
    potensiState.create.form = {
      name: '',
      deskripsi: '',
      kategoriId: '',
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

          <Select
            label={<Text fw={"bold"} fz={"sm"}>Kategori</Text>}
            placeholder='Pilih kategori'
            value={potensiState.create.form.kategoriId || ""}
            onChange={(val) => {
              potensiState.create.form.kategoriId = val ?? "";
            }}
            data={potensiDesaState.kategoriPotensi.findMany.data?.map((item) => ({
              value: item.id,
              label: item.nama,
            }))}
          />

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
