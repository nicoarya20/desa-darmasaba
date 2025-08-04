/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import sdgsDesa from "@/app/admin/(dashboard)/_state/landing-page/sdgs-desa";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconArrowBack, IconImageInPicture, IconUpload, IconX } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";

function EditKolaborasiInovasi() {
  const sdgsState = useProxy(sdgsDesa);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: sdgsState.edit.form.name || '',
    jumlah: sdgsState.edit.form.jumlah || '',
    imageId: sdgsState.edit.form.imageId || ''
  });

  // Load sdgs desa by id saat pertama kali
  useEffect(() => {
    const loadKolaborasi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await sdgsState.edit.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            name: data.name || '',
            jumlah: data.jumlah || '',
            imageId: data.imageId || '',
          });
          if (data.image) {
            if (data?.image?.link) {
              setPreviewImage(data.image.link);
            }
          }
        }
      } catch (error) {
        console.error("Error loading sdgs desa:", error);
        toast.error("Gagal memuat data sdgs desa");
      }
    };

    loadKolaborasi();
  }, [params?.id]);

  const handleSubmit = async () => {

    try {
      // edit global state with form data
      sdgsState.edit.form = {
        ...sdgsState.edit.form,
        name: formData.name,
        jumlah: formData.jumlah,
        imageId: formData.imageId // Keep existing imageId if not changed
      };

      // Jika ada file baru, upload
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // edit imageId in global state
        sdgsState.edit.form.imageId = uploaded.id;
      }

      await sdgsState.edit.update();
      toast.success("sdgs desa berhasil diperbarui!");
      router.push("/admin/landing-page/SDGs-Desa");
    } catch (error) {
      console.error("Error updating sdgs desa:", error);
      toast.error("Terjadi kesalahan saat memperbarui sdgs desa");
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
          <Title order={3}>Edit SDGs Desa</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Nama</Text>}
            placeholder="masukkan nama"
          />

          <TextInput
            value={formData.jumlah}
            onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Jumlah</Text>}
            placeholder="masukkan jumlah"
          />
          <Box>
            <Text fz={"md"} fw={"bold"}>File Image</Text>
            <Box>
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
                accept={{
                  'application/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
                }}
              >
                <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                  <Dropzone.Accept>
                    <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconImageInPicture size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                  </Dropzone.Idle>

                  <div>
                    <Text size="xl" inline>
                      Drag file ke sini atau klik untuk pilih file
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Maksimal 5MB dan harus format image
                    </Text>
                  </div>
                </Group>
              </Dropzone>
              <Box>
                <Text fw={"bold"} fz={"lg"}>Dokumen</Text>
                {previewImage ? (
                  <iframe
                    src={previewImage}
                    width="100%"
                    height="250px"
                    style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                  />
                ) : (
                  <Text>Tidak ada image tersedia</Text>
                )}
              </Box>
            </Box>
          </Box>
          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKolaborasiInovasi;
