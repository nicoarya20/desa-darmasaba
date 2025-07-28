/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan-masyarakat';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditListBulanan() {
  const editState = useProxy(indeksKepuasanState.monthlyStatState)
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    month: editState.edit.form.month || '',
    respondentsCount: editState.edit.form.respondentsCount || 0,
    surveyId: editState.edit.form.surveyId || '',
  })

  useEffect(() => {
    const loadSurvey = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.edit.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            month: data.month,
            respondentsCount: data.respondentsCount,
            surveyId: data.surveyId,
          });
        }
      } catch (error) {
        console.error("Error loading list bulanan:", error);
        toast.error("Gagal memuat data list bulanan");
      }
    };
    indeksKepuasanState.surveyState.findMany.load();
    loadSurvey();
  }, [params?.id]);

  const handleSubmit = async () => {

    try {
      // edit global state with form data
      editState.edit.form = {
        ...editState.edit.form,
        month: formData.month,
        respondentsCount: formData.respondentsCount,
        surveyId: formData.surveyId,
      };

      await editState.edit.update();
      toast.success("list bulanan berhasil diperbarui!");
      router.push("/admin/landing-page/indeks-kepuasan-masyarakat/list-bulanan");
    } catch (error) {
      console.error("Error updating list bulanan:", error);
      toast.error("Terjadi kesalahan saat memperbarui list bulanan");
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
                value={formData.month}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    month: val.target.value
                  })
                }}
                label={<Text fw={"bold"} fz={"sm"}>Bulan</Text>}
                placeholder='Masukkan bulan'
              />
              <TextInput
                value={formData.respondentsCount}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    respondentsCount: Number(val.target.value)
                  })
                }}
                label={<Text fw={"bold"} fz={"sm"}>Total Responden</Text>}
                placeholder='Masukkan total responden'
              />
              <Select
                label={<Text fw="bold" fz="sm">Pilih Survey</Text>}
                placeholder="Pilih survey"
                value={formData.surveyId}
                onChange={(value) => {
                  if (value) setFormData({
                    ...formData,
                    surveyId: value
                  })
                }}
                data={
                  indeksKepuasanState.surveyState.findMany.data?.map((survey) => ({
                    value: survey.id,
                    label: `${survey.title} (${survey.totalRespondents} responden)`,
                  })) || []
                }
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

export default EditListBulanan;
