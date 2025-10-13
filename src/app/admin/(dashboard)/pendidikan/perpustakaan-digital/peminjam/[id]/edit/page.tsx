/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';

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
import { DateInput } from '@mantine/dates';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

export type Status = "Dipinjam" | "Dikembalikan" | "Terlambat" | "Dibatalkan";

function EditPeminjam() {
  const stateEdit = useProxy(perpustakaanDigitalState.peminjamanBuku);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<{
    nama: string;
    noTelp: string;
    alamat: string;
    bukuId: string;
    buku?: {
      id: string;
      judul: string;
    };
    tanggalPinjam: string;
    batasKembali: string;
    tanggalKembali: string;
    status: Status;
    catatan: string;
  }>({
    nama: '',
    noTelp: '',
    alamat: '',
    bukuId: '',
    tanggalPinjam: '',
    batasKembali: '',
    tanggalKembali: '',
    status: 'Dipinjam', // Default status
    catatan: '',
  });

  useEffect(() => {
    const loadPeminjam = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateEdit.update.load(id);
        if (data) {
          setFormData((prev) => ({
            ...prev,
            nama: data.nama ?? prev.nama,
            noTelp: data.noTelp ?? prev.noTelp,
            alamat: data.alamat ?? prev.alamat,
            bukuId: data.bukuId ?? prev.bukuId,
            buku: data.buku ? {
              id: data.buku.id,
              judul: data.buku.judul
            } : undefined,
            tanggalPinjam: data.tanggalPinjam ?? prev.tanggalPinjam,
            batasKembali: data.batasKembali ?? prev.batasKembali,
            tanggalKembali: data.tanggalKembali ?? prev.tanggalKembali,
            status: (data.status as Status) ?? prev.status,
            catatan: data.catatan ?? prev.catatan,
          }));
        }
      } catch (error) {
        console.error("Error loading peminjam:", error);
        toast.error("Gagal mengambil data peminjam");
      }
    };

    loadPeminjam();
  }, [params?.id]);


  const handleChange = (field: string, value: string | Status) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      stateEdit.update.form = {
        ...stateEdit.update.form,
        ...formData,
      };

      await stateEdit.update.update();
      toast.success("Peminjam berhasil diperbarui!");
      router.push("/admin/pendidikan/perpustakaan-digital/peminjam");
    } catch (error) {
      console.error("Error updating peminjam:", error);
      toast.error("Terjadi kesalahan saat memperbarui peminjam");
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
          Edit Peminjam Buku
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
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            label={<Text fw="bold" fz="sm">Nama Peminjam</Text>}
            placeholder="Masukkan nama peminjam"
            required
          />

          <TextInput
            value={formData.noTelp}
            onChange={(e) => handleChange('noTelp', e.target.value)}
            label={<Text fw="bold" fz="sm">No Telp Peminjam</Text>}
            placeholder="Masukkan no telp peminjam"
            required
          />

          <TextInput
            value={formData.alamat}
            onChange={(e) => handleChange('alamat', e.target.value)}
            label={<Text fw="bold" fz="sm">Alamat Peminjam</Text>}
            placeholder="Masukkan alamat peminjam"
            required
          />

          <TextInput
            value={formData.buku?.judul || ''}
            label={<Text fw="bold" fz="sm">Buku</Text>}
            placeholder="Buku"
            required
            readOnly
          />

          <DateInput
            value={formData.tanggalPinjam}
            onChange={(date) => {
              perpustakaanDigitalState.peminjamanBuku.update.form.tanggalPinjam =
                date ? new Date(date).toISOString() : '';
            }}
            label={<Text fw="bold" fz="sm">Tanggal Pinjam</Text>}
            placeholder="Masukkan tanggal pinjam"
            required
          />

          <DateInput
            value={formData.tanggalKembali}
            onChange={(date) => {
              perpustakaanDigitalState.peminjamanBuku.update.form.tanggalKembali =
                date ? new Date(date).toISOString() : '';
            }}
            label={<Text fw="bold" fz="sm">Tanggal Kembali</Text>}
            placeholder="Masukkan tanggal kembali"
            required
          />

          <DateInput
            value={formData.batasKembali}
            onChange={(date) => {
              perpustakaanDigitalState.peminjamanBuku.update.form.batasKembali =
                date ? new Date(date).toISOString() : '';
            }}
            label={<Text fw="bold" fz="sm">Batas Kembali</Text>}
            placeholder="Masukkan batas kembali"
            required
          />

          <Select
            value={formData.status}
            onChange={(val) => handleChange('status', val as Status)}
            label={<Text fw="bold" fz="sm">Status</Text>}
            placeholder="Pilih status"
            data={[
              { value: "Dipinjam", label: "Dipinjam" },
              { value: "Dikembalikan", label: "Dikembalikan" },
              { value: "Terlambat", label: "Terlambat" },
              { value: "Dibatalkan", label: "Dibatalkan" },
            ]}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>Catatan</Text>
            <EditEditor
              value={formData.catatan}
              onChange={(htmlContent) => handleChange('catatan', htmlContent)}
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

export default EditPeminjam;
