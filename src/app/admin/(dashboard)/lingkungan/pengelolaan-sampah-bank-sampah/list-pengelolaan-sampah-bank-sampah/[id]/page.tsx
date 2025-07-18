/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import SelectIconProgramEdit from '@/app/admin/(dashboard)/inovasi/program-kreatif-desa/_lib/selectIconEdit';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface FormProgramKreatif {
  name: string;
  icon: string;
}

type IconKey = 'ekowisata' | 'kompetisi' | 'wisata' | 'ekonomi' | 'sampah' | 'truck' | 'scale' | 'clipboard' | 'trash';


function EditProgramKreatifDesa() {
  const stateSampah = useProxy(pengelolaanSampahState.pengelolaanSampah)
  const params = useParams()
  const router = useRouter();
  const [formData, setFormData] = useState<FormProgramKreatif>({
    name: '',
    icon: '',
  })

  useEffect(() => {
    const loadProgramKreatif = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateSampah.update.load(id);
        if (data) {
          // ⬇️ FIX PENTING: tambahkan ini
          stateSampah.update.id = id;

          stateSampah.update.form = {
            name: data.name,
            icon: data.icon,
          };

          setFormData({
            name: data.name,
            icon: data.icon,
          });
        }
      } catch (error) {
        console.error("Error loading pengelolaan sampah:", error);
        toast.error("Gagal memuat data pengelolaan sampah");
      }
    }

    loadProgramKreatif();
  }, [params?.id]);



  const handleSubmit = async () => {
    try {
      stateSampah.update.form = {
        ...stateSampah.update.form,
        name: formData.name.trim(),
        icon: formData.icon.trim(),
      }
      await stateSampah.update.submit();
      router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah");
    } catch (error) {
      console.error("Error updating pengelolaan sampah:", error);
      toast.error("Gagal memuat data pengelolaan sampah");
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
          <Title order={3}>Edit List Pengelolaan Sampah Bank Sampah</Title>
          <TextInput
            value={formData.name}
            label={<Text fz={"sm"} fw={"bold"}>Nama List Pengelolaan Sampah Bank Sampah</Text>}
            placeholder="masukkan nama list pengelolaan sampah bank sampah"
            onChange={(val) => {
              setFormData({
                ...formData,
                name: val.target.value
              })
            }}
          />
          <Box>
            <Text fz={"sm"} fw={"bold"}>Ikon List Pengelolaan Sampah Bank Sampah</Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, icon: value }));
                stateSampah.update.form.icon = value;
              }}
            />
          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditProgramKreatifDesa;
