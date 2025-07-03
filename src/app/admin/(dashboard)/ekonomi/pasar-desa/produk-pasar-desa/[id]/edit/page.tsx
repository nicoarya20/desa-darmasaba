/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import pasarDesaState from '@/app/admin/(dashboard)/_state/ekonomi/pasar-desa/pasar-desa';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, MultiSelect, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPasarDesa() {
  const pasarState = useProxy(pasarDesaState)
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nama: pasarState.pasarDesa.edit.form.nama || "",
    harga: pasarState.pasarDesa.edit.form.harga || 0,
    alamatUsaha: pasarState.pasarDesa.edit.form.alamatUsaha || "",
    imageId: pasarState.pasarDesa.edit.form.imageId || "",
    rating: pasarState.pasarDesa.edit.form.rating || 0,
    kategoriId: pasarState.pasarDesa.edit.form.kategoriId || [],
  })

  useEffect(() => {
    pasarState.kategoriProduk.findMany.load();
    const loadPasarDesa = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await pasarState.pasarDesa.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama || "",
            harga: data.harga || 0,
            alamatUsaha: data.alamatUsaha || "",
            imageId: data.imageId || "",
            rating: data.rating || 0,
            kategoriId: data.kategori?.map((k: any) => k.nama) || [],
          });
          // Tampilkan preview gambar
          if (data.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading pasar desa:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengambil data pasar desa"
        );
      }
    }

    loadPasarDesa();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      pasarState.pasarDesa.edit.form = {
        ...pasarState.pasarDesa.edit.form,
        nama: formData.nama,
        harga: formData.harga,
        alamatUsaha: formData.alamatUsaha,
        imageId: formData.imageId,
        rating: formData.rating,
        kategoriId: formData.kategoriId,
      }
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // Update imageId in global state
        pasarState.pasarDesa.edit.form.imageId = uploaded.id;
      }

      await pasarState.pasarDesa.edit.update();
      toast.success("Tips Keamanan berhasil diperbarui!");
      router.push("/admin/ekonomi/pasar-desa/produk-pasar-desa");
    } catch (error) {
      console.error("Error updating pasar desa:", error);
      toast.error("Terjadi kesalahan saat memperbarui pasar desa");
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
          <Title order={4}>Edit Pasar Desa</Title>
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
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nama Produk</Text>}
            placeholder='Masukkan nama produk'
          />
          <TextInput
            value={formData.harga}
            onChange={(e) => setFormData({ ...formData, harga: Number(e.target.value) })}
            label={<Text fw={"bold"} fz={"sm"}>Harga Produk</Text>}
            placeholder='Masukkan harga produk'
          />
          <TextInput
            type="number"
            min={0}
            max={5}
            step={0.1} // bisa pakai 0.1 biar support desimal
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
            label={<Text fw={"bold"} fz={"sm"}>Rating Produk</Text>}
            placeholder='Masukkan rating produk (0-5)'
          />

          <TextInput
            value={formData.alamatUsaha}
            onChange={(e) => setFormData({ ...formData, alamatUsaha: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Alamat Usaha</Text>}
            placeholder='Masukkan alamat usaha'
          />

          <TextInput
            value={formData.alamatUsaha}
            onChange={(e) => setFormData({ ...formData, alamatUsaha: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Alamat Usaha</Text>}
            placeholder='Masukkan alamat usaha'
          />
          <MultiSelect
            value={formData.kategoriId}
            onChange={(val) => {
              setFormData({ ...formData, kategoriId: val });
            }}
            label={<Text fw={"bold"} fz={"sm"}>Kategori Produk</Text>}
            placeholder='Pilih kategori produk'
            data={
              pasarState.kategoriProduk.findMany.data?.map((v) => ({
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

export default EditPasarDesa;
