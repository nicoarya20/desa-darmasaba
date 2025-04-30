import colors from '@/con/colors';
import { Stack, Box, Text, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Text px={{ base: 'md', md: 100 }} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
        Struktur Organisasi dan SK Pengurus BUMDesa
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <Image src={'/api/img/bpddarmasaba.png'} alt='' />
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
