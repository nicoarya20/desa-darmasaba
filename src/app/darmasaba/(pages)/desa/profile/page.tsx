import colors from '@/con/colors';
import { Box, Container, Stack, Text } from '@mantine/core';
import BackButton from './_com/BackButto';
import ProfileDesa from './ui/profileDesa';
import SejarahDesa from './ui/sejarahDesa';
import VisimisiDesa from './ui/visimisiDesa';
import LambangDesa from './ui/lambangDesa';
import MaskotDesa from './ui/maskotDesa';
import ProfilPerbekel from './ui/profilPerbekel';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"42"}>
      <Box px={50}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Stack align='center' gap={0}>
          <Text fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
            Profile Desa
          </Text>
        </Stack>
      </Container>
      <Box w={{ base: "100%", md: "100%" }} px={50}>
        <ProfileDesa />
        <SejarahDesa />
        <VisimisiDesa />
        <LambangDesa />
        <MaskotDesa />
        <ProfilPerbekel />
      </Box>
    </Stack>
  );
}

export default Page;
