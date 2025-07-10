import colors from '@/con/colors';
import { Stack, Box, Text, Image, Paper } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Pendapatan Asli Desa
        </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <Paper bg={colors['white-1']} p={"xl"}>
          <Image src="/pa-desa.png" alt=''/>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
