/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import lowonganKerjaState from '@/app/admin/(dashboard)/_state/ekonomi/lowongan-kerja';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditLowonganKerja() {
  const lowonganState = useProxy(lowonganKerjaState)
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
  })

  useEffect(() => {
    const loadLowongan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await lowonganState.update.load(id); // akses langsung, bukan dari proxy
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
  }, [params?.id])

  const handleSubmit = async () => {
    try {
      lowonganKerjaState.update.form = {
        ...lowonganKerjaState.update.form,
        posisi: formData.posisi,
        namaPerusahaan: formData.namaPerusahaan,
        lokasi: formData.lokasi,
        tipePekerjaan: formData.tipePekerjaan,
        gaji: formData.gaji,
        deskripsi: formData.deskripsi,
        kualifikasi: formData.kualifikasi,
      }
      await lowonganState.update.update()
      toast.success("Lowongan kerja berhasil diperbarui!");
      router.push("/admin/ekonomi/lowongan-kerja-lokal");
    } catch (error) {
      console.error("Error updating lowongan kerja:", error);
      toast.error("Terjadi kesalahan saat memperbarui lowongan kerja");
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
          <Title order={4}>Edit Lowongan Kerja Lokal</Title>
          <TextInput
            value={formData.posisi}
            onChange={(val) => {
              formData.posisi = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Posisi</Text>}
            placeholder='Masukkan posisi'
          />
          <TextInput
            value={formData.namaPerusahaan}
            onChange={(val) => {
              formData.namaPerusahaan = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nama Perusahaan</Text>}
            placeholder='Masukkan nama perusahaan'
          />
          <TextInput
            value={formData.lokasi}
            onChange={(val) => {
              formData.lokasi = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Lokasi</Text>}
            placeholder='Masukkan lokasi'
          />
          <TextInput
            value={formData.tipePekerjaan}
            onChange={(val) => {
              formData.tipePekerjaan = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Tipe Pekerjaan</Text>}
            placeholder='Masukkan tipe pekerjaan'
          />
          <TextInput
            value={formData.gaji}
            onChange={(val) => {
              formData.gaji = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Gaji selama 1 bulan</Text>}
            placeholder='Masukkan gaji'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Lowongan Kerja</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) => {
                formData.deskripsi = val;
              }}
            />
          </Box>
          <Box>
            <Text fw={"bold"} fz={"sm"}>Kualifikasi Lowongan Kerja</Text>
            <EditEditor
              value={formData.kualifikasi}
              onChange={(val) => {
                formData.kualifikasi = val;
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

export default EditLowonganKerja;
