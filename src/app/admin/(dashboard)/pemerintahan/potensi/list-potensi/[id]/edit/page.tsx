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
  Loader,
  ActionIcon
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconArrowBack, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";

function EditPotensi() {
  const potensiState = useProxy(potensiDesaState.potensiDesa);
  // Snapshot cabang kategoriPotensi agar Select re-render saat findMany.load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const kategoriState = useProxy(potensiDesaState.kategoriPotensi);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      !isHtmlEmpty(formData.deskripsi) &&
      formData.kategoriId !== '' &&
      (file !== null || originalData.imageId !== '') && // Either a new file is selected or an existing image exists
      !isHtmlEmpty(formData.content)
    );
  };

  const [originalData, setOriginalData] = useState({
    name: "",
    deskripsi: "",
    kategoriId: "",
    content: "",
    imageId: "",
    imageUrl: "",
  });

  // handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

          setOriginalData({
            name: data.name || "",
            deskripsi: data.deskripsi || "",
            kategoriId: data.kategoriId || "",
            content: data.content || "",
            imageId: data.imageId || "",
            imageUrl: data.image?.link || "",
          });
          setPreviewImage(data.image.link);

        }
      } catch (error) {
        console.error("Error loading potensi:", error);
        toast.error("Gagal memuat data potensi");
      }
    };

    loadPotensi();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name || "",
      deskripsi: originalData.deskripsi || "",
      kategoriId: originalData.kategoriId || "",
      content: originalData.content || "",
      imageId: originalData.imageId || ""
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };


  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }
    
    if (isHtmlEmpty(formData.deskripsi)) {
      toast.error('Deskripsi singkat wajib diisi');
      return;
    }
    
    if (!formData.kategoriId) {
      toast.error('Kategori wajib dipilih');
      return;
    }
    
    if (!file && !originalData.imageId) {
      toast.error('Gambar wajib dipilih');
      return;
    }
    
    if (isHtmlEmpty(formData.content)) {
      toast.error('Konten lengkap wajib diisi');
      return;
    }

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

      potensiState.edit.form = {
        ...formData,
        imageId,
      };

      await potensiState.edit.update();
      toast.success("Potensi berhasil diperbarui!");
      router.push("/admin/pemerintahan/potensi/list-potensi");
    } catch (error) {
      console.error("Error updating potensi:", error);
      toast.error("Terjadi kesalahan saat memperbarui potensi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Box px={{ base: 0, md: 'lg' }} py="xs">
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
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi Singkat
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                handleChange("deskripsi", htmlContent)
              }
            />
          </Box>

          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            data={kategoriState.findMany.data?.map((item) => ({
              label: item.nama,
              value: item.id,
            })) || []}
            value={formData.kategoriId || null}
            onChange={(val: string | null) => {
              if (val) {
                const selected = kategoriState.findMany.data?.find(
                  (item) => item.id === val
                );
                if (selected) {
                  handleChange("kategoriId", selected.id);
                }
              } else {
                handleChange("kategoriId", "");
              }
            }}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
            required
          />

          {/* <Select
            value={formData.kategoriId}
            onChange={(val) => handleChange("kategoriId", val || "")}
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
          /> */}

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

            {previewImage && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
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
            )}
          </Box>

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Konten Lengkap
            </Text>
            <EditEditor
              value={formData.content}
              onChange={(htmlContent) =>
                handleChange("content", htmlContent)
              }
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

export default EditPotensi;
