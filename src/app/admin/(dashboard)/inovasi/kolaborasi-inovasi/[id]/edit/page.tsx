/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import {
  Box,
  Button,
  Center,
  FileInput,
  Image,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { IconArrowBack, IconImageInPicture } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";
import kolaborasiInovasiState from "@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi";

function EditKolaborasiInovasi() {
  const kolaborasiState = useProxy(kolaborasiInovasiState);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: kolaborasiState.update.form.name || '',
    deskripsi: kolaborasiState.update.form.deskripsi || '',
    tahun: kolaborasiState.update.form.tahun || '',
    slug: kolaborasiState.update.form.slug || '',
    kolaborator: kolaborasiState.update.form.kolaborator || '',
    imageId: kolaborasiState.update.form.imageId || ''
  });

  // Load berita by id saat pertama kali
  useEffect(() => {
    const loadKolaborasi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kolaborasiState.update.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            tahun: data.tahun || '',
            slug: data.slug || '',
            kolaborator: data.kolaborator || '',
            imageId: data.imageId || '',
          });
          if (data.image) {
            if (data?.image?.link) {
              setPreviewImage(data.image.link);
            }
          }
        }
      } catch (error) {
        console.error("Error loading berita:", error);
        toast.error("Gagal memuat data berita");
      }
    };

    loadKolaborasi();
  }, [params?.id]);

  const handleSubmit = async () => {

    try {
      // Update global state with form data
      kolaborasiState.update.form = {
        ...kolaborasiState.update.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        tahun: Number(formData.tahun),
        slug: formData.slug,
        kolaborator: formData.kolaborator,
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
        kolaborasiState.update.form.imageId = uploaded.id;
      }

      await kolaborasiState.update.submit();
      toast.success("Berita berhasil diperbarui!");
      router.push("/admin/inovasi/kolaborasi-inovasi");
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
          <Title order={3}>Edit Kolaborasi Inovasi</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Nama</Text>}
            placeholder="masukkan nama"
          />

          <TextInput
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi Singkat</Text>}
            placeholder="masukkan deskripsi singkat"
          />

          <TextInput
            value={formData.tahun}
            onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Tahun</Text>}
            placeholder="masukkan tahun"
          />

          <TextInput
            value={formData.kolaborator}
            onChange={(e) => setFormData({ ...formData, kolaborator: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Kolaborator</Text>}
            placeholder="masukkan kolaborator"
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
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                kolaborasiState.update.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKolaborasiInovasi;
