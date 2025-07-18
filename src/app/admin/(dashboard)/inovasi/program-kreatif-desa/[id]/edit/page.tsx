/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import programKreatifState from '@/app/admin/(dashboard)/_state/inovasi/program-kreatif';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import SelectIconProgramEdit from '../../../../_com/selectIconEdit';

interface FormProgramKreatif {
  name: string;
  deskripsi: string;
  slug: string;
  icon: string;
}

type IconKey = 'ekowisata' | 'kompetisi' | 'wisata' | 'ekonomi' | 'sampah';


function EditProgramKreatifDesa() {
  const stateProgramKreatif = useProxy(programKreatifState)
  const params = useParams()
  const router = useRouter();
  const [formData, setFormData] = useState<FormProgramKreatif>({
    name: '',
    deskripsi: '',
    slug: '',
    icon: '',
  })

  useEffect(() => {
    const loadProgramKreatif = async () => {
      const id = params?.id as string;
      if (!id) return;
  
      try {
        const data = await stateProgramKreatif.update.load(id);
        if (data) {
          // ⬇️ FIX PENTING: tambahkan ini
          stateProgramKreatif.update.id = id;
  
          stateProgramKreatif.update.form = {
            name: data.name,
            slug: data.slug,
            deskripsi: data.deskripsi,
            icon: data.icon,
          };
  
          setFormData({
            name: data.name,
            slug: data.slug,
            deskripsi: data.deskripsi,
            icon: data.icon,
          });
        }
      } catch (error) {
        console.error("Error loading program kreatif:", error);
        toast.error("Gagal memuat data program kreatif");
      }
    }
  
    loadProgramKreatif();
  }, [params?.id]);
  


  const handleSubmit = async () => {
    try {
      stateProgramKreatif.update.form = {
        ...stateProgramKreatif.update.form,
        name: formData.name.trim(),
        deskripsi: formData.deskripsi.trim(),
        slug: formData.slug.trim(),
        icon: formData.icon.trim(),
      }
      await stateProgramKreatif.update.submit();
      router.push("/admin/inovasi/program-kreatif-desa");
    } catch (error) {
      console.error("Error updating program kreatif:", error);
      toast.error("Gagal memuat data program kreatif");
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
          <Title order={3}>Edit Program Kreatif Desa</Title>
          <TextInput
            value={formData.name}
            label={<Text fz={"sm"} fw={"bold"}>Nama Program Kreatif Desa</Text>}
            placeholder="masukkan nama program kreatif desa"
            onChange={(val) => {
              setFormData({
                ...formData,
                name: val.target.value
              })
            }}
          />
          <TextInput
            value={formData.slug}
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi Singkat Program Kreatif Desa</Text>}
            placeholder="masukkan deskripsi singkat program kreatif desa"
            onChange={(val) => {
              setFormData({
                ...formData,
                slug: val.target.value
              })
            }}
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                stateProgramKreatif.update.form.deskripsi = htmlContent;
              }}
            />
          </Box>
          <Box>
            <Text fz={"sm"} fw={"bold"}>Ikon Program Kreatif Desa</Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, icon: value }));
                stateProgramKreatif.update.form.icon = value;
              }}
/>


          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Edit Berita</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditProgramKreatifDesa;
