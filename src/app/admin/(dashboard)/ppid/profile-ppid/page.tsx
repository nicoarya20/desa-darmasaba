'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import Biodata from './biodata/page';
import PengalamanOrganisasi from './pengalaman_organisasi/page';
import RiwayatKarir from './riwayat_karir/page';
import ProgramKerjaUnggulan from './program_kerja_unggulan/page';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../_state/ppid/profile_ppid/profile_PPID';
import { useShallowEffect } from '@mantine/hooks';
import ProfileList from './listPage';
import { useState } from 'react';
import { toast } from 'react-toastify';


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
  const [isLoading, setIsLoading] = useState(false)
  const allState = useProxy(stateProfilePPID)

  // Initialize data if it doesn't exist
  useShallowEffect(() => {
    if (!allState.findById.data && isLoading) {
      allState.findById.initialize()
      setIsLoading(false)
    }
  }, [isLoading])

  const submit = () => {
    if (
      allState.findById.data?.name &&
      allState.findById.data?.biodata &&
      allState.findById.data?.riwayat &&
      allState.findById.data?.pengalaman &&
      allState.findById.data?.unggulan
    ) {
      allState.update.save(allState.findById.data)
      setIsLoading(true)
      toast.success("success")
      console.log("[SUBMIT SUCCESS]", JSON.stringify(allState.findById.data, null, 2))
      allState.findById.initialize()
    } else {
      toast.error("error")
    }
  }

  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={"xs"}>
        <Title order={3}>Profile PPID</Title>
        <TextInput
          label={<Text fw={"bold"}>Nama Perbekel</Text>}
          placeholder="masukkan nama perbekel"
          value={allState.findById.data?.name || ''}
          onChange={(val) => {
            if (allState.findById.data) {
              allState.findById.data.name = val.currentTarget.value
            }
          }}
        />
        <Biodata />
        <RiwayatKarir />
        <PengalamanOrganisasi />
        <ProgramKerjaUnggulan />
        <Group>
          <Button
            bg={colors['blue-button']}
            onClick={submit}
            loading={allState.update.loading}
          >
            Submit
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}

export default Page;