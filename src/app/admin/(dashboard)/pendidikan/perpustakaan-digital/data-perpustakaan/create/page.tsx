'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function CreateDataPerpustakaan() {
  const createState = useProxy(perpustakaanDigitalState.dataPerpustakaan)
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    perpustakaanDigitalState.kategoriBuku.findMany.load();
  }, []);

  const resetForm = () => {
    createState.create.form = {
      judul: "",
      deskripsi: "",
      imageId: "",
      kategoriId: "",
    };

    setPreviewImage(null)
    setFile(null)
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

    createState.create.form.imageId = uploaded.id;
    await createState.create.create();
    resetForm();
    router.push("/admin/pendidikan/perpustakaan-digital/data-perpustakaan")
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
          <Title order={4}>Create Data Perpustakaan</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Judul</Text>}
            placeholder='Masukkan judul'
            value={createState.create.form.judul}
            onChange={(val) => {
              createState.create.form.judul = val.target.value;
            }}
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi</Text>
            <CreateEditor
              value={createState.create.form.deskripsi}
              onChange={(val) => {
                createState.create.form.deskripsi = val;
              }}
            />
          </Box>
          <Select
            label={<Text fw={"bold"} fz={"sm"}>Kategori</Text>}
            placeholder='Pilih kategori'
            value={createState.create.form.kategoriId || ""}
            onChange={(val) => {
              createState.create.form.kategoriId = val ?? "";
            }}
            data={perpustakaanDigitalState.kategoriBuku.findMany.data?.map((item) => ({
              value: item.id,
              label: item.name,
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
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateDataPerpustakaan;
