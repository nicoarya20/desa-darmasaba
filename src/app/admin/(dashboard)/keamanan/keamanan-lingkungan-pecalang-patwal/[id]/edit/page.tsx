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
  Title,
  Tooltip,
} from "@mantine/core";
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
    name: keamananState.edit.form.name || "",
    deskripsi: keamananState.edit.form.deskripsi || "",
    imageId: keamananState.edit.form.imageId || "",
  });

  // Load data by id
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await keamananState.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || "",
            deskripsi: data.deskripsi || "",
            imageId: data.imageId || "",
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

    loadData();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      keamananState.edit.form = {
        ...keamananState.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        imageId: formData.imageId,
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
          Edit Keamanan Lingkungan
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
          <Dropzone
            onDrop={(files) => {
              const selectedFile = files[0];
              if (selectedFile) {
                setFile(selectedFile);
                setPreviewImage(URL.createObjectURL(selectedFile));
              }
            }}
            onReject={() => toast.error("File tidak valid.")}
            maxSize={5 * 1024 ** 2}
            accept={{ "image/*": [] }}
          >
            <Group
              justify="center"
              gap="xl"
              mih={220}
              style={{ pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <IconUpload
                  size={52}
                  color="var(--mantine-color-blue-6)"
                  stroke={1.5}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX
                  size={52}
                  color="var(--mantine-color-red-6)"
                  stroke={1.5}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto
                  size={52}
                  color="var(--mantine-color-dimmed)"
                  stroke={1.5}
                />
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
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            label="Judul Keamanan Lingkungan"
            placeholder="Masukkan judul"
            required
          />

          <Box>
            <Text fz="sm" fw="bold">
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                keamananState.edit.form.deskripsi = htmlContent;
              }}
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

export default EditKeamananLingkungan;
