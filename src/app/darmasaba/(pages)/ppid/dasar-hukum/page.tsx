import colors from '@/con/colors';
import { Box, List, ListItem, Paper, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
        Dasar Hukum
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Paper p={"xl"} bg={colors['white-trans-1']}>
          <Box pb={30}>
            <Text ta={"center"} fw={"bold"} fz={{ base: 'h4', md: 'h3' }}>DASAR HUKUM PEMBENTUKAN PPID</Text>
            <Text ta={"center"} fw={"bold"} fz={{ base: 'h4', md: 'h3' }}>DESA DARMASABA</Text>
          </Box>
          <List>
            <ListItem fz={{ base: 'md', md: 'h4' }}>
              <Text ta={"justify"} fz={{ base: 'md', md: 'h4' }}>
              <Text fw={"bold"} span>
                UU Nomor 14 Tahun 2008
              </Text>
                {" "}tentang Keterbukaan Informasi Publik
              </Text>
            </ListItem>
            <ListItem fz={{ base: 'md', md: 'h4' }}>
              <Text ta={"justify"} fz={{ base: 'md', md: 'h4' }}>
              <Text fw={"bold"} span>
                PP Nomor 61 Tahun 2010
              </Text>
              {" "}tentang Pelaksanaan UU 14 Tahun 2008 tentang Keterbukaan Informasi Publik
              </Text>
            </ListItem>
            <ListItem fz={{ base: 'md', md: 'h4' }}>
              <Text ta={"justify"} fz={{ base: 'md', md: 'h4' }}>
              <Text fw={"bold"} span>
                Permendagri Nomor 3 Tahun 2017
              </Text>
              {" "}tentang Pedoman Pengelolaan Pelayanan Informasi dan Dokumentasi di Lingkungan Kemendagri
                dan Pemerintah Daerah
              </Text>
            </ListItem>
            <ListItem fz={{ base: 'md', md: 'h4' }}>
              <Text ta={"justify"} fz={{ base: 'md', md: 'h4' }}>
              <Text fw={"bold"} span>
                Peraturan Komisi Informasi Nomor 1 Tahun 2010
              </Text>
              {" "} tentang Standar Layanan Informasi Publik
              </Text>
            </ListItem>
            <ListItem fz={{ base: 'md', md: 'h4' }}>
              <Text ta={"justify"} fz={{ base: 'md', md: 'h4' }}>
              <Text fw={"bold"} span>
                Peraturan Komisi Informasi Nomor 1 Tahun 2010
              </Text>
              {" "} tentang Standar Layanan Informasi Publik
              </Text>
            </ListItem>
            <ListItem fz={{ base: 'md', md: 'h4' }}>
              <Text ta={"justify"} fz={{ base: 'md', md: 'h4' }}>
              <Text fw={"bold"} span>
                Peraturan Bupati Badung No. 42 Tahun 2017
              </Text>
              {" "}Tentang Pedoman Pengelolaan Pelayanan Informasi Publik dan Dokumentasi
                di Lingkungan Pemerintah Kabupaten Badung
              </Text>
            </ListItem>
            <ListItem fz={{ base: 'md', md: 'h4' }}>
              <Text ta={"justify"} fz={{ base: 'md', md: 'h4' }}>
              <Text fw={"bold"} span>
                Keputusan Bupati Badung Nomor 99/049/HK/2019
              </Text>
              {" "} Tentang Pengelola Layanan Informasi dan Dokumentasi Kabupaten Badung
              </Text>
            </ListItem>
            <ListItem fz={{ base: 'md', md: 'h4' }}>
              <Text ta={"justify"} fz={{ base: 'md', md: 'h4' }}>
              <Text fw={"bold"} span>
                Keputusan Perbekel Darmasaba Nomor 101 Tahun 2019
              </Text>
              {" "}tentang Penetapan Pelaksana Teknis/Administrasi Pengelola Layanan Informasi
                Dan Dokumentasi Di Desa Punggul
              </Text>
            </ListItem>
            <ListItem fz={{ base: 'md', md: 'h4' }}>
              <Text ta={"justify"} fz={{ base: 'md', md: 'h4' }}>
              <Text fw={"bold"} span>
                Peraturan Perbekel Darmasaba Nomor 12 Tahun 2019
              </Text>
              {" "}tentang Pedoman Pengelolaan Pelayanan Informasi Publik Dan Dokumentasi
                Di Lingkungan Pemerintah Desa Darmasaba
              </Text>
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;
