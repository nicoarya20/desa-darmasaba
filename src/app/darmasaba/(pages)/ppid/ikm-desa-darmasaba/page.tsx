import colors from '@/con/colors';
import { Box, Paper, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';
import GrafikBerdasarkanJenisKelamin from './grafik_berdasarkan_jenis_kelamin/page';
import GrafikBerdasarkanResponden from './grafik_berdasarkan_pilihan_responden/page';
import GrafikBerdasarakanUmur from './grafik_berdasarkan_umur_responden/page';
import GrafikHasilKepuasan from './grafik_hasil_kepuasan_masyarakat/page';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Text ta={"center"} fz={{ base: "h2", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Indeks Kepuasan Masyarakat (IKM)
        </Text>
        <Text ta={"center"} fz={{ base: "h2", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Desa Darmasaba
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Paper bg={colors['white-1']} p={'xl'}>
          <GrafikHasilKepuasan />
        </Paper>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Paper p={"xl"} bg={colors['white-trans-1']}>
         <GrafikBerdasarkanJenisKelamin/>
        </Paper>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Paper p={"xl"} bg={colors['white-trans-1']}>
        <GrafikBerdasarkanResponden/>
        </Paper>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Paper p={"xl"} bg={colors['white-trans-1']}>
       <GrafikBerdasarakanUmur/>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;
