/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKematian() {
  const editState = useProxy(persentaseKelahiranKematian.kematian)
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    nama: editState.edit.form.nama || '',
    tanggal: editState.edit.form.tanggal || '',
    jenisKelamin: editState.edit.form.jenisKelamin || '',
    alamat: editState.edit.form.alamat || '',
    penyebab: editState.edit.form.penyebab || '',
  });

  useEffect(() => {
    const loadKelahiran = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.edit.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            nama: data.nama || '',
            tanggal: data.tanggal || '',
            jenisKelamin: data.jenisKelamin || '',
            alamat: data.alamat || '',
            penyebab: data.penyebab || '',
          });
        }
      } catch (error) {
        console.error("Error loading data kelahiran:", error);
        toast.error("Gagal memuat data data kelahiran");
      }
    };

    loadKelahiran();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      editState.edit.form = {
        ...editState.edit.form,
        nama: formData.nama,
        tanggal: formData.tanggal,
        jenisKelamin: formData.jenisKelamin,
        alamat: formData.alamat,
        penyebab: formData.penyebab,
      };
      await editState.edit.update();
      toast.success('data kelahiran berhasil diperbarui!');
      router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran');
    } catch (error) {
      console.error('Error updating data kelahiran:', error);
      toast.error('Terjadi kesalahan saat memperbarui data kelahiran');
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
          <Title order={3}>Edit data kelahiran</Title>
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
          <Box>
            <Text fz={"sm"} fw={"bold"}>Penyebab</Text>
            <EditEditor
              value={formData.penyebab}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, penyebab: htmlContent }));
                editState.edit.form.penyebab = htmlContent;
              }}
            />
          </Box>
          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKematian;
