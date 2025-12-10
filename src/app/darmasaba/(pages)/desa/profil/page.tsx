import colors from '@/con/colors';
import { Box, Container, Stack, Text } from '@mantine/core';
import BackButton from './_com/BackButto';
import ProfileDesa from './ui/profileDesa';
import SejarahDesa from './ui/sejarahDesa';
import VisimisiDesa from './ui/visimisiDesa';
import LambangDesa from './ui/lambangDesa';
import MaskotDesa from './ui/maskotDesa';
import ProfilPerbekel from './ui/profilPerbekel';
// import LembagaDesa from './ui/lembagaDesa';
import MotoDesa from './ui/motoDesa';
import SemuaPerbekel from './ui/semuaPerbekel';
import ScrollToTopButton from '@/app/darmasaba/_com/scrollToTopButton';
import StrukturPerangkatDesa from './struktur-perangkat-desa/page';

function Page() {
  return (
    <Box>
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        <Container w={{ base: "100%", md: "50%" }}>
          <Stack align='center' gap={0}>
            <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
              Profile Desa
            </Text>
          </Stack>
        </Container>
        <Stack px={{ base: "md", md: 100 }} gap={"xl"}>
          <ProfileDesa />
          <SejarahDesa />
          <VisimisiDesa />
          <LambangDesa />
          <MaskotDesa />
          <ProfilPerbekel />
          <StrukturPerangkatDesa/>
          <MotoDesa />
          <SemuaPerbekel />
        </Stack>
      </Stack>
      {/* Tombol Scroll ke Atas */}
      <ScrollToTopButton />
    </Box>
  );
}

export default Page;
