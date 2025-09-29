/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import laporanPublikState from '@/app/admin/(dashboard)/_state/keamanan/laporan-publik';
import colors from '@/con/colors';
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
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

export type Status = "Selesai" | "Proses" | "Gagal";

function EditLaporanPublik() {
  const stateLaporan = useProxy(laporanPublikState);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    judul: stateLaporan.edit.form.judul || '',
    lokasi: stateLaporan.edit.form.lokasi || '',
    tanggalWaktu: stateLaporan.edit.form.tanggalWaktu || '',
    status: stateLaporan.edit.form.status || '',
    penanganan: stateLaporan.edit.form.penanganan || '',
    kronologi: stateLaporan.edit.form.kronologi || '',
  });

  useEffect(() => {
    const loadLaporanPublik = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateLaporan.edit.load(id);
        if (data) {
          setFormData({
            judul: data.judul || '',
            lokasi: data.lokasi || '',
            tanggalWaktu: data.tanggalWaktu || '',
            status: data.status || '',
            penanganan: data.penanganan?.map((p: any) => p.deskripsi)[0] || '',
            kronologi: data.kronologi || '',
          });
        }
      } catch (error) {
        console.error('Error loading laporan publik:', error);
        toast.error("Gagal mengambil data laporan publik");
      }
    };

    loadLaporanPublik();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateLaporan.edit.form = {
        ...stateLaporan.edit.form,
        judul: formData.judul,
        lokasi: formData.lokasi,
        tanggalWaktu: formData.tanggalWaktu,
        status: formData.status,
        penanganan: formData.penanganan,
        kronologi: formData.kronologi,
      };

      await stateLaporan.edit.update();
      toast.success("Laporan Publik berhasil diperbarui!");
      router.push("/admin/keamanan/laporan-publik");
    } catch (error) {
      console.error("Error updating laporan publik:", error);
      toast.error("Terjadi kesalahan saat memperbarui laporan publik");
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Laporan Publik
        </Title>
      </Group>

      {/* Card */}
      <Paper
        w={{ base: '100%', md: '60%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <TextInput
            defaultValue={formData.judul}
            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
            label={<Text fw="bold" fz="sm">Judul Laporan Publik</Text>}
            placeholder="Masukkan judul laporan publik"
            required
          />

          <TextInput
            defaultValue={formData.lokasi}
            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
            label={<Text fw="bold" fz="sm">Lokasi Laporan Publik</Text>}
            placeholder="Masukkan lokasi laporan publik"
            required
          />

          <DateTimePicker
            label="Tanggal & Waktu Laporan Publik"
            value={formData.tanggalWaktu ? new Date(formData.tanggalWaktu) : null}
            onChange={(val) =>
              setFormData({ ...formData, tanggalWaktu: val ? val.toString() : '' })
            }
            required
          />

          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e as Status })}
            label={<Text fw="bold" fz="sm">Status Laporan Publik</Text>}
            placeholder="Pilih status laporan publik"
            data={[
              { value: "Selesai", label: "Selesai" },
              { value: "Proses", label: "Proses" },
              { value: "Gagal", label: "Gagal" },
            ]}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>Kronologi Laporan Publik</Text>
            <EditEditor
              value={formData.kronologi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, kronologi: htmlContent }));
                stateLaporan.edit.form.kronologi = htmlContent;
              }}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>Penanganan Laporan Publik</Text>
            <EditEditor
              value={formData.penanganan}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, penanganan: htmlContent }));
                stateLaporan.edit.form.penanganan = htmlContent;
              }}
            />
          </Box>

          <Group justify="right">
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
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditLaporanPublik;
