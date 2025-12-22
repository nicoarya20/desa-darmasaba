"use client";

import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
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
import tipsKeamananState from "../../../../_state/keamanan/tips-keamanan";

function EditTipsKeamanan() {
  const keamananState = useProxy(tipsKeamananState);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    imageId: "",
  });

  const [originalData, setOriginalData] = useState({
    judul: "",
    deskripsi: "",
    imageId: "",
    imageUrl: "",
  });

  // Load data saat pertama kali
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await keamananState.update.load(id);
        if (data) {
          setFormData({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            imageId: data.imageId || "",
          });

          setOriginalData({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            imageId: data.imageId || "",
            imageUrl: data.image?.link || "",
          })

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading tips keamanan:", error);
        toast.error("Gagal memuat data tips keamanan");
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      let imageId = formData.imageId;

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name,
        });
        const uploaded = res.data?.data;

        if (!uploaded?.id) return toast.error("Gagal upload gambar");
        imageId = uploaded.id;
      }

      keamananState.update.form = {
        ...formData,
        imageId,
      };

      await keamananState.update.update();
      toast.success("Tips Keamanan berhasil diperbarui!");
      router.push("/admin/keamanan/tips-keamanan");
    } catch (error) {
      console.error("Error updating tips keamanan:", error);
      toast.error("Terjadi kesalahan saat memperbarui tips keamanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      judul: originalData.judul,
      deskripsi: originalData.deskripsi,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  return (
     <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors["blue-button"]} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Tips Keamanan
        </Title>
      </Group>

      {/* Form Card */}
      <Paper
        w={{ base: "100%", md: "60%" }}
        bg={colors["white-1"]}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: "1px solid #e0e0e0" }}
      >
        <Stack gap="md">
          {/* Dropzone Upload */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Tips Keamanan
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() =>
                toast.error("File tidak valid, gunakan format gambar")
              }
              maxSize={5 * 1024 ** 2}
              accept={{ "image/*": [] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload
                    size={48}
                    color={colors["blue-button"]}
                    stroke={1.5}
                  />
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
                    Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp
                  </Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewImage ? (
              <Box pos={"relative"} mt="sm" style={{ display: "flex", justifyContent: "center" }}>
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
                <ActionIcon
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="sm"
                  pos="absolute"
                  top={5}
                  right={5}
                  onClick={() => {
                    setPreviewImage(null);
                    setFile(null);
                  }}
                  style={{
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            ) : (
              <Box
                mt="sm"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                  border: "1px dashed #ccc",
                  borderRadius: 8,
                }}
              >
                <IconImageInPicture size={48} color="#868e96" />
              </Box>
            )}
          </Box>

          {/* Input Judul */}
          <TextInput
            label="Nama Tips Keamanan"
            placeholder="Masukkan nama tips keamanan"
            value={formData.judul}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, judul: e.target.value }))
            }
            required
          />

          {/* Input Deskripsi */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }))
              }
            />
          </Box>

          {/* Button Simpan */}
          <Group justify="right">
            {/* Tombol Batal */}
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
            </Button>

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditTipsKeamanan;
