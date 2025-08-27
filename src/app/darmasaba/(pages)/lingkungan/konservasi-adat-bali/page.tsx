import colors from '@/con/colors';
import { Box, Center, List, ListItem, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';

const data = [
  {
    id: 1,
    title: 'Filosofi Tri Hita Karana',
    listDeskripsi: (
      <List fz={'lg'} spacing="sm" ta={'justify'}>
        <ListItem>Parahyangan: Hubungan manusia dengan Tuhan yang dijaga penuh kesadaran spiritual</ListItem>
        <ListItem>Pawongan: Harmoni dan kerja sama antar manusia dalam masyarakat</ListItem>
        <ListItem>Palemahan: Pelestarian lingkungan dan hubungan manusia dengan alam</ListItem>
      </List>
    ),
  },
  {
    id: 2,
    title: 'Bentuk Konservasi Berdasarkan Adat',
    listDeskripsi: (
      <List fz={'lg'} spacing="sm" ta={'justify'}>
        <ListItem>Pelestarian Hutan Adat seperti Alas Pala Sangeh dan Wana Kerthi</ListItem>
        <ListItem>Subak: Sistem irigasi tradisional yang menekankan kebersamaan dan keberlanjutan</ListItem>
        <ListItem>Hari Raya Tumpek Uduh: Perayaan untuk menghormati pohon dan tumbuhan</ListItem>
        <ListItem>Perarem & Awig-Awig: Aturan adat untuk menjaga lingkungan dari kerusakan</ListItem>
        <ListItem>Ritual penyucian alam seperti Melasti dan Piodalan Segara</ListItem>
      </List>
    ),
  },
  {
    id: 3,
    title: 'Nilai Konservasi Adat',
    listDeskripsi: (
      <List fz={'lg'} spacing="sm" ta={'justify'}>
        <ListItem>Menjaga keseimbangan ekosistem dan lingkungan hidup</ListItem>
        <ListItem>Melestarikan spiritualitas lokal dan kesucian alam</ListItem>
        <ListItem>Meningkatkan kesadaran kolektif untuk hidup selaras dengan alam</ListItem>
        <ListItem>Menjamin keberlanjutan sumber daya alam untuk generasi mendatang</ListItem>
      </List>
    ),
  },
];

function Page() {
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="24">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={30}>
        <Text ta="center" fz={{ base: '2xl', md: '3rem' }} c={colors['blue-button']} fw="bold">
          Konservasi Adat Bali
        </Text>
        <Text px={20} ta="center" fz="lg" c="black">
          Pelestarian lingkungan di Bali yang berpijak pada kearifan lokal, menjaga harmoni antara alam, budaya, dan manusia.
        </Text>
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {data.map((item) => (
            <Paper
              key={item.id}
              p="lg"
              bg="linear-gradient(145deg, #DFE3E8FF 0%, #EFF1F4FF 100%)"
              style={{ borderRadius: 16, boxShadow: '0 0 20px rgba(28, 110, 164, 0.5)' }}
            >
              <Stack gap="md" px={20}>
                <Center>
                  <Text fz="xl" fw="bold" c="black">
                    {item.title}
                  </Text>
                </Center>
                {item.listDeskripsi}
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
