import { Box, Center, Container, Image, Stack, Text } from '@mantine/core';
import BackButton from '../../(pages)/desa/layanan/_com/BackButto';




function Page() {
  return (
    <Stack pos={"relative"} py={"xl"} gap={22}>
      <Container w={{ base: "100%", md: "50%" }}>
        <BackButton />
        <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"}>
            SDGs Desa
          </Text>
          <Text
            py={10}
            ta={"justify"}
          >
            SDGs Desa adalah upaya terpadu pemerintah dalam percepatan pencapaian tujuan pembangunan berkelanjutan di tingkat desa. Ini merupakan terjemahan dari SDGs global dalam konteks pembangunan desa di Indonesia. SDGs Desa bertujuan untuk menciptakan desa yang lebih inklusif, berkelanjutan, dan tangguh menghadapi tantangan masa depan. Adapun
          </Text>
          <Text
            ta={"justify"}
          >
            SDGs Desa sebagaimana dijabarkan dalam Permendesa Nomor 21 tahun 2020 terdiri dari 18 tujuan yang harus dicapai pada tahun 2030. Tujuan-tujuan tersebut mencakup berbagai aspek kehidupan masyarakat desa, mulai dari pengentasan kemiskinan, peningkatan kesehatan dan pendidikan, kesetaraan gender, pertumbuhan ekonomi, infrastruktur, hingga kelestarian lingkungan. Adapun SDGs Desa terdiri dari tujuan-tujuan sebagai berikut:
          </Text>
        </Stack>
      </Container>
      <Box p={20}>
        <Center>
          <Image src={"/api/img/sdgsdesa-18-removebg.png"} alt='' w={800} />
        </Center>
      </Box>
      <Box py={20}>
        
      </Box>
    </Stack>
  );
}

export default Page;
