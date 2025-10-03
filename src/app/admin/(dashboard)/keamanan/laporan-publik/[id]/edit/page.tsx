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

  const [formData, setFormData] = useState<{
    judul: string;
    lokasi: string;
    tanggalWaktu: string;
    status: Status;
    penanganan: string;
    kronologi: string;
  }>({
    judul: '',
    lokasi: '',
    tanggalWaktu: '',
    status: 'Proses', // Default status
    penanganan: '',
    kronologi: '',
  });

  useEffect(() => {
    const loadLaporanPublik = async () => {
      const id = params?.id as string;
      if (!id) return;
  
      try {
        const data = await stateLaporan.edit.load(id);
        if (data) {
          setFormData((prev) => ({
            ...prev,
            judul: data.judul ?? prev.judul,
            lokasi: data.lokasi ?? prev.lokasi,
            tanggalWaktu: data.tanggalWaktu ?? prev.tanggalWaktu,
            status: (data.status as Status) ?? prev.status,
            penanganan: data.penanganan?.[0]?.deskripsi ?? prev.penanganan,
            kronologi: data.kronologi ?? prev.kronologi,
          }));
        }
      } catch (error) {
        console.error("Error loading laporan publik:", error);
        toast.error("Gagal mengambil data laporan publik");
      }
    };
  
    loadLaporanPublik();
  }, [params?.id, stateLaporan.edit]);
  

  const handleChange = (field: string, value: string | Status) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      stateLaporan.edit.form = {
        ...stateLaporan.edit.form,
        ...formData,
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
            value={formData.judul}
            onChange={(e) => handleChange('judul', e.target.value)}
            label={<Text fw="bold" fz="sm">Judul Laporan Publik</Text>}
            placeholder="Masukkan judul laporan publik"
            required
          />

          <TextInput
            value={formData.lokasi}
            onChange={(e) => handleChange('lokasi', e.target.value)}
            label={<Text fw="bold" fz="sm">Lokasi Laporan Publik</Text>}
            placeholder="Masukkan lokasi laporan publik"
            required
          />

          <DateTimePicker
            label="Tanggal & Waktu Laporan Publik"
            value={formData.tanggalWaktu ? new Date(formData.tanggalWaktu) : null}
            onChange={(value: string | null) => {
              if (value) {
                const date = new Date(value);
                handleChange('tanggalWaktu', date.toISOString());
              } else {
                handleChange('tanggalWaktu', '');
              }
            }}
            required
          />

          <Select
            value={formData.status}
            onChange={(val) => handleChange('status', val as Status)}
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
              onChange={(htmlContent) => handleChange('kronologi', htmlContent)}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>Penanganan Laporan Publik</Text>
            <EditEditor
              value={formData.penanganan}
              onChange={(htmlContent) => handleChange('penanganan', htmlContent)}
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
