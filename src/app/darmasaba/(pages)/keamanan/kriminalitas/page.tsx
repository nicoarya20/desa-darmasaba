import colors from '@/con/colors';
import { Box, Button, Flex, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconArrowRight } from '@tabler/icons-react';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <SimpleGrid
        px={{ base: 20, md: 100 }}
        cols={{
          base: 1,
          md: 2
        }}
      >
        {/* Content 1 */}
        <Box pt={{base: 0, md: 35}}>
          <Text c={colors["blue-button"]} fz={{ base: "h4", md: "h3" }} >
            Info Keamanan dan Pencegahan Kriminalitas
          </Text>
          <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
            Kontak Darurat
          </Text>
          <Group>
            <Button rightSection={<IconArrowRight />} mt={20} radius={10} bg={colors["blue-button"]} c={colors["white-1"]}>
              Lihat Detail
            </Button>
          </Group>
        </Box>
        {/* Content 2 */}
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Paper p={"lg"}>
            <Text c={colors["blue-button"]} fw={'bold'} fz={{ base: "h4", md: "h3" }} >
              Tips menjaga keamanan lingkungan
            </Text>
            <Text fz={{ base: "h5", md: "h4" }} c={colors["blue-button"]} >
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </Text>
            <Group>
              <Button rightSection={<IconArrowRight />} mt={20} radius={10} bg={colors["blue-button"]} c={colors["white-1"]}>
                Lihat Detail
              </Button>
            </Group>
          </Paper>
          <Paper p={"lg"}>
            <Text c={colors["blue-button"]} fw={'bold'} fz={{ base: "h4", md: "h3" }} >
              Mengenali tanda-tanda kegiatan kriminal
            </Text>
            <Text fz={{ base: "h5", md: "h4" }} c={colors["blue-button"]} >
              the printing and typesetting industry. the printing and typesetting industry.
            </Text>
            <Group>
              <Button rightSection={<IconArrowRight />} mt={20} radius={10} bg={colors["blue-button"]} c={colors["white-1"]}>
                Lihat Detail
              </Button>
            </Group>
          </Paper>
        </SimpleGrid>
        {/* Content 3 */}
        <Paper p={'xl'}>
          <Text fz={{ base: "h3", md: "h2" }} c={colors["blue-button"]} fw={"bold"}>
            Program Keamanan Rutin
          </Text>
          <Stack pt={30} gap={'lg'}>
            <Box>
              <Paper p={"md"} bg={colors['blue-button']} w={{ base: "100%", md: "100%" }}>
                <Flex align={'center'} justify={'space-between'}>
                  <Text fz={'h3'} c={colors['white-1']}>Ronda Malam</Text>
                  <IconArrowRight size={30} color={colors['white-1']} />
                </Flex>
              </Paper>
            </Box>
            <Box>
              <Paper p={"md"} bg={colors['blue-button']} w={{ base: "100%", md: "100%" }}>
                <Flex align={'center'} justify={'space-between'}>
                  <Text fz={'h3'} c={colors['white-1']}>Ronda Malam</Text>
                  <IconArrowRight size={30} color={colors['white-1']} />
                </Flex>
              </Paper>
            </Box>
            <Box>
              <Paper p={"md"} bg={colors['blue-button']} w={{ base: "100%", md: "100%" }}>
                <Flex align={'center'} justify={'space-between'}>
                  <Text fz={'h3'} c={colors['white-1']}>Ronda Malam</Text>
                  <IconArrowRight size={30} color={colors['white-1']} />
                </Flex>
              </Paper>
            </Box>
            <Box pt={25}>
              <Button fullWidth rightSection={<IconArrowRight size={20} color={colors['white-1']} />}>Lihat program lainnya</Button>
            </Box>
          </Stack>
        </Paper>
        {/* Content 4 */}
        <Box>
          <Paper p={'xl'} >
            <Box style={{ maxWidth: "560px", width: "100%", aspectRatio: "16/9" }}>
              <iframe width="100%"
                height="100%"
                src="https://www.youtube.com/embed/p5OkdBgasWA?si=6lFKXeE9LN5zcJQq" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"  ></iframe>
            </Box>
            <Text py={10} fz={{ base: "h3", md: "h2" }} fw={'bold'} c={colors['blue-button']}>
              Patroli Malam Darmasaba
            </Text>
            <Text fz={'h4'} >
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </Text>
            <Box pt={10}>
              <Button bg={colors['blue-button']} rightSection={<IconArrowRight size={20} color={colors['white-1']} />}>
                Lihat Video Lainnya
              </Button>
            </Box>
          </Paper>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}

export default Page;
