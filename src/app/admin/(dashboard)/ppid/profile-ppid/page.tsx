'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import Biodata from './biodata/page';
import PengalamanOrganisasi from './pengalaman_organisasi/page';
import RiwayatKarir from './riwayat_karir/page';
import ProgramKerjaUnggulan from './program_kerja_unggulan/page';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../_state/ppid/profile_ppid/profile_PPID';
import { useShallowEffect } from '@mantine/hooks';


function Page() {
  return (
    <Box>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <ProfileCreate />
        <ProfileList />
      </SimpleGrid>
    </Box>
  );
}

function ProfileCreate() {
  const allState = useProxy(stateProfilePPID)
  const submit = () => {
    if (
      allState.profilePPID.create.form.name &&
      allState.profilePPID.create.form.biodata &&
      allState.profilePPID.create.form.riwayat &&
      allState.profilePPID.create.form.pengalaman &&
      allState.profilePPID.create.form.unggulan) {
        allState.profilePPID.create.create()
      }
  }

  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={"xs"}>
        <Title order={3}>Profile PPID</Title>
        <TextInput
          label={<Text fw={"bold"}>Nama Perbekel</Text>}
          placeholder="masukkan nama perbekel"
          onChange={(val) => {
            allState.profilePPID.create.form.name = val.currentTarget.value
          }}
        />
        <Biodata />
        <RiwayatKarir />
        <PengalamanOrganisasi />
        <ProgramKerjaUnggulan />
        <Group>
          <Button bg={colors['blue-button']} onClick={submit}>Submit</Button>
        </Group>
      </Stack>
    </Paper>
  )
}

function ProfileList() {
  const allList = useProxy(stateProfilePPID)
  useShallowEffect(() => {
    allList.profilePPID.findMany.load()
  }, [])

  if (!allList.profilePPID.findMany.data) return <Stack>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  return (
    <Paper bg={colors['white-1']} p={'md'}>
      <Stack gap={"xs"}>
        <Title order={3}>List Profile PPID</Title>
        {allList.profilePPID.findMany.data?.map((item) => (
          <Box key={item.id}>
            <Box>
              <Text fw={"bold"}>Nama</Text>
              <Text dangerouslySetInnerHTML={{ __html: item.name }}></Text>
            </Box>
            <Box>
              <Text fw={"bold"}>Biodata</Text>
              <Text dangerouslySetInnerHTML={{ __html: item.biodata }}></Text>
            </Box>
            <Box>
              <Text fw={"bold"}>Riwayat</Text>
              <Text dangerouslySetInnerHTML={{ __html: item.riwayat }}></Text>
            </Box>
            <Box>
              <Text fw={"bold"}>Pengalaman</Text>
              <Text dangerouslySetInnerHTML={{ __html: item.pengalaman }}></Text>
            </Box>
            <Box>
              <Text fw={"bold"}>Program Kerja Unggulan</Text>
              <Text dangerouslySetInnerHTML={{ __html: item.unggulan }}></Text>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  )
}

export default Page;
