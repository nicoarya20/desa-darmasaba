import colors from '@/con/colors';
import { Stack, Box, Paper, Text, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
        Struktur PPID Desa Darmasaba
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Paper p={"xl"} bg={colors['white-trans-1']}>
          <Image src={"/api/img/struktur-ppid.png"} alt='' />
        </Paper>
      </Box>
    </Stack>
  );
}

      export default Page;
