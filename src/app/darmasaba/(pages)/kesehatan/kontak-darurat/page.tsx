import colors from '@/con/colors';
import { Box, Center, List, ListItem, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconHospitalCircle, IconPhone, IconReport, IconReportMedical, IconSpeakerphone } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

const data1 = [
  {
    id: 1,
    judul: 'Layanan Medis Cepat',
    icon: <IconHospitalCircle size={80} color={colors["blue-button"]} />,
    deskripsi: <List>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Ambulans desa siap siaga 24 jam untuk keadaan darurat medis.</ListItem>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Pos kesehatan desa menyediakan layanan pertolongan pertama dan perawatan dasar.</ListItem>
    </List>
  },
  {
    id: 2,
    judul: 'Nomor Darurat',
    icon: <IconPhone size={80} color={colors["blue-button"]}/>,
    deskripsi: <List>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Ambulans: 08125651052</ListItem>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Pos Kesehatan: 08125651052</ListItem>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Pemadam Kebakaran: 113</ListItem>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Polisi: 110</ListItem>
    </List>
  },
  {
    id: 3,
    judul: 'Posko Kesehatan & Evakuasi',
    icon: <IconReportMedical size={80} color={colors["blue-button"]}/>,
    deskripsi: <List>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Ambulans desa siap siaga 24 jam untuk keadaan darurat medis.</ListItem>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Pos kesehatan desa menyediakan layanan pertolongan pertama dan perawatan dasar.</ListItem>
    </List>
  },
  {
    id: 4,
    judul: 'Pelatihan & Sosialisasi',
    icon: <IconSpeakerphone size={80} color={colors["blue-button"]}/>,
    deskripsi: <List>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Setiap bulan, desa mengadakan pelatihan P3K (Pertolongan Pertama pada Kecelakaan) bagi masyarakat.</ListItem>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Edukasi tentang tindakan saat bencana seperti gempa bumi dan banjir.</ListItem>
    </List>
  },
  {
    id: 5,
    judul: 'Sistem Laporan Kejadian',
    icon: <IconReport size={80} color={colors["blue-button"]}/>,
    deskripsi: <List>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Warga bisa melaporkan kejadian darurat melalui aplikasi desa atau menghubungi perangkat desa.</ListItem>
      <ListItem fz={{base: 'h4', md: 'lg'}}>Laporan akan segera ditindaklanjuti oleh tim penanganan darurat.</ListItem>
    </List>
  }
]

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Kontak Darurat
        </Text>
        <Text px={{base: 20, md: 150}} ta={"center"} fz={{ base: "h4", md: "h3" }} >
        Program kesehatan di Desa Darmasaba memiliki peran penting dalam meningkatkan kesejahteraan masyarakat. Kami berkomitmen untuk memberikan layanan darurat yang cepat, responsif, dan mudah diakses oleh seluruh warga.
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
                    <Center py={40}>
                      {v.icon}
                    </Center>
                    <Box px={'lg'}>
                      <Box pb={20}>
                        <Text pb={10} c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                          {v.judul}
                        </Text>
                        <Box px={10}>
                        {v.deskripsi}
                        </Box>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              )
            })}
          </SimpleGrid>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
