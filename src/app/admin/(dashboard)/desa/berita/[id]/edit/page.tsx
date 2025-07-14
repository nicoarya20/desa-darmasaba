"use client";

import {
  Box,
  Button,
  Center,
  Image,
  Paper,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowBack, IconImageInPicture } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";
import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import { FileInput } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import stateDashboardBerita from "../../../../_state/desa/berita";

function EditBerita() {
  const beritaState = useProxy(stateDashboardBerita);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    judul: beritaState.berita.edit.form.judul || '',
    deskripsi: beritaState.berita.edit.form.deskripsi || '',
    kategoriBeritaId: beritaState.berita.edit.form.kategoriBeritaId || '',
    content: beritaState.berita.edit.form.content || '',
    imageId: beritaState.berita.edit.form.imageId || ''
  });

  // Load berita by id saat pertama kali
  useEffect(() => {
    const loadBerita = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateDashboardBerita.berita.edit.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            judul: data.judul || '',
            deskripsi: data.deskripsi || '',
            kategoriBeritaId: data.kategoriBeritaId || '',
            content: data.content || '',
            imageId: data.imageId || '',
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading berita:", error);
        toast.error("Gagal memuat data berita");
      }
    };

    loadBerita();
  }, [params?.id]); // ✅ hapus beritaState dari dependency

  const handleSubmit = async () => {

    try {
      // Update global state with form data
      beritaState.berita.edit.form = {
        ...beritaState.berita.edit.form,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        content: formData.content,
        kategoriBeritaId: formData.kategoriBeritaId || '',
        imageId: formData.imageId // Keep existing imageId if not changed
      };

      // Jika ada file baru, upload
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // Update imageId in global state
        beritaState.berita.edit.form.imageId = uploaded.id;
      }

      await beritaState.berita.edit.update();
      toast.success("Berita berhasil diperbarui!");
      router.push("/admin/desa/berita");
    } catch (error) {
      console.error("Error updating berita:", error);
      toast.error("Terjadi kesalahan saat memperbarui berita");
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>
      <Paper bg={"white"} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit Berita</Title>
          <TextInput
            value={formData.judul}
            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Judul</Text>}
            placeholder="masukkan judul"
          />

          <TextInput
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi</Text>}
            placeholder="masukkan deskripsi"
          />

          <FileInput
            label={<Text fz={"sm"} fw={"bold"}>Upload Gambar Baru (Opsional)</Text>}
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
            <EditEditor
            value={formData.content}
            onChange={(htmlContent) => {
              setFormData((prev) => ({ ...prev, content: htmlContent }));
              beritaState.berita.edit.form.content = htmlContent;
            }}
            />
          </Box>

          <SelectCategory
            value={formData.kategoriBeritaId}
            onChange={(val) => {
              setFormData({
                ...formData,
                kategoriBeritaId: val?.id || ''
              });
            }}
          />

          <Button onClick={handleSubmit}>Edit Berita</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

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

export default EditBerita;
