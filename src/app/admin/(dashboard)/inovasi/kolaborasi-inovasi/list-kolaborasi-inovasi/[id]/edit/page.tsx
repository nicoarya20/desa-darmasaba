/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import kolaborasiInovasiState from "@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi";
import colors from "@/con/colors";
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { IconArrowBack } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";

function EditKolaborasiInovasi() {
  const kolaborasiState = useProxy(kolaborasiInovasiState);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    deskripsi: "",
    tahun: "",
    slug: "",
    kolaborator: "",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    deskripsi: "",
    tahun: "",
    slug: "",
    kolaborator: "",
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
      formData.slug?.trim() !== '' &&
      !isHtmlEmpty(formData.deskripsi) &&
      formData.kolaborator?.trim() !== ''
    );
  };

  // Load data awal dari server
  useEffect(() => {
    const loadKolaborasi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kolaborasiState.update.load(id);
        if (data) {
          setFormData({
            name: data.name ?? "",
            deskripsi: data.deskripsi ?? "",
            tahun: data.tahun?.toString() ?? "",
            slug: data.slug ?? "",
            kolaborator: data.kolaborator ?? "",
          });
          setOriginalData({
            name: data.name ?? "",
            deskripsi: data.deskripsi ?? "",
            tahun: data.tahun?.toString() ?? "",
            slug: data.slug ?? "",
            kolaborator: data.kolaborator ?? "",
          })
        }
      } catch (error) {
        console.error("Error loading kolaborasi:", error);
        toast.error("Gagal memuat data kolaborasi inovasi");
      }
    };

    loadKolaborasi();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      deskripsi: originalData.deskripsi,
      tahun: originalData.tahun?.toString(),
      slug: originalData.slug,
      kolaborator: originalData.kolaborator,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  // Handler submit → baru update global state
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      kolaborasiState.update.form = {
        ...kolaborasiState.update.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        tahun: Number(formData.tahun),
        slug: formData.slug,
        kolaborator: formData.kolaborator,
      };

      await kolaborasiState.update.submit();
      toast.success("Kolaborasi inovasi berhasil diperbarui!");
      router.push("/admin/inovasi/kolaborasi-inovasi/list-kolaborasi-inovasi");
    } catch (error) {
      console.error("Error updating kolaborasi:", error);
      toast.error("Terjadi kesalahan saat memperbarui data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler input (biar lebih DRY)
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors["blue-button"]} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Kolaborasi Inovasi
        </Title>
      </Group>

      <Paper
        w={{ base: "100%", md: "60%" }}
        bg={colors["white-1"]}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: "1px solid #e0e0e0" }}
      >
        <Stack gap="md">
          <TextInput
            label="Nama Kolaborasi"
            placeholder="Masukkan nama kolaborasi"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />

          <TextInput
            label="Deskripsi Singkat"
            placeholder="Masukkan deskripsi singkat"
            value={formData.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            required
          />

          <YearPickerInput
            clearable
            value={formData.tahun ? new Date(Number(formData.tahun), 0, 1) : null}
            label={<Text fz="sm" fw="bold">Tahun</Text>}
            placeholder="Pilih tahun"
            onChange={(date) => {
              const year = date ? new Date(date).getFullYear() : 0;
              handleChange("tahun", year.toString());
            }}
          />

          <TextInput
            label="Kolaborator"
            placeholder="Masukkan nama kolaborator"
            value={formData.kolaborator}
            onChange={(e) => handleChange("kolaborator", e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Konten
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

export default EditKolaborasiInovasi;
