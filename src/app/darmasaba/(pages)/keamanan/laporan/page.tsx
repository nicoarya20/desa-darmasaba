import colors from '@/con/colors';
import { Stack, Box, Text, Flex, ColorSwatch } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Laporan Keamanan Lingkungan
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Flex justify={'space-between'}>
            <Text fz={"h4"}>Laporan Terbaru</Text>
            <Box>
              <Flex gap={'lg'}>
                <Box>
                  <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                    <Text fz={{ base: 'md', md: 'h4' }}>Terselesaikan</Text>
                    <ColorSwatch color="#2A742D" size={30} />
                  </Flex>
                </Box>
                <Box>
                  <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                    <Text fz={{ base: 'md', md: 'h4' }}>Dalam Proses</Text>
                    <ColorSwatch color="#135A9B" size={30} />
                  </Flex>
                </Box>
                <Box>
                  <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                    <Text fz={{ base: 'md', md: 'h4' }}>Gagal</Text>
                    <ColorSwatch color="#A34437" size={30} />
                  </Flex>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
