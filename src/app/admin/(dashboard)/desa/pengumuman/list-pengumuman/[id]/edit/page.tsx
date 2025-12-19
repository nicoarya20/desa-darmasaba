/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import stateDesaPengumuman from "@/app/admin/(dashboard)/_state/desa/pengumuman";
import colors from "@/con/colors";
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Loader
} from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";

function EditPengumuman() {
  const editState = useProxy(stateDesaPengumuman);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    categoryPengumumanId: "",
    content: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalData, setOriginalData] = useState({
    judul: "",
    deskripsi: "",
    categoryPengumumanId: "",
    content: "",
  });

  // Load kategori & pengumuman by id saat pertama kali
  useEffect(() => {
    editState.category.findMany.load();

    const loadpengumuman = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateDesaPengumuman.pengumuman.edit.load(id);
        if (data) {
          setFormData({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            categoryPengumumanId: data.categoryPengumumanId || "",
            content: data.content || "",
          });
          setOriginalData({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            categoryPengumumanId: data.categoryPengumumanId || "",
            content: data.content || "",
          });
        }
      } catch (error) {
        console.error("Error loading pengumuman:", error);
        toast.error("Gagal memuat data pengumuman");
      }
    };

    loadpengumuman();
  }, [params?.id]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // update global state hanya sekali pas submit
      editState.pengumuman.edit.form = {
        ...editState.pengumuman.edit.form,
        ...formData,
      };

      await editState.pengumuman.edit.update();
      toast.success("Pengumuman berhasil diperbarui!");
      router.push("/admin/desa/pengumuman/list-pengumuman");
    } catch (error) {
      console.error("Error updating pengumuman:", error);
      toast.error("Terjadi kesalahan saat memperbarui pengumuman");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      judul: originalData.judul,
      deskripsi: originalData.deskripsi,
      categoryPengumumanId: originalData.categoryPengumumanId,
      content: originalData.content,
    });
    toast.info("Form dikembalikan ke data awal");
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
          Edit Pengumuman
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
            label="Judul Pengumuman"
            placeholder="Masukkan judul"
            value={formData.judul}
            onChange={(e) => handleChange("judul", e.target.value)}
            required
          />

          <TextInput
            label="Deskripsi Singkat"
            placeholder="Masukkan deskripsi"
            value={formData.deskripsi}
            onChange={(e) => handleChange("deskripsi", e.target.value)}
            required
          />

          <Select
            value={formData.categoryPengumumanId}
            onChange={(val) => handleChange("categoryPengumumanId", val || "")}
            label="Kategori"
            placeholder="Pilih kategori"
            data={
              editState.category.findMany.data?.map((v) => ({
                value: v.id,
                label: v.name,
              })) || []
            }
            clearable
            searchable
            required
            error={
              !formData.categoryPengumumanId ? "Pilih kategori" : undefined
            }
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Konten Lengkap
            </Text>
            <EditEditor
              value={formData.content}
              onChange={(htmlContent) => handleChange("content", htmlContent)}
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

export default EditPengumuman;
