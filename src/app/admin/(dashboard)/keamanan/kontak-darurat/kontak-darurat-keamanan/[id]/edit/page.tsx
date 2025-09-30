/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { IconKey } from "@/app/admin/(dashboard)/_com/iconMap";
import SelectIconProgramEdit from "@/app/admin/(dashboard)/_com/selectIconEdit";
import kontakDarurat from "@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan";
import colors from "@/con/colors";
import {
  Box,
  Button,
  Group,
  MultiSelect,
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

function EditKontakDaruratKeamanan() {
  const router = useRouter();
  const params = useParams();
  const kontakState = useProxy(kontakDarurat.kontakDaruratKeamananState);

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    icon: "" as IconKey | "",
    kategoriId: [] as string[],
  });

  // Load data dari backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await kontakDarurat.kontakDaruratItem.findMany.load();

        const id = params?.id as string;
        if (id) {
          const data = await kontakState.update.load(id);
          if (data) {
            setFormData({
              name: data.nama || "",
              icon: (data.icon as IconKey) || "",
              kategoriId: data.kategoriId || [],
            });
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params?.id]);

  // Handle submit
  const handleSubmit = async () => {
    try {
      kontakState.update.form = {
        ...kontakState.update.form,
        nama: formData.name,
        icon: formData.icon,
        kategoriId: formData.kategoriId,
      };

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
          {/* Nama Kontak */}
          <TextInput
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            label="Nama Kontak Darurat"
            placeholder="Masukkan nama kontak darurat"
            required
          />

          {/* MultiSelect */}
          <MultiSelect
            value={formData.kategoriId}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, kategoriId: val }))
            }
            label={<Text fw={"bold"} fz={"sm"}>Kontak Item</Text>}
            placeholder={isLoading ? "Memuat data..." : "Pilih kontak item"}
            data={
              Array.isArray(kontakDarurat.kontakDaruratItem.findMany.data)
                ? kontakDarurat.kontakDaruratItem.findMany.data.map((v) => ({
                    value: v.id,
                    label: v.nama,
                  }))
                : []
            }
            clearable
            searchable
            required
            error={
              !formData.kategoriId.length
                ? "Pilih minimal satu kategori"
                : undefined
            }
            disabled={isLoading}
          />

          {/* Icon Select */}
          <Box>
            <Text fz={"sm"} fw={"bold"}>
              Ikon Program Kreatif Desa
            </Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, icon: value }))
              }
            />
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
