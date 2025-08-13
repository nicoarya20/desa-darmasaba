/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Stack, Paper, Image, Text, Center, Skeleton } from '@mantine/core';
import React, { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';

function LambangDesa() {
  const state = useProxy(stateProfileDesa.lambangDesa)

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
    <Box pb={70}>
      <Stack align='center' gap={0}>
        <Box pb={30}>
          <Center>
          <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
          </Center>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Lambang Desa</Text>
        </Box>
        <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
          <Text fz={{ base: "md", md: "h3"}} ta={"justify"} dangerouslySetInnerHTML={{__html: data.deskripsi}} />
        </Paper>
      </Stack>
    </Box >
  );
}

export default LambangDesa;
