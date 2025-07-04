/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, MultiSelect, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import pasarDesaState from '../../../../_state/ekonomi/pasar-desa/pasar-desa';

function CreatePasarDesa() {
  const router = useRouter();
  const statePasar = useProxy(pasarDesaState)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    statePasar.kategoriProduk.findMany.load();
  }, []);

  const resetForm = () => {
    statePasar.pasarDesa.create.form = {
      nama: "",
      harga: 0,
      alamatUsaha: "",
      imageId: "",
      rating: 0,
      kategoriId: [],
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

    statePasar.pasarDesa.create.form.imageId = uploaded.id;

    await statePasar.pasarDesa.create.create();

    resetForm();
    router.push("/admin/ekonomi/pasar-desa/produk-pasar-desa")
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
          <Title order={4}>Create Pasar Desa</Title>
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
            value={statePasar.pasarDesa.create.form.nama}
            onChange={(val) => {
              statePasar.pasarDesa.create.form.nama = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nama Produk</Text>}
            placeholder='Masukkan nama produk'
          />
          <TextInput
            value={statePasar.pasarDesa.create.form.harga}
            onChange={(val) => {
              statePasar.pasarDesa.create.form.harga = Number(val.target.value);
            }}
            label={<Text fw={"bold"} fz={"sm"}>Harga Produk</Text>}
            placeholder='Masukkan harga produk'
          />
          <TextInput
            type="number"
            min={0}
            max={5}
            step={0.1} // bisa pakai 0.1 biar support desimal
            value={statePasar.pasarDesa.create.form.rating}
            onChange={(val) => {
              const value = Number(val.target.value);

              // Validasi manual juga boleh (jaga-jaga)
              if (value >= 0 && value <= 5) {
                statePasar.pasarDesa.create.form.rating = value;
              }
            }}
            label={<Text fw={"bold"} fz={"sm"}>Rating Produk</Text>}
            placeholder='Masukkan rating produk (0-5)'
          />

          <TextInput
            value={statePasar.pasarDesa.create.form.alamatUsaha}
            onChange={(val) => {
              statePasar.pasarDesa.create.form.alamatUsaha = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Alamat Usaha</Text>}
            placeholder='Masukkan alamat usaha'
          />
          <MultiSelect
            value={statePasar.pasarDesa.create.form.kategoriId}
            onChange={(val) => {
              statePasar.pasarDesa.create.form.kategoriId = val;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Kategori Produk</Text>}
            placeholder='Pilih kategori produk'
            data={
              statePasar.kategoriProduk.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama
              })) || []
            }
          />

          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePasarDesa;
