/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan-masyarakat';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';


function CreateListBulanan() {
  const router = useRouter();
  const stateCreate = useProxy(indeksKepuasanState.monthlyStatState)


  useEffect(() => {
    stateCreate.findMany.load();
    indeksKepuasanState.surveyState.findMany.load();
  }, []);

  const resetForm = () => {
    stateCreate.create.form = {
      month: "",
      respondentsCount: 0,
      surveyId: "",
    };
  };
  const handleSubmit = async () => {
    await stateCreate.create.create();
    resetForm();
    router.push("/admin/landing-page/indeks-kepuasan-masyarakat/list-bulanan")
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
          <Title order={4}>Create List Bulanan</Title>
          <TextInput
            value={stateCreate.create.form.month}
            onChange={(val) => {
              stateCreate.create.form.month = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Bulan</Text>}
            placeholder='Masukkan bulan'
          />
          <TextInput
            value={stateCreate.create.form.respondentsCount}
            onChange={(val) => {
              stateCreate.create.form.respondentsCount = Number(val.target.value);
            }}
            label={<Text fw={"bold"} fz={"sm"}>Total Responden</Text>}
            placeholder='Masukkan total responden'
          />
          <Select
            label={<Text fw="bold" fz="sm">Pilih Survey</Text>}
            placeholder="Pilih survey"
            value={stateCreate.create.form.surveyId}
            onChange={(value) => {
              if (value) stateCreate.create.form.surveyId = value;
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
    </Box>
  );
}

export default CreateListBulanan;
