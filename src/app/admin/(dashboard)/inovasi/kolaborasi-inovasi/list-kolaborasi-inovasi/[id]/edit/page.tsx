/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import kolaborasiInovasiState from "@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi";
import colors from "@/con/colors";
import {
  Box,
  Button,
  Paper,
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

function EditKolaborasiInovasi() {
  const kolaborasiState = useProxy(kolaborasiInovasiState);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: kolaborasiState.update.form.name || '',
    deskripsi: kolaborasiState.update.form.deskripsi || '',
    tahun: kolaborasiState.update.form.tahun || '',
    slug: kolaborasiState.update.form.slug || '',
    kolaborator: kolaborasiState.update.form.kolaborator || '',
  });

  // Load berita by id saat pertama kali
  useEffect(() => {
    const loadKolaborasi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kolaborasiState.update.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            tahun: data.tahun || '',
            slug: data.slug || '',
            kolaborator: data.kolaborator || '',
          });
        }
      } catch (error) {
        console.error("Error loading berita:", error);
        toast.error("Gagal memuat data berita");
      }
    };

    loadKolaborasi();
  }, [params?.id]);

  const handleSubmit = async () => {

    try {
      // Update global state with form data
      kolaborasiState.update.form = {
        ...kolaborasiState.update.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        tahun: Number(formData.tahun),
        slug: formData.slug,
        kolaborator: formData.kolaborator,
      };
      await kolaborasiState.update.submit();
      toast.success("Berita berhasil diperbarui!");
      router.push("/admin/inovasi/kolaborasi-inovasi");
    } catch (error) {
      console.error("Error updating berita:", error);
      toast.error("Terjadi kesalahan saat memperbarui berita");
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
          <Title order={3}>Edit Kolaborasi Inovasi</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Nama</Text>}
            placeholder="masukkan nama"
          />

          <TextInput
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi Singkat</Text>}
            placeholder="masukkan deskripsi singkat"
          />

          <TextInput
            value={formData.tahun}
            onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Tahun</Text>}
            placeholder="masukkan tahun"
          />

          <TextInput
            value={formData.kolaborator}
            onChange={(e) => setFormData({ ...formData, kolaborator: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Kolaborator</Text>}
            placeholder="masukkan kolaborator"
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Konten</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                kolaborasiState.update.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKolaborasiInovasi;
