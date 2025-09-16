/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import lowonganKerjaState from '@/app/admin/(dashboard)/_state/ekonomi/lowongan-kerja';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditLowonganKerja() {
  const lowonganState = useProxy(lowonganKerjaState);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    posisi: lowonganKerjaState.update.form.posisi,
    namaPerusahaan: lowonganKerjaState.update.form.namaPerusahaan,
    lokasi: lowonganKerjaState.update.form.lokasi,
    tipePekerjaan: lowonganKerjaState.update.form.tipePekerjaan,
    gaji: lowonganKerjaState.update.form.gaji,
    deskripsi: lowonganKerjaState.update.form.deskripsi,
    kualifikasi: lowonganKerjaState.update.form.kualifikasi,
  });

  useEffect(() => {
    const loadLowongan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await lowonganState.update.load(id);
        if (data) {
          setFormData({
            posisi: data.posisi || '',
            namaPerusahaan: data.namaPerusahaan || '',
            lokasi: data.lokasi || '',
            tipePekerjaan: data.tipePekerjaan || '',
            gaji: data.gaji || '',
            deskripsi: data.deskripsi || '',
            kualifikasi: data.kualifikasi || '',
          });
        }
      } catch (error) {
        console.error("Error loading lowongan kerja:", error);
        toast.error("Gagal memuat data lowongan kerja");
      }
    };

    loadLowongan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      lowonganState.update.id = params?.id as string;

      lowonganState.update.form = {
        ...lowonganState.update.form,
        ...formData,
      };

      await lowonganState.update.update();
      toast.success("Lowongan kerja berhasil diperbarui!");
      router.push("/admin/ekonomi/lowongan-kerja-lokal");
    } catch (error) {
      console.error("Error updating lowongan kerja:", error);
      toast.error("Terjadi kesalahan saat memperbarui lowongan kerja");
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan tombol back */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Lowongan Kerja Lokal
        </Title>
      </Group>

      {/* Card Form */}
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
            label="Posisi"
            placeholder="Masukkan posisi"
            value={formData.posisi}
            onChange={(e) => setFormData({ ...formData, posisi: e.target.value })}
            required
          />

          <TextInput
            label="Nama Perusahaan"
            placeholder="Masukkan nama perusahaan"
            value={formData.namaPerusahaan}
            onChange={(e) => setFormData({ ...formData, namaPerusahaan: e.target.value })}
            required
          />

          <TextInput
            label="Lokasi"
            placeholder="Masukkan lokasi"
            value={formData.lokasi}
            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
            required
          />

          <TextInput
            label="Tipe Pekerjaan"
            placeholder="Masukkan tipe pekerjaan"
            value={formData.tipePekerjaan}
            onChange={(e) => setFormData({ ...formData, tipePekerjaan: e.target.value })}
            required
          />

          <TextInput
            label="Gaji (per bulan)"
            placeholder="Masukkan gaji"
            value={formData.gaji}
            onChange={(e) => setFormData({ ...formData, gaji: e.target.value })}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Lowongan Kerja
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) => setFormData({ ...formData, deskripsi: val })}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Kualifikasi Lowongan Kerja
            </Text>
            <EditEditor
              value={formData.kualifikasi}
              onChange={(val) => setFormData({ ...formData, kualifikasi: val })}
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

export default EditLowonganKerja;
