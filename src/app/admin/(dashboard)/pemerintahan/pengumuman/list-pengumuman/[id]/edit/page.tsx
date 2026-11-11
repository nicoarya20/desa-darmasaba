/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import stateDesaPengumuman from "@/app/admin/(dashboard)/_state/desa/pengumuman";
import colors from "@/con/colors";
import { tanggalKeInput, tanggalPengumuman } from "@/lib/pengumuman-tanggal";
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
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";
import { LampiranFields } from "../../_com/LampiranFields";
import { useLampiranPengumuman, type LampiranAwal } from "../../_lib/useLampiranPengumuman";

function EditPengumuman() {
  const editState = useProxy(stateDesaPengumuman);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    categoryPengumumanId: "",
    content: "",
    tanggalTerbit: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const lampiran = useLampiranPengumuman();
  const { muat: muatLampiran } = lampiran;
  // Lampiran tersimpan, untuk tombol Batal (kembali ke data awal).
  const lampiranAwal = useRef<LampiranAwal | undefined>(undefined);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.judul?.trim() !== '' &&
      formData.deskripsi?.trim() !== '' &&
      formData.categoryPengumumanId !== '' &&
      formData.tanggalTerbit !== '' &&
      !isHtmlEmpty(formData.content)
    );
  };

  const [originalData, setOriginalData] = useState({
    judul: "",
    deskripsi: "",
    categoryPengumumanId: "",
    content: "",
    tanggalTerbit: "",
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
          const awal = {
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            categoryPengumumanId: data.categoryPengumumanId || "",
            content: data.content || "",
            tanggalTerbit: tanggalKeInput(tanggalPengumuman(data)),
          };
          setFormData(awal);
          setOriginalData(awal);
          lampiranAwal.current = {
            image: data.image ?? null,
            images: data.images ?? [],
            dokumen: data.dokumen ?? [],
          };
          muatLampiran(lampiranAwal.current);
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
    if (!formData.judul?.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }
    
    if (!formData.deskripsi?.trim()) {
      toast.error('Deskripsi singkat wajib diisi');
      return;
    }
    
    if (!formData.categoryPengumumanId) {
      toast.error('Kategori wajib dipilih');
      return;
    }
    
    if (!formData.tanggalTerbit) {
      toast.error('Tanggal terbit wajib diisi');
      return;
    }

    if (isHtmlEmpty(formData.content)) {
      toast.error('Konten lengkap wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      // Berkas baru diunggah saat Simpan; lampiran yang dihapus cukup dilepas dari pengumuman.
      const ids = await lampiran.unggah();
      // update global state hanya sekali pas submit
      editState.pengumuman.edit.form = {
        ...editState.pengumuman.edit.form,
        ...formData,
        ...ids,
        // Kirim tanggal hanya bila diubah, supaya jam asli (mis. hasil backfill createdAt) tidak tertimpa.
        tanggalTerbit: formData.tanggalTerbit !== originalData.tanggalTerbit ? formData.tanggalTerbit : "",
      };

      const ok = await editState.pengumuman.edit.update();
      if (!ok) return;
      toast.success("Pengumuman berhasil diperbarui!");
      router.push("/admin/pemerintahan/pengumuman/list-pengumuman");
    } catch (error) {
      console.error("Error updating pengumuman:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui pengumuman");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({ ...originalData });
    muatLampiran(lampiranAwal.current);
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

          <TextInput
            type="date"
            label="Tanggal Terbit"
            description="Tanggal asli pengumuman"
            value={formData.tanggalTerbit}
            onChange={(e) => handleChange("tanggalTerbit", e.target.value)}
            required
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

          <LampiranFields lampiran={lampiran} />

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

export default EditPengumuman;
