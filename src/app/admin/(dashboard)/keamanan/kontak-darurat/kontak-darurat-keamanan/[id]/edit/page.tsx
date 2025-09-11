/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import kontakDarurat from "@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import {
  Box,
  Button,
  Center,
  Group,
  Image,
  MultiSelect,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import {
  IconArrowBack,
  IconImageInPicture,
  IconPhoto,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";

function EditKontakDaruratKeamanan() {
  const router = useRouter();
  const kontakState = useProxy(kontakDarurat.kontakDaruratKeamananState);
  const params = useParams();

  const [previewUtama, setPreviewUtama] = useState<string | null>(null);
  const [fileUtama, setFileUtama] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: kontakState.update.form.nama || "",
    imageId: kontakState.update.form.imageId || "",
    kategoriId: kontakState.update.form.kategoriId || [],
  });

  // Load data
  useEffect(() => {
    kontakDarurat.kontakDaruratItem.findMany.load();
    const loadKontakDarurat = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kontakState.update.load(id);
        if (data) {
          setFormData({
            name: data.nama || "",
            imageId: data.imageId || "",
            kategoriId: data.kategoriId || [],
          });

          if (data?.image?.link) setPreviewUtama(data.image.link);
        }
      } catch (error) {
        console.error("Error loading kontak darurat:", error);
        toast.error("Gagal memuat data kontak darurat");
      }
    };

    loadKontakDarurat();
  }, [params?.id]);

  // Handle submit
  const handleSubmit = async () => {
    try {
      kontakState.update.form = {
        ...kontakState.update.form,
        nama: formData.name,
        imageId: formData.imageId,
        kategoriId: formData.kategoriId,
      };

      if (fileUtama) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file: fileUtama,
          name: fileUtama.name,
        });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error("Gagal upload gambar utama");
        kontakState.update.form.imageId = uploaded.id;
      }

      await kontakState.update.update();
      toast.success("Kontak Darurat berhasil diperbarui!");
      router.push("/admin/keamanan/kontak-darurat");
    } catch (error) {
      console.error("Error updating kontak darurat:", error);
      toast.error("Terjadi kesalahan saat memperbarui kontak darurat");
    }
  };

  return (
    <Box px={{ base: "sm", md: "lg" }} py="md">
      {/* Header */}
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
          Edit Kontak Darurat Keamanan
        </Title>
      </Group>

      {/* Form */}
      <Paper
        w={{ base: "100%", md: "50%" }}
        bg={colors["white-1"]}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: "1px solid #e0e0e0" }}
      >
        <Stack gap="md">
          {/* Nama kategori */}
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label="Nama Kontak Darurat"
            placeholder="Masukkan nama kontak darurat"
            required
          />

          <MultiSelect
            value={formData.kategoriId}
            onChange={(val) => setFormData({ ...formData, kategoriId: val })}
            label={<Text fw={"bold"} fz={"sm"}>Kontak Item</Text>}
            placeholder='Pilih kontak item'
            data={
              kontakDarurat.kontakDaruratItem.findMany.data?.map((v) => ({
                value: v.id,  // Make sure this is using the ID
                label: v.nama
              })) || []
            }
            clearable
            searchable
            required
            error={!formData.kategoriId.length ? "Pilih minimal satu kategori" : undefined}
          />

          {/* Gambar utama */}
          <Box>
            <Text fz="sm" fw="bold">
              Masukkan Gambar
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFileUtama(selectedFile);
                  setPreviewUtama(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error("File tidak valid.")}
              maxSize={5 * 1024 ** 2}
              accept={{ "image/*": [] }}
            >
              <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "none" }}>
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

            {previewUtama ? (
              <Image alt="" src={previewUtama} w={200} h={200} mt="sm" />
            ) : (
              <Center w={200} h={200} bg={"gray"} mt="sm">
                <IconImageInPicture />
              </Center>
            )}
          </Box>

          {/* Submit */}
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

export default EditKontakDaruratKeamanan;
