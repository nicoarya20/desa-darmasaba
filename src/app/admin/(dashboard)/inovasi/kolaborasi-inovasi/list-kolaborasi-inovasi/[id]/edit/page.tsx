/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import kolaborasiInovasiState from "@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi";
import colors from "@/con/colors";
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";

function EditKolaborasiInovasi() {
  const kolaborasiState = useProxy(kolaborasiInovasiState);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: "",
    deskripsi: "",
    tahun: "",
    slug: "",
    kolaborator: "",
  });

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
        }
      } catch (error) {
        console.error("Error loading kolaborasi:", error);
        toast.error("Gagal memuat data kolaborasi inovasi");
      }
    };

    loadKolaborasi();
  }, [params?.id]);

  // Handler submit → baru update global state
  const handleSubmit = async () => {
    try {
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
      router.push("/admin/inovasi/kolaborasi-inovasi");
    } catch (error) {
      console.error("Error updating kolaborasi:", error);
      toast.error("Terjadi kesalahan saat memperbarui data");
    }
  };

  // Handler input (biar lebih DRY)
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

          <TextInput
            label="Tahun"
            placeholder="Masukkan tahun"
            value={formData.tahun}
            onChange={(e) => handleChange("tahun", e.target.value)}
            required
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

export default EditKolaborasiInovasi;
