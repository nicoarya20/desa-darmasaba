import colors from '@/con/colors';
import { Stack, Skeleton, Paper, Title, Box, Text, Image } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../_state/ppid/profile_ppid/profile_PPID';

function ProfileList() {
  const allList = useProxy(stateProfilePPID)
  useShallowEffect(() => {
    allList.findById.load("1") // Assuming "1" is your default ID, adjust as needed
  }, [])

  if (!allList.findById.data) return <Stack>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>

  const dataArray = Array.isArray(allList.findById.data)
    ? allList.findById.data
    : [allList.findById.data];

  return (
    <Paper bg={colors['white-1']} p={'md'}>
      <Stack gap={"xs"}>
        <Title order={3}>List Profile PPID</Title>
        {dataArray.map((item) => (
          <Box key={item.id}>
            {item.imageUrl && (
              <Box mb={20}>
                <Text fw={"bold"} mb={5}>Preview Gambar:</Text>
                <Image
                  src={item.imageUrl}
                  alt="Profile"
                  w={200}
                />
              </Box>
            )}
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

export default ProfileList;
