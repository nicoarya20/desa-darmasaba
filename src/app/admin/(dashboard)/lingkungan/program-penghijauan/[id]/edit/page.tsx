/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import SelectIconProgramEdit from '@/app/admin/(dashboard)/_com/selectIconEdit';
import programPenghijauanState from '@/app/admin/(dashboard)/_state/lingkungan/program-penghijauan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


interface FormProgramPenghijauan {
  name: string;
  deskripsi: string;
  judul: string;
  icon: string;
}

type IconKey = 'ekowisata' | 'kompetisi' | 'wisata' | 'ekonomi' | 'sampah' | 'truck' | 'scale' | 'clipboard' | 'trash' | 'lingkunganSehat' | 'sumberOksigen' | 'ekonomiBerkelanjutan' | 'mencegahBencana';


function EditProgramPenghijauan() {
  const stateProgramPenghijauan = useProxy(programPenghijauanState)
  const params = useParams()
  const router = useRouter();
  const [formData, setFormData] = useState<FormProgramPenghijauan>({
    name: '',
    deskripsi: '',
    judul: '',
    icon: '',
  })

  useEffect(() => {
    const loadProgramPenghijauan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateProgramPenghijauan.update.load(id);
        if (data) {
          // ⬇️ FIX PENTING: tambahkan ini
          stateProgramPenghijauan.update.id = id;

          stateProgramPenghijauan.update.form = {
            name: data.name,
            judul: data.judul,
            deskripsi: data.deskripsi,
            icon: data.icon,
          };

          setFormData({
            name: data.name,
            judul: data.judul,
            deskripsi: data.deskripsi,
            icon: data.icon,
          });
        }
      } catch (error) {
        console.error("Error loading program penghijauan:", error);
        toast.error("Gagal memuat data program penghijauan");
      }
    }

    loadProgramPenghijauan();
  }, [params?.id]);



  const handleSubmit = async () => {
    try {
      stateProgramPenghijauan.update.form = {
        ...stateProgramPenghijauan.update.form,
        name: formData.name.trim(),
        deskripsi: formData.deskripsi.trim(),
        judul: formData.judul.trim(),
        icon: formData.icon.trim(),
      }
      await stateProgramPenghijauan.update.submit();
      router.push("/admin/lingkungan/program-penghijauan");
    } catch (error) {
      console.error("Error updating program penghijauan:", error);
      toast.error("Gagal memuat data program penghijauan");
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
          <Title order={3}>Edit Program Penghijauan</Title>
          <TextInput
            value={formData.name}
            label={<Text fz={"sm"} fw={"bold"}>Nama Program Penghijauan</Text>}
            placeholder="masukkan nama program penghijauan"
            onChange={(val) => {
              setFormData({
                ...formData,
                name: val.target.value
              })
            }}
          />
          <TextInput
            value={formData.judul}
            label={<Text fz={"sm"} fw={"bold"}>Judul Deskripsi Program Penghijauan</Text>}
            placeholder="masukkan judul deskripsi program penghijauan"
            onChange={(val) => {
              setFormData({
                ...formData,
                judul: val.target.value
              })
            }}
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                stateProgramPenghijauan.update.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <Box>
            <Text fz={"sm"} fw={"bold"}>Ikon Program Penghijauan</Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, icon: value }));
                stateProgramPenghijauan.update.form.icon = value;
              }} />
          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditProgramPenghijauan;
