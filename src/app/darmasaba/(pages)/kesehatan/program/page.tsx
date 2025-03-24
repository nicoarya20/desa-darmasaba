import colors from "@/con/colors";
import { Box, Button, Center, Group, Image, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconBarbell, IconCalendar, IconOld, IconUser, IconUsersGroup } from "@tabler/icons-react";
import BackButton from "../../desa/layanan/_com/BackButto";

const data1 = [
  {
    id: 1,
    judul: 'Posyandu Terintegrasi',
    image: '/api/img/pk-1.png',
    deskripsi: 'Program pemantauan kesehatan terpadu untuk balita, ibu hamil, dan lansia di Banjar Gulingan dengan sistem pencatatan digital. Layanan meliputi penimbangan, imunisasi, dan konsultasi kesehatan'
  },
  {
    id: 2,
    judul: 'Senam Lansia',
    image: '/api/img/pk-2.png',
    deskripsi: 'Kegiatan olahraga teratur untuk warga lanjut usia dengan gerakan yang disesuaikan untuk menjaga kebugaran dan kesehatan. Program ini didampingi oleh instruktur profesional dan pemantauan kesehatan rutin.'
  },
  {
    id: 3,
    judul: 'Vaksinasi & Sterilasi HPR',
    image: '/api/img/pk-3.png',
    deskripsi: 'Program pengendalian hewan penular rabies melalui vaksinasi dan sterilisasi untuk mencegah penyebaran penyakit zoonosis. Dilengkapi dengan sistem pendataan digital untuk memantau cakupan dan efektivitas program.'
  }
]
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
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Program Kesehatan Unggulan
        </Text>
        <Text px={{base: 20, md: 90}} ta={"center"} fz={{ base: "h4", md: "h3" }} >
          Desa Darmasaba mengembangkan berbagai program kesehatan terpadu untuk meningkatkan kualitas
          hidup masyarakat, dengan pendekatan preventif dan promotif bebrbasis teknologi serta prtisipasi aktif
          warga.
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <SimpleGrid
            pb={10}
            cols={{
              base: 1,
              md: 3,
            }}>
            {data1.map((v, k) => {
              return (
                <Paper radius={10} key={k} bg={colors["white-trans-1"]}>
                  <Stack gap={'xs'}>
                    <Center>
                      <Image src={v.image} alt="" style={{ borderRadius: '14px 14px 0 0' }} />
                    </Center>
                    <Box px={'lg'}>
                      <Box>
                        <Text pb={10} c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                          {v.judul}
                        </Text>
                        <Text ta={'justify'} fz={'h4'}>{v.deskripsi}</Text>
                      </Box>
                      <Box py={15}>
                        <Button fw={'bold'} fz={'h5'} c={colors["blue-button"]} bg={colors["BG-trans"]}>Detail Program</Button>
                      </Box>
                      <Group py={20}>
                        <Group gap="xs">
                          <IconCalendar size={18} />
                          <Text size="sm">Selasa, 11 Januari 2025</Text>
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