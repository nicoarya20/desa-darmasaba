/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import dataLingkunganDesaState from '@/app/admin/(dashboard)/_state/lingkungan/data-lingkungan-desa';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import SelectIconProgramEdit from '../../../../_com/selectIconEdit';

interface FormDataLingkunganDesa {
  name: string;
  deskripsi: string;
  jumlah: string;
  icon: string;
}

type IconKey =
  'ekowisata' |
  'kompetisi' |
  'wisata' |
  'ekonomi' |
  'sampah' |
  'truck' |
  'scale' |
  'clipboard' |
  'trash' |
  'lingkunganSehat' |
  'sumberOksigen' |
  'ekonomiBerkelanjutan' |
  'mencegahBencana' |
  'rumah' |
  'pohon' |
  'air';


function EditDataLingkunganDesa() {
  const stateDataLingkunganDesa = useProxy(dataLingkunganDesaState)
  const params = useParams()
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataLingkunganDesa>({
    name: '',
    deskripsi: '',
    jumlah: '',
    icon: '',
  })

  useEffect(() => {
    const loadProgramKreatif = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateDataLingkunganDesa.update.load(id);
        if (data) {
          // ⬇️ FIX PENTING: tambahkan ini
          stateDataLingkunganDesa.update.id = id;

          stateDataLingkunganDesa.update.form = {
            name: data.name,
            deskripsi: data.deskripsi,
            jumlah: data.jumlah,
            icon: data.icon,
          };

          setFormData({
            name: data.name,
            deskripsi: data.deskripsi,
            jumlah: data.jumlah,
            icon: data.icon,
          });
        }
      } catch (error) {
        console.error("Error loading data lingkungan desa:", error);
        toast.error("Gagal memuat data data lingkungan desa");
      }
    }

    loadProgramKreatif();
  }, [params?.id]);



  const handleSubmit = async () => {
    try {
      stateDataLingkunganDesa.update.form = {
        ...stateDataLingkunganDesa.update.form,
        name: formData.name.trim(),
        deskripsi: formData.deskripsi.trim(),
        jumlah: formData.jumlah.trim(),
        icon: formData.icon.trim(),
      }
      await stateDataLingkunganDesa.update.submit();
      router.push("/admin/lingkungan/data-lingkungan-desa");
    } catch (error) {
      console.error("Error updating data lingkungan desa:", error);
      toast.error("Gagal memuat data data lingkungan desa");
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
          <Title order={3}>Edit Data Lingkungan Desa</Title>
          <TextInput
            value={formData.name}
            label={<Text fz={"sm"} fw={"bold"}>Nama Data Lingkungan Desa</Text>}
            placeholder="masukkan nama data lingkungan desa"
            onChange={(val) => {
              setFormData({
                ...formData,
                name: val.target.value
              })
            }}
          />
          <TextInput
            value={formData.jumlah}
            label={<Text fz={"sm"} fw={"bold"}>Jumlah Data Lingkungan Desa</Text>}
            placeholder="masukkan jumlah data lingkungan desa"
            onChange={(val) => {
              setFormData({
                ...formData,
                jumlah: val.target.value
              })
            }}
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                stateDataLingkunganDesa.update.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <Box>
            <Text fz={"sm"} fw={"bold"}>Ikon Data Lingkungan Desa</Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, icon: value }));
                stateDataLingkunganDesa.update.form.icon = value;
              }} />
          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditDataLingkunganDesa;
