'use client';
import {
  Autocomplete,
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
  Switch
} from '@mantine/core';
import { SATUAN_PRESETS } from '@/app/(public)/(pages)/ekonomi/umkm/_lib/satuan';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto,  IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../../_state/ekonomi/umkm/umkm';
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import ApiFetch from '@/lib/api-fetch';
import { LinkTokoOnlineField } from '../_com/LinkTokoOnlineField';

export default function CreateProdukUmkm() {
  const router = useRouter();
  const state = useProxy(umkmState.produk, { sync: true }); // sync: cegah caret jump di controlled input
  // Snapshot cabang umkm & kategoriProduk agar Select re-render saat load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const umkmListState = useProxy(umkmState.umkm);
  const kategoriState = useProxy(umkmState.kategoriProduk);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load UMKM list for selection and Categories
    umkmState.umkm.findMany.load(1, 100);
    umkmState.kategoriProduk.findManyAll.load();
  }, []);

  const handleResetForm = () => {
    state.create.form = {
      nama: "",
      harga: 0,
      stok: 0,
      satuan: "",
      umkmId: "",
      deskripsi: "",
      imageId: null,
      kategoriId: "",
      isActive: true,
      isUnggulan: false,
      linkTokoOnline: [],
    };
    setPreviewImage(null);
    setFile(null);
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
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
          return toast.error("Gagal mengunggah foto produk");
        }
      }

      state.create.form.imageId = uploadedImageId;
      const success = await state.create.submit();

      if (success) {
        handleResetForm();
        router.push('/admin/ekonomi/umkm/produk');
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
          <Title order={3}>Tambah Produk UMKM</Title>
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
                <ActionIcon color="red" variant="filled" pos="absolute" top={5} right={5} onClick={() => { setPreviewImage(null); setFile(null); }}>
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
            data={umkmListState.findMany.data?.map(v => ({
              value: v.id, label: v.nama
            })) || []}
            value={state.create.form.umkmId}
            onChange={(val) => (state.create.form.umkmId = val || "")}
          />

          <TextInput
            label="Nama Produk"
            placeholder="Contoh: Kripik Singkong Pedas"
            required
            value={state.create.form.nama}
            onChange={(e) => (state.create.form.nama = e.target.value)}
          />

          <Group grow>
            <NumberInput
              label="Harga Produk (Rp)"
              placeholder="0"
              required
              min={0}
              thousandSeparator="."
              decimalSeparator=","
              value={state.create.form.harga}
              onChange={(val) => (state.create.form.harga = Number(val))}
            />
            <NumberInput
              label="Stok Awal"
              placeholder="0"
              required
              min={0}
              value={state.create.form.stok}
              onChange={(val) => (state.create.form.stok = Number(val))}
            />
            <Autocomplete
              label="Satuan"
              placeholder="kg / ekor / pcs"
              description="Satuan jual produk"
              data={[...SATUAN_PRESETS]}
              value={state.create.form.satuan}
              onChange={(val) => (state.create.form.satuan = val)}
            />
          </Group>

          <Select
            label="Kategori Produk"
            placeholder="Pilih kategori produk"
            required
            data={kategoriState.findManyAll.data?.map(v => ({
              value: v.id, label: v.nama
            })) || []}
            value={state.create.form.kategoriId}
            onChange={(val) => (state.create.form.kategoriId = val || "")}
          />

          <Switch
            label="Produk Unggulan Desa"
            description="Tampilkan penanda Unggulan dan masukkan ke filter Produk Unggulan di katalog publik"
            checked={state.create.form.isUnggulan}
            onChange={(e) => (state.create.form.isUnggulan = e.currentTarget.checked)}
          />

          <LinkTokoOnlineField
            value={state.create.form.linkTokoOnline}
            onChange={(next) => (state.create.form.linkTokoOnline = next)}
          />

          <Box>
            <Text fw={500} size="sm" mb={4}>Deskripsi Produk</Text>
            <CreateEditor
              value={state.create.form.deskripsi || ""}
              onChange={(val) => (state.create.form.deskripsi = val)}
            />
          </Box>

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" color="gray" onClick={handleResetForm}>Reset</Button>
            <Button color="blue" onClick={handleCreate} loading={isSubmitting}>Simpan Produk</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}