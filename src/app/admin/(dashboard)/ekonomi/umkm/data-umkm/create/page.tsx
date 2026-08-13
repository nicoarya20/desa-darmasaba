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
  Loader
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../../_state/ekonomi/umkm/umkm';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import ApiFetch from '@/lib/api-fetch';

export default function CreateDataUmkm() {
  const router = useRouter();
  const state = useProxy(umkmState.umkm, { sync: true }); // sync: cegah caret jump di controlled input
  // Snapshot cabang kategoriProduk agar Select re-render saat findManyAll.load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const kategoriState = useProxy(umkmState.kategoriProduk);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    umkmState.kategoriProduk.findManyAll.load();
  }, []);

  const handleResetForm = () => {
    state.create.form = {
      nama: "",
      pemilik: "",
      kategoriId: "",
      deskripsi: "",
      alamat: "",
      kontak: "",
      imageId: null,
      isActive: true,
    };
    setPreviewImage(null);
    setFile(null);
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload image first if exists
      let uploadedImageId = null;
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name
        });
        
        const uploaded = res.data?.data;
        if (uploaded?.id) {
          uploadedImageId = uploaded.id;
        } else {
          return toast.error("Gagal mengunggah logo UMKM");
        }
      }

      // 2. Submit UMKM data
      state.create.form.imageId = uploadedImageId;
      const success = await state.create.submit();

      if (success) {
        handleResetForm();
        router.push('/admin/ekonomi/umkm/data-umkm');
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Title order={3}>Daftarkan UMKM Baru</Title>
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
              value={state.create.form.nama}
              onChange={(e) => (state.create.form.nama = e.target.value)}
            />
            <TextInput
              label="Nama Pemilik"
              placeholder="Masukkan nama lengkap pemilik"
              required
              value={state.create.form.pemilik}
              onChange={(e) => (state.create.form.pemilik = e.target.value)}
            />
          </Group>

          <Group grow>
            <Select
              label="Kategori Bisnis"
              placeholder="Pilih kategori"
              required
              data={kategoriState.findManyAll.data?.map(v => ({
                value: v.id, label: v.nama
              })) || []}
              value={state.create.form.kategoriId}
              onChange={(val) => (state.create.form.kategoriId = val || "")}
            />
            <TextInput
              label="Nomor WA / Kontak"
              placeholder="Contoh: 08123456789"
              inputMode="numeric"
              maxLength={13}
              value={state.create.form.kontak}
              onChange={(e) =>
                (state.create.form.kontak = e.target.value.replace(/\D/g, "").slice(0, 13))
              }
            />
          </Group>

          <TextInput
            label="Alamat Lengkap"
            placeholder="Masukkan alamat fisik usaha"
            value={state.create.form.alamat}
            onChange={(e) => (state.create.form.alamat = e.target.value)}
          />

          <Box>
            <Text fw={500} size="sm" mb={4}>Deskripsi UMKM</Text>
            <CreateEditor
              value={state.create.form.deskripsi || ""}
              onChange={(val) => (state.create.form.deskripsi = val)}
            />
          </Box>

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" color="gray" onClick={handleResetForm}>
              Reset
            </Button>
            <Button 
              color="blue" 
              onClick={handleCreate}
              loading={isSubmitting}
            >
              Daftarkan UMKM
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}