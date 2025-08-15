/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import grafikkepuasan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/grafikKepuasan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditGrafikHasilKepuasan() {
  const editState = useProxy(grafikkepuasan)
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    nama: editState.update.form.nama || '',
    tanggal: editState.update.form.tanggal || '',
    jenisKelamin: editState.update.form.jenisKelamin || '',
    alamat: editState.update.form.alamat || '',
    penyakit: editState.update.form.penyakit || '',
  });

  useEffect(() => {
    const loadKelahiran = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.update.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            nama: data.nama || '',
            tanggal: data.tanggal || '',
            jenisKelamin: data.jenisKelamin || '',
            alamat: data.alamat || '',
            penyakit: data.penyakit || '',
          });
        }
      } catch (error) {
        console.error("Error loading grafik hasil kepuasan:", error);
        toast.error("Gagal memuat data grafik hasil kepuasan");
      }
    };

    loadKelahiran();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      editState.update.form = {
        ...editState.update.form,
        nama: formData.nama,
        tanggal: formData.tanggal,
        jenisKelamin: formData.jenisKelamin,
        alamat: formData.alamat,
        penyakit: formData.penyakit,
      };
      await editState.update.submit();
      toast.success('grafik hasil kepuasan berhasil diperbarui!');
      router.push('/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan');
    } catch (error) {
      console.error('Error updating grafik hasil kepuasan:', error);
      toast.error('Terjadi kesalahan saat memperbarui grafik hasil kepuasan');
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
          <Title order={3}>Edit grafik hasil kepuasan</Title>
          <TextInput
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Nama</Text>}
            placeholder="masukkan nama"
          />
          <TextInput
            type='date'
            value={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Tanggal</Text>}
            placeholder="masukkan tanggal"
          />
          <TextInput
            value={formData.jenisKelamin}
            onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Jenis Kelamin</Text>}
            placeholder="masukkan jenis kelamin"
          />
          <TextInput
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Alamat</Text>}
            placeholder="masukkan alamat"
          />
          <TextInput
            value={formData.penyakit}
            onChange={(e) => setFormData({ ...formData, penyakit: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Penyakit</Text>}
            placeholder="masukkan penyakit"
          />
          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditGrafikHasilKepuasan;
