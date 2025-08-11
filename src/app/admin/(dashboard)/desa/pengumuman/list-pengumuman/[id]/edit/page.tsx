/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import stateDesaPengumuman from "@/app/admin/(dashboard)/_state/desa/pengumuman";
import colors from "@/con/colors";
import {
  Box,
  Button,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title
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
    judul: editState.pengumuman.edit.form.judul || '',
    deskripsi: editState.pengumuman.edit.form.deskripsi || '',
    categoryPengumumanId: editState.pengumuman.edit.form.categoryPengumumanId || '',
    content: editState.pengumuman.edit.form.content || ''
  });

  // Load pengumuman by id saat pertama kali
  useEffect(() => {
    editState.category.findMany.load()
    const loadpengumuman = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateDesaPengumuman.pengumuman.edit.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            judul: data.judul || '',
            deskripsi: data.deskripsi || '',
            categoryPengumumanId: data.categoryPengumumanId || '',
            content: data.content || '',
          });
        }
      } catch (error) {
        console.error("Error loading pengumuman:", error);
        toast.error("Gagal memuat data pengumuman");
      }
    };

    loadpengumuman();
  }, [params?.id]); // ✅ hapus editState dari dependency

  const handleSubmit = async () => {

    try {
      // edit global state with form data
      editState.pengumuman.edit.form = {
        ...editState.pengumuman.edit.form,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        content: formData.content,
        categoryPengumumanId: formData.categoryPengumumanId || ''
      };
      await editState.pengumuman.edit.update();
      toast.success("pengumuman berhasil diperbarui!");
      router.push("/admin/desa/pengumuman/list-pengumuman");
    } catch (error) {
      console.error("Error updating pengumuman:", error);
      toast.error("Terjadi kesalahan saat memperbarui pengumuman");
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>
      <Paper bg={"white"} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit pengumuman</Title>
          <TextInput
            value={formData.judul}
            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Judul</Text>}
            placeholder="masukkan judul"
          />

          <TextInput
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi</Text>}
            placeholder="masukkan deskripsi"
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Konten</Text>
            <EditEditor
              value={formData.content}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, content: htmlContent }));
                editState.pengumuman.edit.form.content = htmlContent;
              }}
            />
          </Box>

          <Select
            value={formData.categoryPengumumanId}
            onChange={(val) => setFormData({ ...formData, categoryPengumumanId: val || "" })}
            label={<Text fw={"bold"} fz={"sm"}>Kategori</Text>}
            placeholder='Pilih kategori'
            data={
              editState.category.findMany.data?.map((v) => ({
                value: v.id,
                label: v.name
              })) || []
            }
            clearable
            searchable
            required
            error={!formData.categoryPengumumanId ? "Pilih kategori" : undefined}
          />

          <Button onClick={handleSubmit}>Edit pengumuman</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPengumuman;
