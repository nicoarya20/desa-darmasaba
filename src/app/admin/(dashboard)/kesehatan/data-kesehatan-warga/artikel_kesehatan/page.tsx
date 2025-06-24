'use client'
import { Box, Button, Center, Group, Paper, SimpleGrid, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import IntoductionUI from './introduction/page';
import SymptomUI from './symptom/page';
import PreventionUI from './prevention/page';
import MythFactUI from './mythVsfact/page';
import DoctorSignUI from './doctor_sign/page';
import { useProxy } from 'valtio/utils';
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import FirstAidUI from './first_aid/page';
import { useShallowEffect } from '@mantine/hooks';
import colors from '@/con/colors';

function ArtikelKesehatan() {
  const state = useProxy(stateArtikelKesehatan)
  const submitAllForms = () => {
    if (state.introduction.create.form.content) {
      state.introduction.create.create()
    }
    if (state.symptom.create.form.title && state.symptom.create.form.content) {
      state.symptom.create.create()
    }
    if (state.prevention.create.form.title && state.prevention.create.form.content) {
      state.prevention.create.create()
    }
    if (state.firstAid.create.form.title && state.firstAid.create.form.content) {
      state.firstAid.create.create()
    }
    if (state.mythFact.create.form.title && state.mythFact.create.form.mitos && state.mythFact.create.form.fakta) {
      state.mythFact.create.create()
    }
    if (state.doctorSign.create.form.content) {
      state.doctorSign.create.create()
    }
  }
  return (
    <Stack py={10}>
      <SimpleGrid cols={{
        base: 1, md: 2
      }}>
        <Box >
          <Stack gap={"xs"}>
            <Title order={4}>Artikel Kesehatan</Title>
            <IntoductionUI />
            <SymptomUI />
            <PreventionUI />
            <FirstAidUI />
            <MythFactUI />
            <DoctorSignUI />
            <Group>
              <Button bg={colors['blue-button']} mt={10} onClick={submitAllForms}>Submit</Button>
            </Group>
          </Stack>
        </Box>

        <Box>
          <Stack gap={"xs"}>
            <Title order={4}>Data Artikel Kesehatan</Title>
            <AllList />
          </Stack>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}

function AllList() {
  const listState = useProxy(stateArtikelKesehatan)
  useShallowEffect(() => {
    listState.introduction.findMany.load();
    listState.symptom.findMany.load();
    listState.prevention.findMany.load();
    listState.firstAid.findMany.load();
    listState.mythFact.findMany.load();
    listState.doctorSign.findMany.load();
  }, [])

  if (!listState.introduction.findMany.data
    || !listState.symptom.findMany.data
    || !listState.prevention.findMany.data
    || !listState.firstAid.findMany.data
    || !listState.mythFact.findMany.data
    || !listState.doctorSign.findMany.data
  ) return <Stack>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  return <Stack gap={"xs"}>
    {/* Introduction */}
    <Paper bg={colors['white-1']} p={'md'}>
      <Title order={4}>Pendahuluan</Title>
      {listState.introduction.findMany.data?.map((item) => (
        <Box key={item.id}>
          <Text dangerouslySetInnerHTML={{ __html: item.content }}></Text>
        </Box>
      ))}
    </Paper>
    {/* Symptom */}
    <Paper bg={colors['white-1']} p={'md'}>
      <Title order={4}>Gejala Penyakit</Title>
      {listState.symptom.findMany.data?.map((item) => (
        <Box key={item.id}>
          <Title order={4}>{item.title}</Title>
          <Text dangerouslySetInnerHTML={{ __html: item.content }}></Text>
        </Box>
      ))}
    </Paper>
    {/* Prevention */}
    <Paper bg={colors['white-1']} p={'md'}>
    <Title order={4}>Pencegahan Penyakit</Title>
      {listState.prevention.findMany.data?.map((item) => (
        <Box key={item.id}>
          <Title order={4}>{item.title}</Title>
          <Text dangerouslySetInnerHTML={{ __html: item.content }}></Text>
        </Box>
      ))}
    </Paper>
    {/* First Aid */}
    <Paper bg={colors['white-1']} p={'md'}>
    <Title order={4}>Pertolongan Pertama</Title>
      {listState.firstAid.findMany.data?.map((item) => (
        <Box key={item.id}>
          <Title order={4}>{item.title}</Title>
          <Text dangerouslySetInnerHTML={{ __html: item.content }}></Text>
        </Box>
      ))}
    </Paper>
    {/* Myth Fact */}
    <Paper bg={colors['white-1']} p={'md'}>
    <Title order={4}>Mitos vs Fakta</Title>
      {listState.mythFact.findMany.data?.map((item) => (
        <Box key={item.id}>
          <Title order={4}>{item.title}</Title>
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            bg={colors['white-1']}
          >
            <TableThead >
              <TableTr >
                <TableTh >
                  <Center>Mitos</Center>
                </TableTh>
                <TableTh >
                  <Center>Fakta</Center>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody >
              <TableTr>
                <TableTd ta="center">{item.mitos}</TableTd>
                <TableTd ta="center">{item.fakta}</TableTd>
              </TableTr>
            </TableTbody>
          </Table>
        </Box>
      ))}
    </Paper>
    {/* Doctor Sign */}
    <Paper bg={colors['white-1']} p={'md'}>
      <Title order={4}>Kapan Harus Ke Dokter?</Title>
      {listState.doctorSign.findMany.data?.map((item) => (
        <Box key={item.id}>
          <Text dangerouslySetInnerHTML={{ __html: item.content }} />
        </Box>
      ))}
    </Paper>
  </Stack>
}

export default ArtikelKesehatan;