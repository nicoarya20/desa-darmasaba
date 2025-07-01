/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Box,
  Button,
  Center,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { IconArrowBack, IconImageInPicture, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";


import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import { Dropzone } from "@mantine/dropzone";
import keamananLingkunganState from "../../../../_state/keamanan/keamanan-lingkungan";

function EditKeamananLingkungan() {
  const keamananState = useProxy(keamananLingkunganState);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: keamananState.edit.form.name || '',
    deskripsi: keamananState.edit.form.deskripsi || '',
    imageId: keamananState.edit.form.imageId || ''
  });

  // Load berita by id saat pertama kali
  useEffect(() => {
    const loadBerita = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await keamananState.edit.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading keamananLingkungan:", error);
        toast.error("Gagal memuat data keamananLingkungan");
      }
    };

    loadBerita();
  }, [params?.id]); // ✅ hapus beritaState dari dependency

  const handleSubmit = async () => {

    try {
      // Update global state with form data
      keamananState.edit.form = {
        ...keamananState.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
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
        keamananState.edit.form.imageId = uploaded.id;
      }

      await keamananState.edit.update();
      toast.success("Keamanan Lingkungan berhasil diperbarui!");
      router.push("/admin/keamanan/keamanan-lingkungan-pecalang-patwal");
    } catch (error) {
      console.error("Error updating keamananLingkungan:", error);
      toast.error("Terjadi kesalahan saat memperbarui keamananLingkungan");
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
          <Title order={3}>Edit Keamanan Lingkungan</Title>
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

          {previewImage ? (
            <Image alt="" src={previewImage} w={200} h={200} />
          ) : (
            <Center w={200} h={200} bg={"gray"}>
              <IconImageInPicture />
            </Center>
          )}
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Judul Keamanan Lingkungan</Text>}
            placeholder="masukkan judul"
          />

          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                keamananState.edit.form.deskripsi = htmlContent;
              }}
            />
          </Box>

          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKeamananLingkungan;
