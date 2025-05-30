'use client'

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import potensiDesaState from "@/app/admin/(dashboard)/_state/desa/potensi";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import { Box, Button, Paper, Stack, Title, TextInput, FileInput, Center, Text, Image } from "@mantine/core";
import { IconArrowBack, IconImageInPicture } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";



function EditPotensi() {
  const potensiState = useProxy(potensiDesaState)
  const router = useRouter()
  const params = useParams()

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    deskripsi: '',
    kategori: '',
    content: '',
    imageId: ''
  });

  useEffect(() => {
    const loadPotensi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await potensiDesaState.edit.load(id); // ambil data dari API
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            kategori: data.kategori || '',
            content: data.content || '',
            imageId: data.imageId || '',
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading potensi:", error);
        toast.error("Gagal memuat data potensi");
      }
    };

    loadPotensi();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      // Sinkronkan semua data dari formData ke state global
      potensiState.edit.form = {
        ...potensiState.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        kategori: formData.kategori,
        content: formData.content,
      };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        potensiState.edit.form.imageId = uploaded.id;
      }

      await potensiState.edit.update();
      toast.success("Potensi berhasil diperbarui!");
      router.push("/admin/desa/potensi");
    } catch (error) {
      console.error("Error updating potensi:", error);
      toast.error("Terjadi kesalahan saat memperbarui potensi");
    }
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
          <Title order={3}>Edit Potensi</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, name: val }));
              potensiState.edit.form.name = val;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Judul</Text>}
            placeholder="masukkan judul"
          />
          <TextInput
            value={formData.deskripsi}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, deskripsi: val }));
              potensiState.edit.form.deskripsi = val;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi</Text>}
            placeholder="masukkan deskripsi"
          />
          <TextInput
            value={formData.kategori}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, kategori: val }));
              potensiState.edit.form.kategori = val;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Kategori</Text>}
            placeholder="masukkan kategori"
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
            <EditEditor
            value={formData.content}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, content: htmlContent }));
                potensiState.edit.form.content = htmlContent;
              }}
            />
          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Edit Potensi</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPotensi;