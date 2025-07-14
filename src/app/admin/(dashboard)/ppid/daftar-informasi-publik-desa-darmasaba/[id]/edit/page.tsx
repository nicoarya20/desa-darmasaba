'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import daftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface FormDaftarInformasi {
  jenisInformasi: string;
  deskripsi: string;
  tanggal: string;
}

function EditDaftarInformasiPublik() {
  const daftarInformasi = useProxy(daftarInformasiPublik)
  const router = useRouter()
  const params = useParams()

  const [formData, setFormData] = useState<FormDaftarInformasi>({
    jenisInformasi: '',
    deskripsi: '',
    tanggal: '',
  })

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const loadDaftarInformasi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await daftarInformasi.edit.load(id);
        if (data) {
          setFormData({
            jenisInformasi: data.jenisInformasi || '',
            deskripsi: data.deskripsi || '',
            tanggal: data.tanggal || '',
          });
        }
      } catch (error) {
        console.error("Error loading daftar informasi:", error);
        toast.error("Gagal memuat data daftar informasi");
      }
    }

    loadDaftarInformasi();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      daftarInformasi.edit.form = {
        ...daftarInformasi.edit.form,
        jenisInformasi: formData.jenisInformasi.trim(),
        deskripsi: formData.deskripsi.trim(),
        tanggal: formData.tanggal.trim(),
      }
      await daftarInformasi.edit.update()
      router.push("/admin/ppid/daftar-informasi-publik-desa-darmasaba");
    } catch (error) {
      console.error("Error updating berita:", error);
      toast.error("Terjadi kesalahan saat memperbarui berita");
    }
  }

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>
      <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit Daftar Informasi Publik Desa Darmasaba</Title>
          <TextInput
            value={formData.jenisInformasi}
            label={<Text fz={"sm"} fw={"bold"}>Jenis Informasi</Text>}
            placeholder="masukkan jenis informasi"
            onChange={(val) => {
              setFormData({
                ...formData,
                jenisInformasi: val.target.value
              })
            }}
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                daftarInformasi.edit.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <TextInput
            type='date'
            value={formatDateForInput(formData.tanggal)}
            label={<Text fz={"sm"} fw={"bold"}>Tanggal Publikasi</Text>}
            placeholder="masukkan tanggal publikasi"
            onChange={(val) => {
              setFormData({
                ...formData,
                tanggal: val.target.value
              })
            }}
          />
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Edit Berita</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditDaftarInformasiPublik;
