'use client';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title,
  Text,
  Select,
  ActionIcon,
  Image,
  NumberInput,
  Loader,
  Center
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../../../_state/ekonomi/umkm/umkm';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import ApiFetch from '@/lib/api-fetch';

export default function EditProdukUmkm() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const state = useProxy(umkmState.produk);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    umkmState.umkm.findMany.load(1, 100);
    umkmState.kategoriProduk.findManyAll.load();
    state.findUnique.load(id);
  }, [id]);

  useEffect(() => {
    if (state.findUnique.data) {
      const d = state.findUnique.data;
      state.update.form = {
        nama: d.nama || "",
        harga: d.harga || 0,
        stok: d.stok || 0,
        umkmId: d.umkmId || "",
        deskripsi: d.deskripsi || "",
        imageId: d.imageId || "",
        kategoriId: d.kategoriProdukId || "",
        isActive: d.isActive ?? true,
      };
      if (d.imageId) {
        setPreviewImage(`/api/filestorage/file/${d.imageId}`);
      }
    }
  }, [state.findUnique.data]);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      let uploadedImageId = state.update.form.imageId;
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name
        });
        
        const uploaded = res.data?.data;
        if (uploaded?.id) {
          uploadedImageId = uploaded.id;
        } else {
          return toast.error("Gagal mengunggah foto produk");
        }
      }

      state.update.form.imageId = uploadedImageId;
      const success = await state.update.submit(id);

      if (success) {
        router.push('/admin/ekonomi/umkm/produk');
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state.findUnique.loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <Box>
      <Group mb="lg">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          leftSection={<IconArrowBack size={20} />}
        >
          Kembali
        </Button>
      </Group>

      <Paper w={{ base: '100%', md: '50%' }} withBorder p="xl" radius="md" shadow="sm">
        <Stack gap="lg">
          <Title order={3}>Edit Produk UMKM</Title>
          <Box>
            <Text fw={500} size="sm" mb={4}>Foto Produk</Text>
            {!previewImage ? (
              <Dropzone
                onDrop={(files) => {
                  const file = files[0];
                  setFile(file);
                  setPreviewImage(URL.createObjectURL(file));
                }}
                maxSize={3 * 1024 ** 2}
                accept={IMAGE_MIME_TYPE}
                radius="md"
              >
                <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
                  <Dropzone.Idle>
                    <IconPhoto size={42} stroke={1.5} />
                  </Dropzone.Idle>
                  <Box>
                    <Text size="xl" inline>Pilih gambar produk</Text>
                    <Text size="sm" c="dimmed" inline mt={7}>Maksimal 3MB</Text>
                  </Box>
                </Group>
              </Dropzone>
            ) : (
              <Box pos="relative" w="fit-content">
                <Image src={previewImage} h={200} radius="md" alt="Preview" />
                <ActionIcon color="red" variant="filled" pos="absolute" top={5} right={5} onClick={() => { setPreviewImage(null); setFile(null); state.update.form.imageId = ""; }}>
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>

          <Select
            label="Pilih UMKM Pemilik"
            placeholder="Siapa pemilik produk ini?"
            required
            searchable
            data={umkmState.umkm.findMany.data?.map(v => ({
              value: v.id, label: v.nama
            })) || []}
            value={state.update.form.umkmId}
            onChange={(val) => (state.update.form.umkmId = val || "")}
          />

          <TextInput
            label="Nama Produk"
            placeholder="Contoh: Kripik Singkong Pedas"
            required
            value={state.update.form.nama}
            onChange={(e) => (state.update.form.nama = e.target.value)}
          />

          <Group grow>
            <NumberInput
              label="Harga Produk (Rp)"
              placeholder="0"
              required
              min={0}
              thousandSeparator="."
              decimalSeparator=","
              value={state.update.form.harga}
              onChange={(val) => (state.update.form.harga = Number(val))}
            />
            <NumberInput
              label="Stok"
              placeholder="0"
              required
              min={0}
              value={state.update.form.stok}
              onChange={(val) => (state.update.form.stok = Number(val))}
            />
          </Group>

          <Select
            label="Kategori Produk"
            placeholder="Pilih kategori produk"
            required
            data={umkmState.kategoriProduk.findManyAll.data?.map(v => ({
              value: v.id, label: v.nama
            })) || []}
            value={state.update.form.kategoriId}
            onChange={(val) => (state.update.form.kategoriId = val || "")}
          />

          <Box>
            <Text fw={500} size="sm" mb={4}>Deskripsi Produk</Text>
            <CreateEditor
              value={state.update.form.deskripsi || ""}
              onChange={(val) => (state.update.form.deskripsi = val)}
            />
          </Box>

          <Group justify="flex-end" mt="xl">
            <Button color="blue" onClick={handleUpdate} loading={isSubmitting}>Simpan Perubahan</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
