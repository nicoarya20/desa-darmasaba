/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import stateDashboardBerita from "@/app/admin/(dashboard)/_state/desa/berita";
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

function EditBerita() {
  const beritaState = useProxy(stateDashboardBerita);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    judul: beritaState.berita.edit.form.judul || "",
    deskripsi: beritaState.berita.edit.form.deskripsi || "",
    kategoriBeritaId: beritaState.berita.edit.form.kategoriBeritaId || "",
    content: beritaState.berita.edit.form.content || "",
    imageId: beritaState.berita.edit.form.imageId || "",
  });

  // Load berita by id saat pertama kali
  useEffect(() => {
    beritaState.kategoriBerita.findMany.load();
    const loadBerita = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateDashboardBerita.berita.edit.load(id);
        if (data) {
          setFormData({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            kategoriBeritaId: data.kategoriBeritaId || "",
            content: data.content || "",
            imageId: data.imageId || "",
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
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      beritaState.berita.edit.form = {
        ...beritaState.berita.edit.form,
        ...formData,
      };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name,
        });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        beritaState.berita.edit.form.imageId = uploaded.id;
      }

      await beritaState.berita.edit.update();
      toast.success("Berita berhasil diperbarui!");
      router.push("/admin/desa/berita/list-berita");
    } catch (error) {
      console.error("Error updating berita:", error);
      toast.error("Terjadi kesalahan saat memperbarui berita");
    }
  };

  return (
    <Box px={{ base: "sm", md: "lg" }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors["blue-button"]} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Berita
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
            label="Judul"
            placeholder="Masukkan judul"
            value={formData.judul}
            onChange={(e) =>
              setFormData({ ...formData, judul: e.target.value })
            }
            required
          />

          <TextInput
            label="Deskripsi"
            placeholder="Masukkan deskripsi"
            value={formData.deskripsi}
            onChange={(e) =>
              setFormData({ ...formData, deskripsi: e.target.value })
            }
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Berita
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
            <Text fz="sm" fw="bold">
              Konten
            </Text>
            <EditEditor
              value={formData.content}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, content: htmlContent }));
                beritaState.berita.edit.form.content = htmlContent;
              }}
            />
          </Box>

          <Select
            value={formData.kategoriBeritaId}
            onChange={(val) =>
              setFormData({ ...formData, kategoriBeritaId: val || "" })
            }
            label="Kategori"
            placeholder="Pilih kategori"
            data={
              beritaState.kategoriBerita.findMany.data?.map((v) => ({
                value: v.id,
                label: v.name,
              })) || []
            }
            clearable
            searchable
            required
            error={!formData.kategoriBeritaId ? "Pilih kategori" : undefined}
          />

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

export default EditBerita;
