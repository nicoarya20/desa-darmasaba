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

export default function EditDataUmkm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const state = useProxy(umkmState.umkm);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        umkmState.kategoriProduk.findManyAll.load(),
        state.findUnique.load(id)
      ]);

      if (state.findUnique.data) {
        const data = state.findUnique.data;
        state.update.form = {
          nama: data.nama || "",
          pemilik: data.pemilik || "",
          kategoriId: data.kategoriId || "",
          deskripsi: data.deskripsi || "",
          alamat: data.alamat || "",
          kontak: data.kontak || "",
          imageId: data.imageId || "",
          isActive: data.isActive ?? true,
        };
        
        if (data.image?.url) {
          setPreviewImage(data.image.url);
        }
      }
      setIsInitialLoading(false);
    };
    init();
  }, [id, state.findUnique, state.update]);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload image if new file selected
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
          setIsSubmitting(false);
          return toast.error("Gagal mengunggah logo UMKM");
        }
      }

      // 2. Submit UMKM data
      state.update.form.imageId = uploadedImageId;
      const success = await state.update.submit(id);

      if (success) {
        router.push('/admin/ekonomi/umkm/data-umkm');
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
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
        <Title order={3}>Edit Data UMKM</Title>
      </Group>

      <Paper withBorder p="xl" radius="md" shadow="sm">
        <Stack gap="lg">
          {/* Logo / Image UMKM */}
          <Box>
            <Text fw={500} size="sm" mb={4}>Logo / Foto UMKM</Text>
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
                  <Dropzone.Accept>
                    <IconUpload size={42} stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={42} stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconPhoto size={42} stroke={1.5} />
                  </Dropzone.Idle>

                  <Box>
                    <Text size="xl" inline>
                      Klik atau tarik gambar di sini
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Maksimal 3MB
                    </Text>
                  </Box>
                </Group>
              </Dropzone>
            ) : (
              <Box pos="relative" w="fit-content">
                <Image src={previewImage} h={200} radius="md" alt="Preview" />
                <ActionIcon
                  color="red"
                  variant="filled"
                  pos="absolute"
                  top={5}
                  right={5}
                  onClick={() => {
                    setPreviewImage(null);
                    setFile(null);
                    state.update.form.imageId = "";
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>

          <Group grow>
            <TextInput
              label="Nama UMKM / Bisnis"
              placeholder="Contoh: Warung Sate Bu Komang"
              required
              value={state.update.form.nama}
              onChange={(e) => (state.update.form.nama = e.target.value)}
            />
            <TextInput
              label="Nama Pemilik"
              placeholder="Masukkan nama lengkap pemilik"
              required
              value={state.update.form.pemilik}
              onChange={(e) => (state.update.form.pemilik = e.target.value)}
            />
          </Group>

          <Group grow>
            <Select
              label="Kategori Bisnis"
              placeholder="Pilih kategori"
              required
              data={umkmState.kategoriProduk.findManyAll.data?.map(v => ({
                value: v.id, label: v.nama
              })) || []}
              value={state.update.form.kategoriId}
              onChange={(val) => (state.update.form.kategoriId = val || "")}
            />
            <TextInput
              label="Nomor WA / Kontak"
              placeholder="Contoh: 08123456789"
              value={state.update.form.kontak}
              onChange={(e) => (state.update.form.kontak = e.target.value)}
            />
          </Group>

          <TextInput
            label="Alamat Lengkap"
            placeholder="Masukkan alamat fisik usaha"
            value={state.update.form.alamat}
            onChange={(e) => (state.update.form.alamat = e.target.value)}
          />

          <Box>
            <Text fw={500} size="sm" mb={4}>Deskripsi UMKM</Text>
            <CreateEditor
              value={state.update.form.deskripsi || ""}
              onChange={(val) => (state.update.form.deskripsi = val)}
            />
          </Box>

          <Group justify="flex-end" mt="xl">
            <Button 
              color="blue" 
              onClick={handleUpdate}
              loading={isSubmitting}
            >
              Simpan Perubahan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
