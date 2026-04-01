"use client";

import {
  ActionIcon,
  Box,
  Button,
  Center,
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
import keamananLingkunganState from "../../../../_state/keamanan/keamanan-lingkungan";

function EditKeamananLingkungan() {
  const keamananState = useProxy(keamananLingkunganState);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    deskripsi: "",
    imageId: "",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    deskripsi: "",
    imageId: "",
    imageUrl: "",
  });

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      !isHtmlEmpty(formData.deskripsi)
    );
  };

  // Load data sekali pas mount
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
          setOriginalData({
            name: data.name || "",
            deskripsi: data.deskripsi || "",
            imageId: data.imageId || "",
            imageUrl: data.image?.link || "",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      deskripsi: originalData.deskripsi,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

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

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        imageId = uploaded.id;
      }

      // update global state hanya sekali pas submit
      keamananState.edit.form = {
        ...keamananState.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        imageId,
      };

      await keamananState.edit.update();
      toast.success("Keamanan Lingkungan berhasil diperbarui!");
      router.push("/admin/keamanan/keamanan-lingkungan-pecalang-patwal");
    } catch (error) {
      console.error("Error updating keamananLingkungan:", error);
      toast.error("Terjadi kesalahan saat memperbarui keamananLingkungan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
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
            <Box pos={"relative"}>
              <Image
                src={previewImage}
                alt="Preview Gambar"
                radius="md"
                style={{
                  maxHeight: 200,
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                }}
                loading="lazy"
              />

              {/* Tombol hapus (pojok kanan atas) */}
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
            <Center w={200} h={200} bg={"gray"}>
              <IconImageInPicture />
            </Center>
          )}

          <TextInput
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
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
              onChange={(htmlContent) => handleChange("deskripsi", htmlContent)}
            />
          </Box>

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
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default EditKeamananLingkungan;
