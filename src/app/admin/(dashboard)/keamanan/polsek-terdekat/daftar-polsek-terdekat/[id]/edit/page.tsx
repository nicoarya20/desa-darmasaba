/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import statePolsekTerdekat from "@/app/admin/(dashboard)/_state/keamanan/polsek-terdekat";
import colors from "@/con/colors";
import {
  Box,
  Button,
  Group,
  Loader,
  MultiSelect,
  Paper,
  Stack,
  TextInput,
  Title
} from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";


type FormData = {
  nama: string;
  jarakKeDesa: string;
  alamat: string;
  nomorTelepon: string;
  jamOperasional: string;
  embedMapUrl: string;
  namaTempatMaps: string;
  alamatMaps: string;
  linkPetunjukArah: string;
  layananPolsekId: string[];
};

function EditPolsekTerdekat() {
  const polsekState = useProxy(statePolsekTerdekat.polsekTerdekatState);
  const params = useParams();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nama: "",
    jarakKeDesa: "",
    alamat: "",
    nomorTelepon: "",
    jamOperasional: "",
    embedMapUrl: "",
    namaTempatMaps: "",
    alamatMaps: "",
    linkPetunjukArah: "",
    layananPolsekId: []
  });

  const [originalData, setOriginalData] = useState({
    nama: "",
    jarakKeDesa: "",
    alamat: "",
    nomorTelepon: "",
    jamOperasional: "",
    embedMapUrl: "",
    namaTempatMaps: "",
    alamatMaps: "",
    linkPetunjukArah: "",
    layananPolsekId: []
  });

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.nama?.trim() !== '' &&
      formData.jarakKeDesa?.trim() !== '' &&
      formData.alamat?.trim() !== '' &&
      formData.nomorTelepon?.trim() !== '' &&
      formData.layananPolsekId.length > 0
    );
  };

    useEffect(() => {
    statePolsekTerdekat.layananPolsek.findManyAll.load();
  }, []);

  // load data untuk form edit
  useEffect(() => {
    const loadPolsekTerdekat = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await polsekState.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama || "",
            jarakKeDesa: data.jarakKeDesa || "",
            alamat: data.alamat || "",
            nomorTelepon: data.nomorTelepon || "",
            jamOperasional: data.jamOperasional || "",
            embedMapUrl: data.embedMapUrl || "",
            namaTempatMaps: data.namaTempatMaps || "",
            alamatMaps: data.alamatMaps || "",
            linkPetunjukArah: data.linkPetunjukArah || "",
            layananPolsekId: data.LayananToPolsek?.map((l: any) => l.layananId) || [],
          });

          setOriginalData({
            nama: data.nama || "",
            jarakKeDesa: data.jarakKeDesa || "",
            alamat: data.alamat || "",
            nomorTelepon: data.nomorTelepon || "",
            jamOperasional: data.jamOperasional || "",
            embedMapUrl: data.embedMapUrl || "",
            namaTempatMaps: data.namaTempatMaps || "",
            alamatMaps: data.alamatMaps || "",
            linkPetunjukArah: data.linkPetunjukArah || "",
            layananPolsekId: data.LayananToPolsek?.map((l: any) => l.layananId) || [],
          });
        }
      } catch (error) {
        console.error("Error loading polsek terdekat:", error);
        toast.error("Gagal memuat data polsek terdekat");
      }
    };

    loadPolsekTerdekat();
  }, [params?.id]);


  const handleChange = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
      jarakKeDesa: originalData.jarakKeDesa,
      alamat: originalData.alamat,
      nomorTelepon: originalData.nomorTelepon,
      jamOperasional: originalData.jamOperasional,
      embedMapUrl: originalData.embedMapUrl,
      namaTempatMaps: originalData.namaTempatMaps,
      alamatMaps: originalData.alamatMaps,
      linkPetunjukArah: originalData.linkPetunjukArah,
      layananPolsekId: (originalData as any)?.LayananToPolsek?.map((l: any) => l.layananId) || [],
    });
    toast.info("Form dikembalikan ke data awal");
  };

 const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    await polsekState.edit.update();
    toast.success("Polsek terdekat berhasil diperbarui!");
    router.push("/admin/keamanan/polsek-terdekat/daftar-polsek-terdekat");
  } catch (error) {
    console.error("Error updating polsek terdekat:", error);
    toast.error("Gagal memperbarui data polsek terdekat");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header */}
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
          Edit Polsek Terdekat
        </Title>
      </Group>

      {/* Form utama */}
      <Paper
        w={{ base: "100%", md: "50%" }}
        bg={colors["white-1"]}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: "1px solid #e0e0e0" }}
      >
        <Stack gap="md">
          {/* Input fields */}
          <TextInput
            value={formData.nama}
            onChange={(e) => handleChange("nama", e.currentTarget.value)}
            label="Nama Polsek Terdekat"
            placeholder="Masukkan nama Polsek Terdekat"
            required
          />
          <TextInput
            value={formData.jarakKeDesa}
            onChange={(e) => handleChange("jarakKeDesa", e.currentTarget.value)}
            label="Jarak Polsek Terdekat"
          />
          <TextInput
            value={formData.alamat}
            onChange={(e) => handleChange("alamat", e.currentTarget.value)}
            label="Alamat Polsek Terdekat"
          />
          <TextInput
            value={formData.nomorTelepon}
            onChange={(e) => handleChange("nomorTelepon", e.currentTarget.value)}
            label="Nomor Telepon"
          />
          <TextInput
            value={formData.jamOperasional}
            onChange={(e) => handleChange("jamOperasional", e.currentTarget.value)}
            label="Jam Operasional"
          />
          <TextInput
            value={formData.embedMapUrl}
            onChange={(e) => handleChange("embedMapUrl", e.currentTarget.value)}
            label="Embed Map URL"
          />
          <TextInput
            value={formData.namaTempatMaps}
            onChange={(e) => handleChange("namaTempatMaps", e.currentTarget.value)}
            label="Nama Tempat Maps"
          />
          <TextInput
            value={formData.alamatMaps}
            onChange={(e) => handleChange("alamatMaps", e.currentTarget.value)}
            label="Alamat Maps"
          />
          <TextInput
            value={formData.linkPetunjukArah}
            onChange={(e) => handleChange("linkPetunjukArah", e.currentTarget.value)}
            label="Link Petunjuk Arah"
          />

          <MultiSelect
            label="Layanan Polsekl"
            placeholder="Pilih layanan polsek"
            value={formData.layananPolsekId}
            onChange={(val) => handleChange('layananPolsekId', val)}
            data={
              statePolsekTerdekat.layananPolsek.findManyAll.data?.map((v) => ({
                value: v.id,
                label: v.nama,
              })) || []
            }
            clearable
            searchable
            required
            error={!formData.layananPolsekId.length ? 'Pilih minimal satu layanan polsek' : undefined}
          />

          {/* Submit */}
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

export default EditPolsekTerdekat;
