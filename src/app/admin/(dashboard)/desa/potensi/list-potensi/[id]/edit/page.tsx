/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import potensiDesaState from "@/app/admin/(dashboard)/_state/desa/potensi";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconArrowBack, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";

function EditPotensi() {
  const potensiState = useProxy(potensiDesaState.potensiDesa);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    deskripsi: "",
    kategoriId: "",
    content: "",
    imageId: "",
  });

  useEffect(() => {
    potensiDesaState.kategoriPotensi.findMany.load();
    const loadPotensi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await potensiState.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || "",
            deskripsi: data.deskripsi || "",
            kategoriId: data.kategoriId || "",
            content: data.content || "",
            imageId: data.imageId || "",
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
      potensiState.edit.form = {
        ...potensiState.edit.form,
        ...formData,
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
      router.push("/admin/desa/potensi/list-potensi");
    } catch (error) {
      console.error("Error updating potensi:", error);
      toast.error("Terjadi kesalahan saat memperbarui potensi");
    }
  };

  return (
    <Box px={{ base: "sm", md: "lg" }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors["blue-button"]} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Potensi Desa
        </Title>
      </Group>

      <Paper
        w={{ base: "100%", md: "50%" }}
        bg={colors["white-1"]}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: "1px solid #e0e0e0" }}
      >
        <Stack gap="md">
          <TextInput
            label="Judul Potensi"
            placeholder="Masukkan judul"
            defaultValue={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextInput
            label="Deskripsi Singkat"
            placeholder="Masukkan deskripsi"
            defaultValue={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            required
          />

          <Select
            value={formData.kategoriId}
            onChange={(val) => setFormData({ ...formData, kategoriId: val || "" })}
            label="Kategori"
            placeholder="Pilih kategori"
            data={
              potensiDesaState.kategoriPotensi.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama,
              })) || []
            }
            clearable
            searchable
            required
            error={!formData.kategoriId ? "Pilih kategori" : undefined}
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Potensi
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error("File tidak valid, gunakan format gambar")}
              maxSize={5 * 1024 ** 2}
              accept={{ "image/*": [] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color={colors["blue-button"]} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="red" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="#868e96" stroke={1.5} />
                </Dropzone.Idle>
                <Stack gap="xs" align="center">
                  <Text size="md" fw={500}>
                    Seret gambar atau klik untuk memilih file
                  </Text>
                  <Text size="sm" c="dimmed">
                    Maksimal 5MB, format gambar wajib
                  </Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" style={{ display: "flex", justifyContent: "center" }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{
                    maxHeight: 220,
                    objectFit: "contain",
                    border: `1px solid ${colors["blue-button"]}`,
                  }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Konten Lengkap
            </Text>
            <EditEditor
              value={formData.content}
              onChange={(htmlContent) => setFormData({ ...formData, content: htmlContent })}
            />
          </Box>

          <Group justify="right">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors["blue-button"]}, #4facfe)`,
                color: "#fff",
                boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)",
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPotensi;
