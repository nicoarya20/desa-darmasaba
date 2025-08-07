'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


export default function CreateBerita() {
  const beritaState = useProxy(stateDashboardBerita);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter()

  useShallowEffect(() => {
    beritaState.kategoriBerita.findMany.load()
  }, []);

  const resetForm = () => {
    // Reset state di valtio
    beritaState.berita.create.form = {
      judul: "",
      deskripsi: "",
      kategoriBeritaId: "",
      imageId: "",
      content: "",
    };

    // Reset state lokal
    setPreviewImage(null);
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }

    // Upload gambar dulu
    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error("Gagal upload gambar");
    }

    // Simpan ID gambar ke form
    beritaState.berita.create.form.imageId = uploaded.id;

    // Submit data berita
    await beritaState.berita.create.create();

    // Reset form setelah submit
    resetForm();
    router.push("/admin/desa/berita/list-berita")
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Create Berita</Title>
          <TextInput
            value={beritaState.berita.create.form.judul}
            onChange={(val) => {
              beritaState.berita.create.form.judul = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Judul</Text>}
            placeholder="masukkan judul"
          />
          <Select
            label={<Text fz={"sm"} fw={"bold"}>Kategori</Text>}
            placeholder="Pilih kategori"
            data={beritaState.kategoriBerita.findMany.data.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            value={beritaState.berita.create.form.kategoriBeritaId || null}
            onChange={(val: string | null) => {
              if (val) {
                const selected = beritaState.kategoriBerita.findMany.data?.find((item) => item.id === val);
                if (selected) {
                  beritaState.berita.create.form.kategoriBeritaId = selected.id;
                }
              } else {
                beritaState.berita.create.form.kategoriBeritaId = "";
              }
            }}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
          />
          <TextInput
            value={beritaState.berita.create.form.deskripsi}
            onChange={(val) => {
              beritaState.berita.create.form.deskripsi = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi</Text>}
            placeholder="masukkan deskripsi"
          />

          <FileInput
            label={<Text fz={"sm"} fw={"bold"}>Upload Gambar</Text>}
            value={file}
            onChange={async (e) => {
              if (!e) return;
              setFile(e);
              const base64 = await e.arrayBuffer().then((buf) =>
                "data:image/png;base64," + Buffer.from(buf).toString("base64")
              );
              setPreviewImage(base64);
            }}
          />
          {previewImage ? (
            <Image alt="" src={previewImage} w={200} h={200} />
          ) : (
            <Center w={200} h={200} bg={"gray"}>
              <IconImageInPicture />
            </Center>
          )}
          <Box>
            <Text fz={"sm"} fw={"bold"}>Konten</Text>
            <CreateEditor
              value={beritaState.berita.create.form.content}
              onChange={(htmlContent) => {
                beritaState.berita.create.form.content = htmlContent;
              }}
            />
          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan Berita</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
