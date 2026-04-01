/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import sdgsDesa from "@/app/admin/(dashboard)/_state/landing-page/sdgs-desa";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
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
import { Dropzone } from "@mantine/dropzone";
import { IconArrowBack, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";

export default function EditKolaborasiInovasi() {
  const sdgsState = useProxy(sdgsDesa);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: "",
    jumlah: "",
    imageId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.jumlah?.trim() !== '' &&
      (formData.imageId?.trim() !== '' || file !== null)
    );
  };

  const [originalData, setOriginalData] = useState({
    name: "",
    jumlah: "",
    imageId: "",
    imageUrl: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Load data sdgs desa by id
  useEffect(() => {
    const loadKolaborasi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await sdgsState.edit.load(id);
        if (data) {
          // isi form awal
          const newForm = {
            name: data.name || "",
            jumlah: data.jumlah || "",
            imageId: data.imageId || "",
          };
          setFormData(newForm);

          // simpan juga versi original
          setOriginalData({
            ...newForm,
            imageUrl: data.image?.link || "",
          });

          setPreviewImage(data.image?.link || null);
        }
      } catch (error) {
        console.error("Error loading sdgs desa:", error);
        toast.error("Gagal memuat data sdgs desa");
      }
    };

    loadKolaborasi();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      jumlah: originalData.jumlah,
      imageId: originalData.imageId,
    });
    setPreviewImage(originalData.imageUrl || null);
    setFile(null);
    toast.info("Form dikembalikan ke data awal");
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      let imageId = formData.imageId;

      // Upload file baru jika ada
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error("Gagal upload gambar");
        imageId = uploaded.id;
      }

      // Update global state hanya saat submit
      sdgsState.edit.form = { ...sdgsState.edit.form, ...formData, imageId };
      await sdgsState.edit.update();

      toast.success("sdgs desa berhasil diperbarui!");
      router.push("/admin/landing-page/SDGs");
    } catch (error) {
      console.error("Error updating sdgs desa:", error);
      toast.error("Terjadi kesalahan saat memperbarui sdgs desa");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors["blue-button"]} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Sdgs Desa
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
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Program Inovasi
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color={colors['blue-button']} stroke={1.5} />
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

            {/* ✅ Preview gambar + tombol X */}
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
          <TextInput
            label="Nama Sdgs Desa"
            placeholder="Masukkan nama Sdgs Desa"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />

          <TextInput
            label="Jumlah"
            placeholder="Masukkan jumlah"
            value={formData.jumlah}
            onChange={(e) => handleInputChange("jumlah", e.target.value)}
            required
            type="number"
          />

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
                  ? 'linear-gradient(135deg, #cccccc, #999999)'
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
