/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Center, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function SejarahDesa() {
  const state = useProxy(stateProfileDesa.sejarahDesa)

  useEffect(() => {
    state.findUnique.load("edit")
  }, [])

  const { data, loading } = state.findUnique

  if (loading || !data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <>
      <Box pb={70}>
        <Stack align='center' gap={0}>
          <Box pb={30}>
            <Center>
              <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
            </Center>
            <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Sejarah Desa</Text>
          </Box>
          <Paper p={"xl"} bg={colors['white-trans-1']}>
            <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: data.deskripsi }} />
          </Paper>

        </Stack>
      </Box >
    </>
  );
}

export default SejarahDesa;
