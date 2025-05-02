'use client'
import { Box, Button, Center, SimpleGrid, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
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
          <Title order={3}>Artikel Kesehatan</Title>
          <IntoductionUI />
          <SymptomUI />
          <PreventionUI />
          <FirstAidUI />
          <MythFactUI />
          <DoctorSignUI />
          <Button mt={10} onClick={submitAllForms}>Submit</Button>
        </Box>

        <Box>
          <Title order={3}>List Artikel Kesehatan</Title>
          <AllList />
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
  return <Stack>
    <Title order={4}>Intoduction</Title>
    {listState.introduction.findMany.data?.map((item) => (
      <Box key={item.id}>
        <Text dangerouslySetInnerHTML={{ __html: item.content }}></Text>
      </Box>
    ))}
    {/* Symptom */}
    {listState.symptom.findMany.data?.map((item) => (
      <Box key={item.id}>
        <Title order={4}>{item.title}</Title>
        <Text dangerouslySetInnerHTML={{ __html: item.content }}></Text>
      </Box>
    ))}
    {/* Prevention */}
    {listState.prevention.findMany.data?.map((item) => (
      <Box key={item.id}>
        <Title order={4}>{item.title}</Title>
        <Text dangerouslySetInnerHTML={{ __html: item.content }}></Text>
      </Box>
    ))}
    {/* First Aid */}
    {listState.firstAid.findMany.data?.map((item) => (
      <Box key={item.id}>
        <Title order={4}>{item.title}</Title>
        <Text dangerouslySetInnerHTML={{ __html: item.content }}></Text>
      </Box>
    ))}
    {/* Myth Fact */}
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
    {/* Doctor Sign */}
    <Title order={4}>Kapan Harus Ke Dokter?</Title>
    {listState.doctorSign.findMany.data?.map((item) => (
      <Box key={item.id}>
        <Text dangerouslySetInnerHTML={{ __html: item.content }}/>
      </Box>
    ))}
  </Stack>
}

export default ArtikelKesehatan;
