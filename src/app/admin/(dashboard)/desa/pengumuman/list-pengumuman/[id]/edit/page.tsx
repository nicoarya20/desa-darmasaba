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
  Tooltip,
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
    judul: editState.pengumuman.edit.form.judul || "",
    deskripsi: editState.pengumuman.edit.form.deskripsi || "",
    categoryPengumumanId:
      editState.pengumuman.edit.form.categoryPengumumanId || "",
    content: editState.pengumuman.edit.form.content || "",
  });

  // Load pengumuman by id saat pertama kali
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
        }
      } catch (error) {
        console.error("Error loading pengumuman:", error);
        toast.error("Gagal memuat data pengumuman");
      }
    };

    loadpengumuman();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      // update global state
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
    }
  };

  return (
    <Box px={{ base: "sm", md: "lg" }} py="md">
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
            defaultValue={formData.judul}
            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
            required
          />

          <TextInput
            label="Deskripsi Singkat"
            placeholder="Masukkan deskripsi"
            defaultValue={formData.deskripsi}
            onChange={(e) =>
              setFormData({ ...formData, deskripsi: e.target.value })
            }
            required
          />

          <Select
            value={formData.categoryPengumumanId}
            onChange={(val) =>
              setFormData({ ...formData, categoryPengumumanId: val || "" })
            }
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
              onChange={(htmlContent) =>
                setFormData({ ...formData, content: htmlContent })
              }
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

export default EditPengumuman;
