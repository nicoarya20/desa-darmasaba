'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditJenisLayanan() {
  const state = useProxy(layananonlineDesa.jenisLayanan);
  const router = useRouter();
  const params = useParams();

  // state lokal untuk form
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
  });

  // load data dari backend ke local state
  useEffect(() => {
    const loadJenisLayanan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await state.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama ?? "",
            deskripsi: data.deskripsi ?? "",
          });
        }
      } catch (error) {
        console.error("Error loading jenis layanan:", error);
        toast.error("Gagal memuat data jenis layanan");
      }
    };

    loadJenisLayanan();
  }, [params?.id]);

  // submit update → baru sync ke global state
  const handleSubmit = async () => {
    try {
      state.edit.form = {
        ...state.edit.form,
        ...formData,
      };

      await state.edit.update();
      toast.success("Jenis layanan berhasil diperbarui!");
      router.push("/admin/inovasi/layanan-online-desa/jenis-layanan");
    } catch (error) {
      console.error("Error updating jenis layanan:", error);
      toast.error("Terjadi kesalahan saat memperbarui jenis layanan");
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors["white-1"]} p="md" w={{ base: "100%", md: "50%" }}>
        <Stack gap="xs">
          <Title order={3}>Edit Jenis Layanan</Title>

          <TextInput
            value={formData.nama}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nama: e.target.value }))
            }
            label={<Text fz="sm" fw="bold">Nama Jenis Layanan</Text>}
            placeholder="masukkan nama jenis layanan"
          />

          <Box>
            <Text fz="sm" fw="bold">Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }))
              }
            />
          </Box>

          <Button bg={colors['blue-button']} onClick={handleSubmit}>
            Simpan
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditJenisLayanan;
