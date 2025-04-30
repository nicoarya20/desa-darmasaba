import colors from '@/con/colors';
import { Badge, Box, Button, Flex, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowDown, IconClock, IconNavigation, IconPhone, IconPin, IconSearch } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';


function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box pb={10} px={{ base: 20, md: 100 }}>
        <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Kantor Polisi Terdekat
        </Text>
        <Text pb={15} fz={'h4'} >
          Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung
        </Text>
        <TextInput radius={10} leftSection={<IconSearch size={20} />} placeholder='Cari Kantor Polisi' />
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Paper radius={10} bg={colors["white-trans-1"]} p={'xl'}>
            <Stack gap={'xs'}>
              <SimpleGrid
                cols={{
                  base: 1,
                  md: 2,
                }}
              >
                {/* Content Sebelah Kiri */}
                <Box>
                  <Text c={colors["blue-button"]} fw={'bold'} fz={'h2'}>Polsek Abiansemal</Text>
                  <Text c={colors["blue-button"]} fz={'sm'}>2,5 Km dari Desa Darmasaba</Text>
                  <Flex py={10} gap={9} align={'center'}>
                    <IconPin size={25} color={colors["blue-button"]} />
                    <Text c={colors["blue-button"]} fz={'lg'}>Jl. Gandamayu 1 Blahkiuh</Text>
                  </Flex>
                  <Flex gap={9} align={'center'}>
                    <IconPhone size={25} color={colors["blue-button"]} />
                    <Text c={colors["blue-button"]} fz={'lg'}>08xxxxxxxx</Text>
                  </Flex>
                  <Flex py={10} gap={9} align={'center'}>
                    <IconClock size={25} color={colors["blue-button"]} />
                    <Text c={colors["blue-button"]} fz={'lg'}>24 Jam</Text>
                  </Flex>
                  <Box>
                    <Text c={colors["blue-button"]} fw={'bold'} fz={'h2'}>Layanan Yang Tersedia :</Text>
                    <SimpleGrid
                      py={10}
                      cols={{
                        base: 1,
                        md: 2,
                      }}
                    >
                      <Box>
                        <Text c={colors["blue-button"]} fz={'lg'}>Laporan Kehilangan</Text>
                      </Box>
                      <Box>
                        <Text c={colors["blue-button"]} fz={'lg'}>Laporan Kriminal</Text>
                      </Box>
                      <Box>
                        <Text c={colors["blue-button"]} fz={'lg'}>Pelayanan SKCK</Text>
                      </Box>
                      <Box>
                        <Text c={colors["blue-button"]} fz={'lg'}>Pengaduan Masyarakat</Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                  <Box>
                    <Button bg={colors["blue-button"]} rightSection={<IconArrowDown size={20}/>}>Lihat Kantor Polisi Lainnya</Button>
                  </Box>
                </Box>
                <Box pos={'relative'}>
                  <Box style={{ position: 'absolute', top: 0, right: 0 }}>
                    <Badge size='lg' c={'#287407'} bg={'#A8EDC4'}>Buka</Badge>
                  </Box>
                  <Box pt={40}>
                  <iframe style={{ border: 2, width: "100%" }} src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.7949871034166!2d115.20778387533218!3d-8.519275686287415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23ceb4f6e5363%3A0xa353662f070f47d8!2sAbian%20Semal%20Police%20Station!5e0!3m2!1sid!2sid!4v1742789148825!5m2!1sid!2sid" width="550" height="300" ></iframe>
                  </Box>
                  <Box pt={20}>
                    <Button fullWidth bg={colors["blue-button"]} radius={10} leftSection={<IconNavigation size={20}/>}>Petunjuk Arah</Button>
                  </Box>
                </Box>
              </SimpleGrid>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
