/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan-masyarakat';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';



function CreateListSurvey() {
  const router = useRouter();
  const stateCreate = useProxy(indeksKepuasanState.surveyState)


  useEffect(() => {
    stateCreate.findMany.load();
  }, []);

  const resetForm = () => {
    stateCreate.create.form = {
      title: "",
      totalRespondents: 0,
      averageScore: 0,
    };
  };
  const handleSubmit = async () => {
    await stateCreate.create.create();
    resetForm();
    router.push("/admin/landing-page/indeks-kepuasan-masyarakat/list-survey")
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
          <Title order={4}>Create List Survey</Title>
          <TextInput
            value={stateCreate.create.form.title}
            onChange={(val) => {
              stateCreate.create.form.title = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Judul</Text>}
            placeholder='Masukkan judul'
          />
           <TextInput
            value={stateCreate.create.form.totalRespondents}
            onChange={(val) => {
              stateCreate.create.form.totalRespondents = Number(val.target.value);
            }}
            label={<Text fw={"bold"} fz={"sm"}>Total Responden</Text>}
            placeholder='Masukkan tahun'
          />
           <TextInput
            value={stateCreate.create.form.averageScore}
            onChange={(val) => {
              stateCreate.create.form.averageScore = Number(val.target.value);
            }}
            label={<Text fw={"bold"} fz={"sm"}>Skor</Text>}
            placeholder='Masukkan skor'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateListSurvey;
