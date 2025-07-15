'use client'
import colors from '@/con/colors';
import { Box, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';
import AdministrasiOnline from './administrasi-online/page';
import InformasiDesa from './informasi-desa/page';
import PengaduanMasyarakat from './pengaduan-masyarakat/page';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Layanan Online Desa
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            cols={{
              base: 1,
              md: 1
            }}
          >
            <Stack gap={'lg'}>
              <AdministrasiOnline />
              <PengaduanMasyarakat />
              <InformasiDesa />
            </Stack>
          </SimpleGrid>
        </Stack>
      </Box >
    </Stack >
  );
}

export default Page;
