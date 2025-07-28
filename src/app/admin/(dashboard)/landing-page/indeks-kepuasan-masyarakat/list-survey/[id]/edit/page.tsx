/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan-masyarakat';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditListSurvey() {
  const editState = useProxy(indeksKepuasanState.surveyState)
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: editState.edit.form.title || '',
    totalRespondents: editState.edit.form.totalRespondents || 0,
    averageScore: editState.edit.form.averageScore || 0,
  })

  useEffect(() => {
    const loadSurvey = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.edit.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            title: data.title || '',
            totalRespondents: data.totalRespondents || 0,
            averageScore: data.averageScore || 0,
          });
        }
      } catch (error) {
        console.error("Error loading list survey:", error);
        toast.error("Gagal memuat data list survey");
      }
    };

    loadSurvey();
  }, [params?.id]);

  const handleSubmit = async () => {
  
      try {
        // edit global state with form data
        editState.edit.form = {
          ...editState.edit.form,
          title: formData.title,
          totalRespondents: formData.totalRespondents,
          averageScore: formData.averageScore,
        };
  
        await editState.edit.update();
        toast.success("list survey berhasil diperbarui!");
        router.push("/admin/landing-page/indeks-kepuasan-masyarakat/list-survey");
      } catch (error) {
        console.error("Error updating list survey:", error);
        toast.error("Terjadi kesalahan saat memperbarui list survey");
      }
    };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Edit List Survey</Text>
            <Paper>
              <Stack gap={"xs"}>
                <TextInput
                  value={formData.title}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      title: val.target.value
                    })
                  }}
                  label={<Text fw={"bold"} fz={"sm"}>Judul</Text>}
                  placeholder='Masukkan judul'
                />
                <TextInput
                  value={formData.totalRespondents}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      totalRespondents: Number(val.target.value)
                    })
                  }}
                  label={<Text fw={"bold"} fz={"sm"}>Total Responden</Text>}
                  placeholder='Masukkan total responden'
                />
                <TextInput
                  value={formData.averageScore}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      averageScore: Number(val.target.value)
                    })
                  }}
                  label={<Text fw={"bold"} fz={"sm"}>Skor Rata-rata</Text>}
                  placeholder='Masukkan skor'
                />
                <Group>
                  <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
                </Group>
              </Stack>
            </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditListSurvey;
