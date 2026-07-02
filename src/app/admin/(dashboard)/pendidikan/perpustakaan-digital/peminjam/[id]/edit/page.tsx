/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

export type Status = "Dipinjam" | "Dikembalikan" | "Terlambat" | "Dibatalkan";

function EditPeminjam() {
  const stateEdit = useProxy(perpustakaanDigitalState.peminjamanBuku);
  // Snapshot cabang dataPerpustakaan agar Select re-render saat findManyAll.load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const stateBuku = useProxy(perpustakaanDigitalState.dataPerpustakaan);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [originalData, setOriginalData] = useState({
    nama: "",
    noTelp: "",
    alamat: "",
    bukuId: "",
    tanggalPinjam: "",
    batasKembali: "",
    tanggalKembali: "",
    status: "Dipinjam", // Default status
    catatan: "",
  })

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.nama?.trim() !== '' &&
      formData.noTelp?.trim() !== '' &&
      formData.alamat?.trim() !== '' &&
      formData.bukuId?.trim() !== '' &&
      formData.tanggalPinjam?.trim() !== '' &&
      formData.status?.trim() !== '' &&
      !isHtmlEmpty(formData.catatan)
    );
  };

  useShallowEffect(() => {
    perpustakaanDigitalState.dataPerpustakaan.findManyAll.load()
  })

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
          setOriginalData((prev) => ({
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

  const handleResetForm = () => {
    setFormData((prev) => ({
      ...prev,
      nama: originalData.nama ?? prev.nama,
      noTelp: originalData.noTelp ?? prev.noTelp,
      alamat: originalData.alamat ?? prev.alamat,
      bukuId: originalData.bukuId ?? prev.bukuId,
      tanggalPinjam: originalData.tanggalPinjam ?? prev.tanggalPinjam,
      batasKembali: originalData.batasKembali ?? prev.batasKembali,
      tanggalKembali: originalData.tanggalKembali ?? prev.tanggalKembali,
      status: (originalData.status as Status) ?? prev.status,
      catatan: originalData.catatan ?? prev.catatan,
    }));
    toast.info("Form dikembalikan ke data awal");
  };


  const handleChange = (field: string, value: string | Status) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
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

          <Box>
            <Text fw="bold" fz="sm" mb={6}>Buku</Text>
            <Select
              placeholder="Pilih buku"
              data={stateBuku.findManyAll.data?.map(p => ({ value: p.id, label: p.judul })) || []}
              value={formData.bukuId}
              onChange={(value) => value && setFormData({ ...formData, bukuId: value })}
              searchable
              clearable
            />
          </Box>

          <DateInput
            disabled
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
            disabled
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
            disabled
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

export default EditPeminjam;
