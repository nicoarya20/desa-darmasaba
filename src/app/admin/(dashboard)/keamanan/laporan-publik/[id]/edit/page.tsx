/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import laporanPublikState from '@/app/admin/(dashboard)/_state/keamanan/laporan-publik';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
export type Status = "Selesai" | "Proses" | "Gagal";

function EditLaporanPublik() {
  const stateLaporan = useProxy(laporanPublikState)
  const router = useRouter();
  const params = useParams()

  const [formData, setFormData] = useState({
    judul: stateLaporan.edit.form.judul || '',
    lokasi: stateLaporan.edit.form.lokasi || '',
    tanggalWaktu: stateLaporan.edit.form.tanggalWaktu || '',
    status: stateLaporan.edit.form.status || '',
    penanganan: stateLaporan.edit.form.penanganan || '',
    kronologi: stateLaporan.edit.form.kronologi || '',
  })

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
      }
    }

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
      }
      
      await stateLaporan.edit.update();
      toast.success("Laporan Publik berhasil diperbarui!");
      router.push("/admin/keamanan/laporan-publik");
    } catch (error) {
      console.error("Error updating kontak darurat:", error);
      toast.error("Terjadi kesalahan saat memperbarui kontak darurat");
    }
  }
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
      <Stack gap={"xs"}>
          <Title order={4}>Edit Laporan Publik</Title>
          <TextInput
            value={formData.judul}
            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Judul Laporan Publik</Text>}
            placeholder='Masukkan judul LaporanPublik'
          />
          <TextInput
            value={formData.lokasi}
            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Lokasi Laporan Publik</Text>}
            placeholder='Masukkan lokasi LaporanPublik'
          />
          <DateTimePicker
            label="Tanggal Laporan Publik"
            value={
              formData.tanggalWaktu
                ? new Date(formData.tanggalWaktu)
                : null
            }
            onChange={(val) => {
              if (val) {
                setFormData({ ...formData, tanggalWaktu: val.toString() });
              } else {
                setFormData({ ...formData, tanggalWaktu: "" }); // Reset kalau dikosongkan
              }
            }}
          />

          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e?.valueOf() as Status })}
            label={<Text fw={"bold"} fz={"sm"}>Status Laporan Publik</Text>}
            placeholder='Masukkan status LaporanPublik'
            data={[
              { value: "Selesai", label: "Selesai" },
              { value: "Proses", label: "Proses" },
              { value: "Gagal", label: "Gagal" },
            ]}
          />
          <TextInput
            value={formData.kronologi}
            onChange={(e) => setFormData({ ...formData, kronologi: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Kronologi Laporan Publik</Text>}
            placeholder='Masukkan kronologi LaporanPublik'
          />
          <Text fw={"bold"} fz={"sm"}>Penanganan Laporan Publik</Text>
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Laporan Publik</Text>
            <EditEditor
              value={formData.penanganan}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, penanganan: htmlContent }));
                stateLaporan.edit.form.penanganan = htmlContent;
              }}
            />
          </Box>
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditLaporanPublik;
