'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, FileInput, Image, Paper, Select, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import { IconArrowBack, IconImageInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import stateDashboardBerita from '../../../_state/desa/berita';

export default function CreateBerita() {
  const beritaState = useProxy(stateDashboardBerita);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter()

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
    router.push("/admin/desa/berita")
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
          <SelectCategory
            value={beritaState.berita.create.form.kategoriBeritaId}
            onChange={(val) => {
              beritaState.berita.create.form.kategoriBeritaId = val?.id || "";
            }}
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

  interface SelectCategoryProps {
    onChange: (value: Prisma.KategoriBeritaGetPayload<{
      select: {
        name: true;
        id: true;
      };
    }> | null) => void;
    value?: string | null;
    defaultValue?: string | null;
  }

  function SelectCategory({
    onChange,
    value,
    defaultValue,
  }: SelectCategoryProps) {
    const categoryState = useProxy(stateDashboardBerita.category);

    useShallowEffect(() => {
      categoryState.findMany.load().then(() => {
        console.log("Kategori berhasil dimuat:", categoryState.findMany.data);
      });
    }, []);

    if (!categoryState.findMany.data) {
      return <Skeleton height={38} />;
    }


    const selectedValue = value || defaultValue;

    return (
      <Select
        label={<Text fz={"sm"} fw={"bold"}>Kategori</Text>}
        placeholder="Pilih kategori"
        data={categoryState.findMany.data.map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        value={selectedValue || null}
        onChange={(val: string | null) => {
          if (val) {
            const selected = categoryState.findMany.data?.find((item) => item.id === val);
            if (selected) {
              onChange(selected);
            }
          } else {
            onChange(null);
          }
        }}
        searchable
        clearable
        nothingFoundMessage="Tidak ditemukan"
      />
    );
  }
}
