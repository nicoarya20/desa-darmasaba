'use client'
import colors from "@/con/colors";
import { Box, Button, Center, Grid, GridCol, Group, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from "@mantine/core";
import { IconBarbell, IconCalendar, IconOld, IconSearch, IconUser, IconUsersGroup } from "@tabler/icons-react";
import BackButton from "../../desa/layanan/_com/BackButto";
import { useProxy } from "valtio/utils";
import programKesehatan from "@/app/admin/(dashboard)/_state/kesehatan/program-kesehatan/programKesehatan";
import { useState } from "react";
import { useShallowEffect } from "@mantine/hooks";
import { useRouter } from "next/navigation";

const data2 = [
  {
    id: 1,
    icon: <IconBarbell size={50} color={colors['BG-trans']} />,
    title: "Menjaga Kesehatan Tubuh",
    desc: "Program kesehatan desa dirancang untuk memelihara kesehatan fisik masyarakat melalui aktivitas rutin, pemeriksaan kesehatan berkala, dan edukasi gaya hidup sehat.",
  },
  {
    id: 2,
    icon: <IconUsersGroup size={50} color={colors['BG-trans']} />,
    title: "Mempererat Kebersamaan",
    desc: "Kegiatan kesehatan komunal menjadi wadah interaksi sosial yang memperkuat ikatan antar warga desa, menumbuhkan rasa kepedulian dan gotong royong.",
  },
  {
    id: 3,
    icon: <IconOld size={50} color={colors['BG-trans']} />,
    title: "Medukung Lansia Aktif",
    desc: "Program khusus bagi lansia membantu menjaga kebugaran, mengurangi risiko penyakit degeneratif, dan menciptakan komunitas pendukung untuk kehidupan yang sehat dan bahagia.",
  },
]
export default function Page() {
  const state = useProxy(programKesehatan)
  const router = useRouter()
  const [search, setSearch] = useState('')
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, search)
  }, [page, search])

  if (loading || !data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Grid px={{ base: 'md', md: 100 }} align="center">
        <GridCol span={{ base: 12, md: 9 }}>
          <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
            Program Kesehatan Unggulan
          </Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 3 }}>
          <TextInput
            placeholder='Cari Program Kesehatan'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={20} />}
            w={{ base: "50%", md: "100%" }}
          />
        </GridCol>
      </Grid>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <SimpleGrid
            pb={10}
            cols={{
              base: 1,
              md: 3,
            }}>
            {data.map((v, k) => {
              return (
                <Paper radius={10} key={k} bg={colors["white-trans-1"]}>
                  <Stack gap={'xs'}>
                    <Center>
                      <Image src={v.image?.link} alt="" style={{ borderRadius: '14px 14px 0 0' }} />
                    </Center>
                    <Box px={'lg'}>
                      <Box>
                        <Text pb={10} c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                          {v.name}
                        </Text>
                        <Text ta={'justify'} fz={'h4'} dangerouslySetInnerHTML={{ __html: v.deskripsi }}></Text>
                      </Box>
                      <Box py={15} onClick={() => router.push(`/darmasaba/kesehatan/program-kesehatan/${v.id}`)}>
                        <Button fw={'bold'} fz={'h5'} c={colors["blue-button"]} bg={colors["BG-trans"]}>Detail Program</Button>
                      </Box>
                      <Group py={20}>
                        <Group gap="xs">
                          <IconCalendar size={18} />
                          <Text size="sm">
                            {v.createdAt ? new Date(v.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }) : 'No date available'}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <IconUser size={18} />
                          <Text size="sm">Admin Desa</Text>
                        </Group>
                      </Group>
                    </Box>
                  </Stack>
                </Paper>
              )
            })}
          </SimpleGrid>
          <Center>
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage)} // ini penting!
              total={totalPages}
              mt="md"
              mb="md"
            />
          </Center>
        </Stack>
      </Box>
      <Box py={10} px={{ base: "md", md: 100 }}>
        <Box pb={10}>
          <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
            Manfaat Program Kesehatan
          </Text>
          <Text fz={{ base: "h4", md: "h3" }} >
            Program kesehatan di Desa Darmasaba memiliki peran penting dalam meningkatkan kesejahteraan masyarakat.
          </Text>
        </Box>
        <SimpleGrid
          pb={30}
          cols={{
            base: 1,
            md: 3,
          }}>
          {data2.map((v, k) => {
            return (
              <Paper key={k} px={"xl"} py={80} bg={colors['white-trans-1']} c={colors['blue-button']}>
                <Stack justify='space-between' >
                  <Group justify='center'>
                    <Paper p={'xl'} radius={'100'} bg={colors['blue-button']}>
                      <Center >
                        {v.icon}
                      </Center>
                    </Paper>
                  </Group>
                  <Text ta={"center"} fw={"bold"} fz={"h3"}>
                    {v.title}
                  </Text>
                  <Text ta={"center"} fz={'h4'}>
                    {v.desc}
                  </Text>
                </Stack>
              </Paper>
            )
          })}
        </SimpleGrid>
      </Box>
    </Stack>
  )
}
